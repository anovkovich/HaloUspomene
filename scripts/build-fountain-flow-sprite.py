"""
Build a PNG sprite sheet of the fountain by interpolating between
fountain-1.webp and fountain-2.webp via dense optical flow.

Why this exists: the cinematic-fountain-from-mp4 sprite needed a 4 MB
green-screen mp4 and a non-trivial chroma-key pipeline; the AI-generated
v2 sprite lost temporal coherence (every frame's water was hallucinated
independently, so streams looked chunky and patched). Both fountain-1
and fountain-2 are already cleanly keyed at production quality — the
only thing they lack is motion. Optical flow fills in.

Pipeline:
  1. Read both webps (1024x1536 RGBA, identical dimensions).
  2. Compute dense optical flow F1->F2 and F2->F1 (Farnebäck, OpenCV).
  3. Sample N intermediate t in (0..1) and synthesize each frame by
       a) warping F1 forward by t * flow_forward
       b) warping F2 backward by (1-t) * flow_backward
       c) cross-fading the two warps with weights (1-t, t)
     Frame 0 = F1 verbatim. After the last sprite frame the CSS animation
     wraps back to frame 0 (= F1); we never emit F2 itself so the loop
     wraps via "(N-1)/N of the way back to F1" rather than a hard cut.
  4. Crop to the union alpha bbox, downscale, palette-quantize, write PNG.

Notes:
  * Farnebäck dense flow is computed on grayscale. The same flow field
    drives the warp on RGBA (water moving = all four channels moving).
  * cv2.remap with BORDER_TRANSPARENT keeps off-canvas warps as alpha=0
    so the fountain edges don't smear into garbage when flow points off
    the source frame.
  * The alpha channel is warped alongside RGB so partially-transparent
    water streams move correctly — without this, the water RGB would
    drift but its alpha would stay put, leaving fixed-position halos.
"""

import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import cv2

ROOT = Path(__file__).resolve().parent.parent
F1_PATH = ROOT / "public/images/premium/fountain/fountain-1.webp"
F2_PATH = ROOT / "public/images/premium/fountain/fountain-2.webp"
OUT_SPRITE = ROOT / "public/images/premium/fountain/fountain-sprite.png"

HALF_CYCLE_STOPS = 6     # Number of unique interpolation stops in one
                         # forward half-cycle (F1 -> F2). The emitted
                         # sprite is a ping-pong: forward stops 0..H-1,
                         # then reverse stops H-2..1 (endpoints not
                         # duplicated), so the eye sees water rise and
                         # fall in sync instead of jump-cutting back to
                         # F1 every loop.
DROP_F1_PHASE = True     # If True, drop the two frames closest to F1
                         # (the t=0 forward frame and the t=1/H reverse
                         # frame). F1 is the raw source asset and has
                         # visibly heavier water than the warped
                         # interpolated frames, so those endpoints stand
                         # out — every other frame looks "thinner" by
                         # comparison. Dropping them tightens the cycle
                         # to t = 1/H .. (H-1)/H .. 2/H.
FRAME_COUNT = (2 * HALF_CYCLE_STOPS - 2) - (2 if DROP_F1_PHASE else 0)
FRAME_HEIGHT = 480       # Px height of each cell after downscale.
PAD = 8                  # Transparent padding inside each cell.

# Farnebäck flow params. These defaults work well for slow-moving water
# at this resolution; raise iterations / poly_n if flow looks noisy.
FLOW_PYR_SCALE = 0.5
FLOW_LEVELS = 4
FLOW_WINSIZE = 31        # Larger window = smoother flow, less detail.
                         # 31 captures the broad water-column displacement
                         # without picking up speckle noise on individual
                         # droplets.
FLOW_ITERATIONS = 5
FLOW_POLY_N = 7
FLOW_POLY_SIGMA = 1.5
FLOW_FLAGS = cv2.OPTFLOW_FARNEBACK_GAUSSIAN

# Motion mask thresholds. Optical flow on its own happily warps the
# fountain's stone body alongside the water because subtle lighting
# differences between F1 and F2 read as motion vectors. We build a
# binary mask of pixels that ACTUALLY differ between the two frames
# and multiply the flow by it: stone (≈identical between frames) gets
# zero flow and stays put; water (large RGB diff) keeps its full flow.
MASK_DIFF_THRESHOLD = 40  # 0..255 RGB diff to count a pixel as "moving".
                          # F1 and F2 are AI-rendered so the stone has
                          # widespread per-pixel lighting noise. 40 is
                          # the sweet spot found empirically: catches
                          # ~17% of pixels initially, which after open()
                          # collapses to the genuine water cores.
MASK_OPEN_PX = 2          # Morphological-open kernel radius. Erodes
                          # then dilates by this radius, which deletes
                          # any speckle smaller than ~2*r — kills the
                          # scattered lighting-noise dots on the stone.
                          # Kept small so thin vertical water streams
                          # (1-3 px wide) survive the erosion step.
MASK_DILATE_PX = 8        # Grow the surviving (water) cores outward to
                          # cover the full visible water-column width
                          # plus a small halo for trailing droplets.
