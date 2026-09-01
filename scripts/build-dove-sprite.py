"""
Build a PNG sprite sheet of the dove with clean per-frame alpha from dove.mp4.

Pipeline:
  1. ffmpeg extracts a downscaled PNG sequence with chroma key + despill applied
     (so we never load 4K RGB frames into Python memory).
  2. Pillow finds the union bbox across frames, crops uniformly, resizes,
     composes a horizontal sprite, saves an optimized PNG.

Why PNG sprite instead of animated WebP: per-frame alpha is independent and
lossless, so iOS Safari can't bleed compression artifacts across frames.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
MP4 = ROOT / "public/images/premium/fountain/dove.mp4"
OUT_SPRITE = ROOT / "public/images/premium/fountain/dove-sprite.png"
TMP_DIR = ROOT / ".dove-sprite-tmp"

FRAME_COUNT = 24         # Final number of frames in the sprite
WINDOW_START = 2.0       # Seconds into the source where flap candidates begin
WINDOW_DUR = 3.0         # Seconds of source captured — must contain enough
                         # cycles for the chosen STEP_SIZE_FRAMES
STEP_SIZE_FRAMES = 2     # Source frames skipped between consecutive sprite
                         # frames. Higher = more wing motion per step.
                         # 1 = max smoothness / tiny motion per step,
                         # 2 = ~60° wing change (sweet spot),
                         # 3 = ~90° wing change (dramatic)
EXTRACT_FPS = 30         # Source fps to extract within the window
EXTRACT_W = 480          # Width of each extracted frame
CHROMA_HEX = "0x00FF00"  # Green screen color
CHROMA_SIM = 0.30        # Similarity tolerance (0..1)
CHROMA_BLEND = 0.05      # Edge softness
DESPILL_MIX = 1.0        # 0..1, 1 = fully neutralize green spill
FRAME_HEIGHT = 240       # Px height per cell in final sprite
PAD = 8                  # Transparent padding inside each cell
LOOP_SEARCH_MIN = 12     # Min frame index to consider for loop closure
                         # (skip trivial near-frame-0 matches)

def run(cmd):
    print(">>", " ".join(str(c) for c in cmd))
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print("STDERR:", p.stderr[-2000:])
        sys.exit(p.returncode)

def extract_keyed_frames():
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    TMP_DIR.mkdir(parents=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    # chromakey produces yuva (alpha); despill cleans green tint at edges.
    # scale before chromakey to keep filter pipeline cheap; output PNG carries alpha.
    vf = (
        f"scale={EXTRACT_W}:-2:flags=lanczos,"
        f"chromakey={CHROMA_HEX}:{CHROMA_SIM}:{CHROMA_BLEND},"
        f"despill=type=green:mix={DESPILL_MIX}:expand=1.0,"
        f"fps={EXTRACT_FPS}"
    )
    out = TMP_DIR / "frame_%03d.png"
    run([
        ffmpeg, "-y",
        "-ss", str(WINDOW_START),
        "-t", str(WINDOW_DUR),
        "-i", str(MP4),
        "-vf", vf,
        "-vsync", "0",
        str(out),
    ])
    frames = sorted(TMP_DIR.glob("frame_*.png"))
    print(f"extracted {len(frames)} frames")
    return frames

def bbox_of_alpha(im: Image.Image, threshold: int = 16):
    a = np.array(im.split()[3])
    rows = np.any(a > threshold, axis=1)
    cols = np.any(a > threshold, axis=0)
    if not rows.any() or not cols.any():
        return None
    y0, y1 = int(np.argmax(rows)), len(rows) - 1 - int(np.argmax(rows[::-1]))
    x0, x1 = int(np.argmax(cols)), len(cols) - 1 - int(np.argmax(cols[::-1]))
    return (x0, y0, x1 + 1, y1 + 1)

SEARCH_RADIUS_PX = 60    # Pixels in each direction to search when template-
                         # matching the body across frames. Must exceed the
                         # actual body translation across the source window.
EROSION_RADIUS_PX = 20   # Erosion radius for the body mask. Must be > wing
                         # thickness AT ITS THICKEST POINT (wing roots near
                         # the body) so the eroded mask is body-only with
                         # zero wing remnants — but small enough that the
                         # body itself survives (body width > 2*R).

def erode_alpha(frame: Image.Image, radius: int = EROSION_RADIUS_PX) -> np.ndarray:
    """Return the eroded alpha channel as a numpy array. Erosion eats any
    feature thinner than 2*radius pixels — wings disappear entirely, only
    the body blob survives."""
    alpha = frame.split()[3]
    eroded = alpha.filter(ImageFilter.MinFilter(2 * radius + 1))
    return np.array(eroded)

def make_body_template(eroded_alpha: np.ndarray, pad: int = 4):
    """Take the bbox of the eroded (body-only) mask as the template.
    Padding adds a few background pixels so the matcher can lock onto the
    body OUTLINE, not just any opaque region."""
    mask = eroded_alpha > 64
    if not mask.any():
        return None, None
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    y0 = int(np.argmax(rows))
    y1 = len(rows) - int(np.argmax(rows[::-1]))
    x0 = int(np.argmax(cols))
    x1 = len(cols) - int(np.argmax(cols[::-1]))
    # Pad slightly to include background context around the body
    x0p = max(0, x0 - pad)
    y0p = max(0, y0 - pad)
    x1p = min(eroded_alpha.shape[1], x1 + pad)
    y1p = min(eroded_alpha.shape[0], y1 + pad)
    template = eroded_alpha[y0p:y1p, x0p:x1p].astype(np.int16)
    return template, (x0p, y0p)

def find_body_offset(template: np.ndarray, t_anchor, eroded_alpha: np.ndarray,
                     search_r: int = SEARCH_RADIUS_PX):
    """Slide the body-only template across the eroded alpha of another frame
    and find the offset that minimizes L1 distance. Since both template and
    search image are body-only (wings already eroded away), the matching is
    deterministically locked to the body — wing motion can't influence it."""
    th, tw = template.shape
    H, W = eroded_alpha.shape
    tx, ty = t_anchor
    src = eroded_alpha.astype(np.int16)
    best = (0, 0, float("inf"))
    for dy in range(-search_r, search_r + 1):
        y = ty + dy
        if y < 0 or y + th > H:
            continue
        for dx in range(-search_r, search_r + 1):
            x = tx + dx
            if x < 0 or x + tw > W:
                continue
            d = int(np.abs(src[y:y + th, x:x + tw] - template).sum())
            if d < best[2]:
                best = (dx, dy, d)
    return best[0], best[1]