MASK_BLUR_PX = 8          # Gaussian blur radius. Soft boundary between
                          # masked and unmasked regions so flow doesn't
                          # show a hard "shoreline" where motion abruptly
                          # starts.


def load_rgba(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGBA")
    return np.array(im)  # H x W x 4, uint8


def motion_mask(f1: np.ndarray, f2: np.ndarray) -> np.ndarray:
    """Soft mask in [0,1] of pixels that actually differ between F1 and
    F2. Stone (≈identical) -> 0, water (large RGB delta) -> 1. Used to
    suppress flow vectors on static regions so warps don't drift the
    fountain body.

    Pipeline: threshold the RGB diff, then morphological-open to delete
    scattered lighting-noise specks on the stone, then dilate to grow
    the surviving water cores, then Gaussian blur to soften the
    boundary so flow doesn't show a hard shoreline."""
    diff = np.abs(f1[..., :3].astype(np.int16)
                  - f2[..., :3].astype(np.int16)).mean(axis=2)
    binary = (diff > MASK_DIFF_THRESHOLD).astype(np.uint8) * 255
    o = MASK_OPEN_PX
    open_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * o + 1, 2 * o + 1))
    opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, open_kernel)
    d = MASK_DILATE_PX
    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * d + 1, 2 * d + 1))
    dilated = cv2.dilate(opened, dilate_kernel)
    b = MASK_BLUR_PX
    blurred = cv2.GaussianBlur(dilated, (2 * b + 1, 2 * b + 1), 0) if b > 0 else dilated
    return blurred.astype(np.float32) / 255.0


def compute_flow(a_rgba: np.ndarray, b_rgba: np.ndarray) -> np.ndarray:
    """Dense optical flow A -> B computed on grayscale. Returns a
    HxWx2 float32 array where flow[y,x] = (dx, dy) tells you that
    pixel (x,y) in A ended up at (x+dx, y+dy) in B."""
    a_gray = cv2.cvtColor(a_rgba[..., :3], cv2.COLOR_RGB2GRAY)
    b_gray = cv2.cvtColor(b_rgba[..., :3], cv2.COLOR_RGB2GRAY)
    return cv2.calcOpticalFlowFarneback(
        a_gray, b_gray, None,
        FLOW_PYR_SCALE, FLOW_LEVELS, FLOW_WINSIZE, FLOW_ITERATIONS,
        FLOW_POLY_N, FLOW_POLY_SIGMA, FLOW_FLAGS,
    )


def warp(rgba: np.ndarray, flow: np.ndarray, t: float) -> np.ndarray:
    """Warp `rgba` by `t * flow`. cv2.remap expects the inverse map:
    `map[y,x] = source coord that lands at (x,y)`. Forward warping
    "by t*flow" means at the destination (x,y) we should fetch from
    (x - t*dx, y - t*dy), so we subtract the scaled flow from the
    identity grid.

    BORDER_TRANSPARENT preserves the destination's existing alpha for
    out-of-bounds samples, which here means alpha stays 0 since we
    start from a zero canvas."""
    h, w = rgba.shape[:2]
    xs, ys = np.meshgrid(np.arange(w, dtype=np.float32),
                         np.arange(h, dtype=np.float32))
    map_x = xs - t * flow[..., 0]
    map_y = ys - t * flow[..., 1]
    # Initialize destination as transparent black so BORDER_TRANSPARENT
    # has something to leave alone for off-canvas samples.
    dst = np.zeros_like(rgba)
    return cv2.remap(
        rgba, map_x, map_y,
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_TRANSPARENT,
        dst=dst,
    )


def synth_frame(f1: np.ndarray, f2: np.ndarray,
                flow_fwd: np.ndarray, flow_bwd: np.ndarray,
                t: float) -> np.ndarray:
    """Sintel-style frame interpolation. At t=0 we want F1 unchanged;
    at t=1 we'd want F2 unchanged. In between, warp both endpoints
    toward the time t and cross-fade by t."""
    if t <= 0.0:
        return f1.copy()
    if t >= 1.0:
        return f2.copy()
    w_fwd = warp(f1, flow_fwd, t)          # F1 moved t fraction toward F2
    w_bwd = warp(f2, -flow_bwd, 1.0 - t)   # F2 moved (1-t) fraction back toward F1
    # Negation: flow_bwd is F2->F1; warping F2 by t' * flow_bwd moves it
    # toward F1. We're already passing -flow_bwd into warp so the sign
    # matches the forward-warp convention used above.
    return ((1.0 - t) * w_fwd.astype(np.float32)
            + t * w_bwd.astype(np.float32)).clip(0, 255).astype(np.uint8)


def bbox_of_alpha(arr: np.ndarray, threshold: int = 16):
    a = arr[..., 3]
    rows = np.any(a > threshold, axis=1)
    cols = np.any(a > threshold, axis=0)
    if not rows.any() or not cols.any():
        return None
    y0, y1 = int(np.argmax(rows)), len(rows) - 1 - int(np.argmax(rows[::-1]))
    x0, x1 = int(np.argmax(cols)), len(cols) - 1 - int(np.argmax(cols[::-1]))
    return (x0, y0, x1 + 1, y1 + 1)


def main():
    if not F1_PATH.exists() or not F2_PATH.exists():
        print("ERROR: need both fountain-1.webp and fountain-2.webp")
        sys.exit(1)

    f1 = load_rgba(F1_PATH)
    f2 = load_rgba(F2_PATH)
    if f1.shape != f2.shape:
        print(f"ERROR: shape mismatch {f1.shape} vs {f2.shape}")
        sys.exit(1)
    h, w = f1.shape[:2]
    print(f"loaded F1 + F2: {w}x{h}")

    print("building motion mask (stone vs water)...")
    mask = motion_mask(f1, f2)
    print(f"  mask active fraction: {(mask > 0.5).mean() * 100:.1f}% of pixels")

    print("computing forward flow F1 -> F2...")
    flow_fwd = compute_flow(f1, f2) * mask[..., None]
    mag_fwd = np.linalg.norm(flow_fwd, axis=2)
    print(f"  flow magnitude (masked): mean {mag_fwd.mean():.2f}px, "
          f"max {mag_fwd.max():.2f}px, p95 {np.percentile(mag_fwd, 95):.2f}px")

    print("computing backward flow F2 -> F1...")
    flow_bwd = compute_flow(f2, f1) * mask[..., None]

    # Ping-pong stop sequence: 0, 1/H, ..., (H-1)/H, (H-2)/H, ..., 1/H.
    # Endpoints (t=0 and t=(H-1)/H) appear once each; intermediate
    # stops appear twice — once on the way up, once on the way back.
    # We deliberately stop the forward half at (H-1)/H rather than at
    # t=1 so the reverse half doesn't reach 0 again until the loop
    # wraps. Result: full ping-pong cycle is 2*H - 2 frames long.
    forward = [i / HALF_CYCLE_STOPS for i in range(HALF_CYCLE_STOPS)]
    backward = list(reversed(forward[1:-1]))
    ts = forward + backward
    if DROP_F1_PHASE:
        # Trim the two F1-adjacent endpoints. The cycle now lives in
        # the interior of [0, 1] — no frame shows raw F1's heavier
        # water phase.
        ts = ts[1:-1]
    assert len(ts) == FRAME_COUNT
    print(f"synthesizing {FRAME_COUNT} ping-pong frames at "
          f"t = {[round(x, 3) for x in ts]}")
    # Cache synthesis by t-value: backward half reuses the same warped
    # frames as the forward half, half the OpenCV work.
    cache: dict[float, np.ndarray] = {}
    frames: list[np.ndarray] = []
    for t in ts:
        key = round(t, 6)
        if key not in cache:
            cache[key] = synth_frame(f1, f2, flow_fwd, flow_bwd, t)
        frames.append(cache[key])

    # Union bbox across all frames so the crop is consistent — water
    # streams may extend slightly differently between frames after warp.
    bboxes = [bbox_of_alpha(fr) for fr in frames]
    bboxes = [b for b in bboxes if b is not None]
    x0 = min(b[0] for b in bboxes)
    y0 = min(b[1] for b in bboxes)
    x1 = max(b[2] for b in bboxes)
    y1 = max(b[3] for b in bboxes)
    print(f"union bbox: ({x0},{y0})..({x1},{y1})  size {x1-x0}x{y1-y0}")

    cropped = [Image.fromarray(fr[y0:y1, x0:x1]).convert("RGBA")
               for fr in frames]
    src_w, src_h = cropped[0].size
    scale = FRAME_HEIGHT / src_h
    target_w = max(1, int(round(src_w * scale)))
    print(f"per-frame {src_w}x{src_h} -> {target_w}x{FRAME_HEIGHT}")
    resized = [im.resize((target_w, FRAME_HEIGHT), Image.LANCZOS)
               for im in cropped]

    cell_w = target_w + 2 * PAD
    cell_h = FRAME_HEIGHT + 2 * PAD
    sheet_w = cell_w * FRAME_COUNT
    sheet = Image.new("RGBA", (sheet_w, cell_h), (0, 0, 0, 0))
    for i, im in enumerate(resized):
        sheet.paste(im, (i * cell_w + PAD, PAD), im)

    # Quantize to PNG-8 palette+alpha. The fountain has warm stone
    # tones + cool water highlights, 192 colors gives clean gradients.
    try:
        quantized = sheet.quantize(colors=192, method=Image.Quantize.LIBIMAGEQUANT)
    except Exception:
        quantized = sheet.quantize(colors=192, method=Image.Quantize.FASTOCTREE)
    quantized.save(OUT_SPRITE, "PNG", optimize=True)
    size_kb = os.path.getsize(OUT_SPRITE) / 1024
    print(f"\nwrote {OUT_SPRITE.relative_to(ROOT)}: "
          f"{sheet_w}x{cell_h}, {size_kb:.1f} KB")
    print(f"cell: {cell_w}x{cell_h}, frames: {FRAME_COUNT}")


if __name__ == "__main__":
    main()