def stabilize(frames, debug_dir: Path = None):
    """Body-locked stabilization via erosion + template matching.

    Step 1: Erode every frame's alpha. Wings (thin features) vanish; only
            the body blob survives.
    Step 2: Use frame 0's eroded body as a template.
    Step 3: For each subsequent frame, slide that template across the
            frame's eroded alpha; the offset minimizing L1 distance is
            where the body lives in that frame.
    Step 4: Apply that offset to the ORIGINAL (un-eroded) frame so the
            sprite still contains full wing detail.

    Why this can't fail the way shape-statistic anchors did: wing pixels
    are not present in either template or search image. The matcher
    literally cannot lock onto them. It can only see the body."""
    if not frames:
        return frames
    print(f"  eroding {len(frames)} frames at radius {EROSION_RADIUS_PX}px...")
    eroded = [erode_alpha(f) for f in frames]
    template, t_anchor = make_body_template(eroded[0])
    if template is None:
        print("  WARN: erosion ate frame 0 entirely — falling back to no stabilization")
        return frames
    print(f"  body template: {template.shape[1]}x{template.shape[0]}px at {t_anchor}")
    out = [frames[0]]
    offsets = [(0, 0)]
    for i, e in enumerate(eroded[1:], start=1):
        dx, dy = find_body_offset(template, t_anchor, e)
        offsets.append((dx, dy))
        canvas = Image.new("RGBA", frames[i].size, (0, 0, 0, 0))
        # Apply offset to the ORIGINAL frame (not eroded) so wing detail
        # survives in the sprite output.
        canvas.paste(frames[i], (-dx, -dy), frames[i])
        out.append(canvas)
    xs = [o[0] for o in offsets]
    ys = [o[1] for o in offsets]
    print(f"  body drift X: {min(xs)}..{max(xs)} (span {max(xs)-min(xs)} px)")
    print(f"  body drift Y: {min(ys)}..{max(ys)} (span {max(ys)-min(ys)} px)")
    if debug_dir:
        debug_dir.mkdir(parents=True, exist_ok=True)
        for i, (im, (dx, dy)) in enumerate(zip(out, offsets)):
            im.save(debug_dir / f"stab_{i:03d}_dx{dx:+04d}_dy{dy:+04d}.png")
        # Also save the body template + first eroded frame for inspection
        Image.fromarray(template.astype(np.uint8)).save(debug_dir / "_template.png")
        Image.fromarray(eroded[0]).save(debug_dir / "_eroded_frame0.png")
        print(f"  debug: wrote stabilized frames + template to {debug_dir}")
    return out

def find_loop_end(frames, min_idx: int = LOOP_SEARCH_MIN):
    """Find the candidate frame whose alpha silhouette best matches frame 0,
    excluding trivially-close-to-zero indexes. That's the natural end of one
    wing-flap cycle: frame 0 and frame K look identical, so the sprite loops
    seamlessly without a visible jump back to the start."""
    ref_a = np.array(frames[0].split()[3]).astype(np.int16)
    best_i, best_d = None, float("inf")
    scores = []
    for i in range(min_idx, len(frames) - 1):
        a = np.array(frames[i].split()[3]).astype(np.int16)
        # Mean absolute difference on the alpha channel — wings open vs.
        # wings closed produce very different silhouettes.
        d = np.abs(a - ref_a).mean()
        scores.append((i, d))
        if d < best_d:
            best_i, best_d = i, d
    # Find all local minima (candidate cycle ends): score lower than both
    # immediate neighbors. The smallest local minimum is the natural cycle.
    minima = []
    for k in range(1, len(scores) - 1):
        if scores[k][1] < scores[k - 1][1] and scores[k][1] < scores[k + 1][1]:
            minima.append(scores[k])
    print(f"  loop-closure scan ({len(scores)} candidates, indexes {min_idx}..{len(frames)-2}):")
    for i, d in scores:
        marker = "  <- local min" if (i, d) in minima else ""
        marker = "  <- BEST GLOBAL" if i == best_i else marker
        print(f"    idx {i:3d}  alpha-diff {d:6.2f}{marker}")
    print(f"  best loop closure: idx {best_i} (diff {best_d:.2f})")
    if minima:
        print(f"  local minima (likely cycle ends): {[m[0] for m in minima]}")
    return best_i

def main():
    print(f"source: {MP4}")
    if not MP4.exists():
        print("ERROR: dove.mp4 not found")
        sys.exit(1)
    paths = extract_keyed_frames()

    # Load ALL candidates so we can stabilize + auto-detect loop closure.
    candidates = [Image.open(p).convert("RGBA") for p in paths]
    print(f"loaded {len(candidates)} candidate frames")

    # Stabilize: translate every candidate so its body matches frame 0's
    # body position. Template matching ignores wing pixels and finds the
    # body to ±1 px — the sprite cell shows only wing motion, while
    # framer-motion handles screen-level translation later.
    debug_dir = ROOT / ".dove-sprite-debug" if "--debug" in sys.argv else None
    candidates = stabilize(candidates, debug_dir=debug_dir)

    # Auto-detect the natural end of one wing-flap cycle.
    cycle_len = find_loop_end(candidates)
    if cycle_len is None:
        print("WARN: no loop closure found, falling back to full window")
        span = len(candidates) - 1
    else:
        # Choose a span = integer × cycle_len so the sprite loops cleanly.
        # Spacing target: FRAME_COUNT samples should land STEP_SIZE_FRAMES
        # apart in source — that controls how much wing motion happens
        # between consecutive sprite frames.
        target_span = FRAME_COUNT * STEP_SIZE_FRAMES
        cycles = max(1, round(target_span / cycle_len))
        span = cycle_len * cycles
        if span >= len(candidates):
            # Source ran out — shrink to as many cycles as we have.
            cycles = max(1, (len(candidates) - 1) // cycle_len)
            span = cycle_len * cycles
            print(f"  WARN: not enough candidates; using {cycles} cycle(s)")
        actual_step = span / FRAME_COUNT
        print(f"  natural cycle = {cycle_len}f; target step = {STEP_SIZE_FRAMES}f; "
              f"using {cycles} cycles (span 0..{span}, real step ~ {actual_step:.2f}f)")

    # Sample FRAME_COUNT evenly from [0..span]. We deliberately stop one
    # step short of span so the last sprite frame is NOT the closure frame
    # itself — that way after the last step the animation snaps back to
    # frame 0, which already matches the (unshown) closure pose. Result:
    # visually seamless loop with no duplicate frame.
    idxs = np.linspace(0, span, FRAME_COUNT + 1, dtype=int)[:-1]
    sampled = [candidates[i] for i in idxs]
    print(f"sampled indexes (cycle [0..{span}]): {list(idxs)}")

    # Union bounding box across all sampled frames.
    bboxes = [bbox_of_alpha(f) for f in sampled]
    bboxes = [b for b in bboxes if b is not None]
    if not bboxes:
        print("ERROR: every frame is fully transparent after chroma key")
        sys.exit(1)
    x0 = min(b[0] for b in bboxes)
    y0 = min(b[1] for b in bboxes)
    x1 = max(b[2] for b in bboxes)
    y1 = max(b[3] for b in bboxes)
    print(f"union bbox: ({x0},{y0})..({x1},{y1}) size {x1-x0}x{y1-y0}")

    cropped = [im.crop((x0, y0, x1, y1)) for im in sampled]

    src_w, src_h = cropped[0].size
    scale = FRAME_HEIGHT / src_h
    target_w = max(1, int(round(src_w * scale)))
    print(f"per-frame {src_w}x{src_h} -> {target_w}x{FRAME_HEIGHT}")
    resized = [im.resize((target_w, FRAME_HEIGHT), Image.LANCZOS) for im in cropped]

    cell_w = target_w + 2 * PAD
    cell_h = FRAME_HEIGHT + 2 * PAD
    sheet_w = cell_w * FRAME_COUNT
    sheet = Image.new("RGBA", (sheet_w, cell_h), (0, 0, 0, 0))
    for i, im in enumerate(resized):
        sheet.paste(im, (i * cell_w + PAD, PAD), im)

    # Quantize to palette+alpha PNG (Pillow's libimagequant adaptive quantizer
    # — same algorithm pngquant uses). The dove is near-monochrome (white/grey
    # against transparent), so a 96-color palette is plenty.
    # Quantize RGBA: libimagequant is best (matches pngquant) but requires
    # Pillow built with that extension; FASTOCTREE works on any RGBA build.
    try:
        quantized = sheet.quantize(colors=96, method=Image.Quantize.LIBIMAGEQUANT)
    except Exception:
        quantized = sheet.quantize(colors=128, method=Image.Quantize.FASTOCTREE)
    quantized.save(OUT_SPRITE, "PNG", optimize=True)
    size_kb = os.path.getsize(OUT_SPRITE) / 1024
    print(f"\nwrote {OUT_SPRITE.relative_to(ROOT)}: {sheet_w}x{cell_h}, {size_kb:.1f} KB")
    print(f"cell: {cell_w}x{cell_h}, frames: {FRAME_COUNT}")
    print(f"\n--- CSS ---")
    print(f".dove {{")
    print(f"  width: {cell_w}px;")
    print(f"  height: {cell_h}px;")
    print(f"  background: url(/images/premium/fountain/dove-sprite.png) 0 0 / {sheet_w}px {cell_h}px no-repeat;")
    print(f"  animation: dove-flap 0.9s steps({FRAME_COUNT}) infinite;")
    print(f"}}")
    print(f"@keyframes dove-flap {{ to {{ background-position: -{sheet_w}px 0; }} }}")

    # Cleanup tmp PNGs.
    shutil.rmtree(TMP_DIR, ignore_errors=True)

if __name__ == "__main__":
    main()
