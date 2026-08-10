import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * QR pano dobrodošlice — B1 portrait (707 x 1000 mm) welcome sign.
 *
 * Shared by all three products (venčanje / samostalni događaj / rođendan +
 * punoletstvo). The products differ only in the copy and the accent colour
 * they pass in; everything that makes the sign recognisably HALO Uspomene
 * lives here and never varies:
 *
 *   - cream field (#F5F4DC) instead of the usual white
 *   - the ring burst from the logo's telephone O, drawn as plain lines
 *   - a fine rule broken by an accent lozenge, instead of a clip-art heart
 *   - the QR on a white card, with the domain set small underneath
 *
 * Two design variants:
 *   "poster" — editorial. Names in Cormorant caps at billboard scale, the
 *              couple's script font surviving only as the "&" and as a huge
 *              translucent glyph behind the block.
 *   "arch"   — romantic. A full-height arch in the accent colour (the shape of
 *              the doorway the sign stands in), names in the script font.
 */

type RGB = [number, number, number];

/* ── Canvas ──────────────────────────────────────────────────────────────── */

const W = 707;
const H = 1000;
const CX = W / 2;

/** Brand constants — identical on every sign, in every theme. */
const CREAM: RGB = [245, 244, 220]; // #F5F4DC
const CHARCOAL: RGB = [35, 35, 35]; // #232323
const WHITE: RGB = [255, 255, 255];

const FONT_DIR = "/fonts/invitation";
const SERIF_FILE = "CormorantGaramond-Regular.ttf";
const SERIF_ITALIC_FILE = "CormorantGaramond-Italic.ttf";
const SANS_FILE = "JosefinSans-Regular.ttf";

/** Footer zone reserved below the content column: just the domain, no strip. */
const FOOTER_H = 40;
const FOOTER_Y = H - FOOTER_H;

/** QR card. */
const CARD = 290;
const QR = 256;

/** Ring burst geometry: rays run from `BURST_INNER` to `BURST_OUTER` radius. */
const BURST_INNER = 40;
const BURST_OUTER = 55;
/** How far the lowest ray tip (the 50° one) falls below the burst's centre. */
const BURST_INNER_DROP = BURST_INNER * Math.sin((50 * Math.PI) / 180);

/** Cap height of Cormorant at `pt`, in mm. */
function capHeight(pt: number): number {
  return pt * 0.3528 * 0.7;
}

export type WelcomeSignVariant = "poster" | "arch";

/**
 * Both designs ship. Weddings and standalone events get one file per variant so
 * the couple can print whichever they prefer; birthdays pass ["poster"] only.
 */
export const WELCOME_SIGN_VARIANTS: WelcomeSignVariant[] = ["poster", "arch"];

/** Loads an asset from `path` and returns raw base64 (no data: prefix). */
export type AssetLoader = (path: string) => Promise<string>;

export interface WelcomeSignHero {
  /** The name that carries the sign — couple's first name, event name, honoree. */
  primary: string;
  /** Middle line: the wedding "&", or "slavi 5. rođendan" for a birthday. */
  middle?: string;
  /** Second name — weddings only. */
  secondary?: string;
  /** Oversized translucent glyph behind the block ("&", or the age numeral). */
  ghost?: string;
  /** Poster variant: set the primary line in the accent colour, not charcoal. */
  primaryAccent?: boolean;
}

export interface WelcomeSignInput {
  variant: WelcomeSignVariant;
  /** Absolute URL the QR resolves to. */
  qrUrl: string;
  /** Eyebrow, already upper-cased by the caller. */
  eyebrow: string;
  hero: WelcomeSignHero;
  /** The guest's own question — "Gde sedim?". */
  hook: string;
  instruction: string;
  /** Theme primary as hex. The only colour that varies between signs. */
  accent: string;
  /** Script/display .ttf filename in /fonts/invitation. */
  scriptFontFile: string;
  /** Josefin Sans has no Cyrillic — body text falls back to Cormorant. */
  cyrillic?: boolean;
  fileName: string;
  /** Node/preview override; defaults to fetching from the public dir. */
  assets?: AssetLoader;
  /** Resolve with the PDF bytes instead of triggering a browser download. */
  returnBytes?: boolean;
}

/* ── Colour + asset helpers ──────────────────────────────────────────────── */

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Flattens `color` against the cream field at `opacity`. */
function onCream(color: RGB, opacity: number): RGB {
  return [
    Math.round(color[0] * opacity + CREAM[0] * (1 - opacity)),
    Math.round(color[1] * opacity + CREAM[1] * (1 - opacity)),
    Math.round(color[2] * opacity + CREAM[2] * (1 - opacity)),
  ];
}

function relativeLuminance([r, g, b]: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Some theme primaries — Luxury Gold above all — are nearly as light as the
 * cream field, and a name set in them dies at three metres in a dim foyer.
 * Darken until the accent carries, keeping its hue.
 */
function readableAccent(c: RGB): RGB {
  let out = c;
  for (let k = 1; contrast(out, CREAM) < 3.2 && k > 0.3; k -= 0.05) {
    out = [
      Math.round(c[0] * k),
      Math.round(c[1] * k),
      Math.round(c[2] * k),
    ];
  }
  return out;
}

const browserAsset: AssetLoader = async (path) => {
  const res = await fetch(path);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

/* ── Brand marks ─────────────────────────────────────────────────────────── */

/**
 * One ray of the ring burst, drawn as a filled six-point polygon so it tapers
 * to a point at both ends — the logo's dashes are pointed, not round-capped.
 * Full width is held between 18% and 82% of the length.
 */
function drawBurstRay(
  doc: jsPDF,
  cx: number,
  cy: number,
  deg: number,
  inner: number,
  length: number,
  width: number,
) {
  const rad = (deg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = -Math.sin(rad); // page y grows downward
  const nx = -uy;
  const ny = ux;
  const hw = width / 2;

  const at = (t: number, side: number): [number, number] => [
    cx + (inner + length * t) * ux + side * hw * nx,
    cy + (inner + length * t) * uy + side * hw * ny,
  ];

  const pts: [number, number][] = [
    at(0, 0),
    at(0.18, 1),
    at(0.82, 1),
    at(1, 0),
    at(0.82, -1),
    at(0.18, -1),
  ];

  const deltas: number[][] = [];
  for (let i = 1; i < pts.length; i++) {
    deltas.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  }
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "F", true);
}

/**
 * The ring burst from the logo — the dashes that show the telephone ringing.
 * Measured off public/images/logo.png: FIVE rays at 50°/70°/90°/110°/130°,
 * and short — their length is ~0.37 of the inner radius they start from.
 */
function drawRingBurst(doc: jsPDF, cx: number, cy: number, color: RGB) {
  doc.setFillColor(...color);
  const inner = BURST_INNER;
  const length = BURST_OUTER - BURST_INNER;
  for (const deg of [50, 70, 90, 110, 130]) {
    drawBurstRay(doc, cx, cy, deg, inner, length, 2.3);
  }
}

/**
 * Draws SVG path data at (x0, y0). Supports M/m L/l C/c Z/z only — every curve
 * in the ornament below is already expressed as cubics, so nothing else is
 * needed. jsPDF's lines() wants each segment's points relative to the current
 * point, which is what the conversion here produces.
 */
function drawSvgPath(
  doc: jsPDF,
  d: string,
  x0: number,
  y0: number,
  style: "F" | "S",
) {
  const tokens = d.match(/[MmLlCcZz]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let cmd = "";
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let segs: number[][] = [];
  let anchor: [number, number] | null = null;

  const flush = (close: boolean) => {
    if (anchor && segs.length) {
      doc.lines(segs, x0 + anchor[0], y0 + anchor[1], [1, 1], style, close);
    }
    segs = [];
    anchor = null;
  };
  const num = () => parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/[MmLlCcZz]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "Z" || cmd === "z") {
      flush(true);
      cx = startX;
      cy = startY;
      cmd = "";
      continue;
    }
    if (cmd === "M" || cmd === "m") {
      const rel = cmd === "m";
      const nx = rel ? cx + num() : num();
      const ny = rel ? cy + num() : num();
      flush(false);
      cx = startX = nx;
      cy = startY = ny;
      anchor = [nx, ny];
      cmd = rel ? "l" : "L";
    } else if (cmd === "L" || cmd === "l") {
      const rel = cmd === "l";
      const nx = rel ? cx + num() : num();
      const ny = rel ? cy + num() : num();
      segs.push([nx - cx, ny - cy]);
      cx = nx;
      cy = ny;
    } else if (cmd === "C" || cmd === "c") {
      const rel = cmd === "c";
      const pts: number[] = [];
      for (let k = 0; k < 3; k++) {
        const px = rel ? cx + num() : num();
        const py = rel ? cy + num() : num();
        pts.push(px, py);
      }
      segs.push([
        pts[0] - cx,
        pts[1] - cy,
        pts[2] - cx,
        pts[3] - cy,
        pts[4] - cx,
        pts[5] - cy,
      ]);
      cx = pts[4];
      cy = pts[5];
    } else {
      break;
    }
  }
  flush(false);
}

type OrnamentRole = "charcoal" | "rule" | "accent";

interface OrnamentPath {
  d: string;
  style: "F" | "S";
  role: OrnamentRole;
  /** Stroke width in mm; ignored for fills. */
  width?: number;
}

/**
 * The divider: an engraver's rule set. A ring on the centre line — the halo the
 * brand is named for, and a wedding band besides — flanked by a smaller ring
 * on each side, with a swelled rule (thickest mid-span, tapering to a point at both
 * ends, as a letterpress rule does) running out to a terminal dot on each side.
 * Centred on (0, 0), y downward, 413 mm wide and ~13 mm tall. The mass is
 * charcoal and the accent carries only the small parts, so the ornament reads
 * the same whether the theme primary is pale gold or near-black navy.
 */
const DIVIDER: OrnamentPath[] = [
  {
    d: "M 25,0 C 70,-1.2 140,-1.2 200,0 C 140,1.2 70,1.2 25,0 Z",
    style: "F",
    role: "rule",
  },
  {
    d: "M -25,0 C -70,-1.2 -140,-1.2 -200,0 C -140,1.2 -70,1.2 -25,0 Z",
    style: "F",
    role: "rule",
  },
  {
    d: "M 19.8,0 C 19.8,1.546 18.546,2.8 17,2.8 C 15.454,2.8 14.2,1.546 14.2,0 C 14.2,-1.546 15.454,-2.8 17,-2.8 C 18.546,-2.8 19.8,-1.546 19.8,0 Z",
    style: "S",
    role: "accent",
    width: 1,
  },
  {
    d: "M -19.8,0 C -19.8,1.546 -18.546,2.8 -17,2.8 C -15.454,2.8 -14.2,1.546 -14.2,0 C -14.2,-1.546 -15.454,-2.8 -17,-2.8 C -18.546,-2.8 -19.8,-1.546 -19.8,0 Z",
    style: "S",
    role: "accent",
    width: 1,
  },
  {
    d: "M 6,0 C 6,3.31 3.31,6 0,6 C -3.31,6 -6,3.31 -6,0 C -6,-3.31 -3.31,-6 0,-6 C 3.31,-6 6,-3.31 6,0 Z",
    style: "S",
    role: "charcoal",
    width: 1.8,
  },
  {
    d: "M 206.6,0 C 206.6,0.88 205.88,1.6 205,1.6 C 204.12,1.6 203.4,0.88 203.4,0 C 203.4,-0.88 204.12,-1.6 205,-1.6 C 205.88,-1.6 206.6,-0.88 206.6,0 Z",
    style: "F",
    role: "accent",
  },
  {
    d: "M -203.4,0 C -203.4,0.88 -204.12,1.6 -205,1.6 C -205.88,1.6 -206.6,0.88 -206.6,0 C -206.6,-0.88 -205.88,-1.6 -205,-1.6 C -204.12,-1.6 -203.4,-0.88 -203.4,0 Z",
    style: "F",
    role: "accent",
  },
];

function drawDivider(doc: jsPDF, cx: number, y: number, accent: RGB, rule: RGB) {
  for (const p of DIVIDER) {
    const color = p.role === "accent" ? accent : p.role === "rule" ? rule : CHARCOAL;
    if (p.style === "F") doc.setFillColor(...color);
    else {
      doc.setDrawColor(...color);
      doc.setLineWidth(p.width ?? 0.7);
    }
    drawSvgPath(doc, p.d, cx, y, p.style);
  }
}

/** White card carrying the QR, tucked into the footer band. */
async function drawQrCard(
  doc: jsPDF,
  qrUrl: string,
  x: number,
  y: number,
  card: number,
  qr: number,
) {
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...onCream(CHARCOAL, 0.25));
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, card, card, 8, 8, "FD");

  try {
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 2048,
      margin: 1,
      color: { dark: "#232323", light: "#ffffff" },
    });
    const inset = (card - qr) / 2;
    doc.addImage(dataUrl, "PNG", x + inset, y + inset, qr, qr);
  } catch {
    // QR failed — the rest of the sign is still worth printing.
  }
}

/** The domain, set small and centred straight on the cream. No strip. */
function drawFooter(doc: jsPDF) {
  // Same manual centring as centerLine — jsPDF's own is wrong with charSpace.
  const url = "halouspomene.rs";
  const charSpace = 0.9;
  doc.setFont("Sans");
  doc.setFontSize(17);
  doc.setTextColor(...CHARCOAL);
  const width = doc.getTextWidth(url) + charSpace * (url.length - 1);
  doc.text(url, CX - width / 2, FOOTER_Y + 14, { charSpace });
}

/* ── Type helpers ────────────────────────────────────────────────────────── */

/** Largest size in [minPt, startPt] at which `text` fits `maxWidth`. */
function fitSize(
  doc: jsPDF,
  text: string,
  font: string,
  startPt: number,
  minPt: number,
  maxWidth: number,
  charSpace = 0,
): number {
  doc.setFont(font);
  let size = startPt;
  while (size > minPt) {
    doc.setFontSize(size);
    const width =
      doc.getTextWidth(text) + charSpace * Math.max(0, text.length - 1);
    if (width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

interface LineOpts {
  charSpace?: number;
  minPt?: number;
  maxWidth?: number;
}

/**
 * Centred, auto-shrinking single line. Returns the size actually used.
 *
 * Deliberately does NOT use jsPDF's `align: "center"`: its width calculation
 * mishandles `charSpace`, which pushed the tracked eyebrow 21 mm off centre and
 * the tracked names ~1.5 mm. The ink width is measured here instead — glyph
 * advances plus one gap BETWEEN each pair of characters, none after the last —
 * and the line is drawn left-aligned from the resulting start point.
 */
function centerLine(
  doc: jsPDF,
  text: string,
  y: number,
  sizePt: number,
  font: string,
  color: RGB,
  opts: LineOpts = {},
): number {
  const charSpace = opts.charSpace ?? 0;
  const maxWidth = opts.maxWidth ?? 590;
  const size = fitSize(
    doc,
    text,
    font,
    sizePt,
    opts.minPt ?? Math.round(sizePt * 0.55),
    maxWidth,
    charSpace,
  );
  doc.setFont(font);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const width =
    doc.getTextWidth(text) + charSpace * Math.max(0, text.length - 1);
  doc.text(text, CX - width / 2, y, { charSpace });
  return size;
}

/** Oversized translucent glyph sitting behind the name block. */
function drawGhost(
  doc: jsPDF,
  text: string,
  y: number,
  sizePt: number,
  accent: RGB,
) {
  const gs = doc.GState({ opacity: 0.08 });
  doc.setGState(gs);
  doc.setFont("Script");
  doc.setFontSize(sizePt);
  doc.setTextColor(...accent);
  doc.text(text, CX, y, { align: "center" });
  doc.setGState(doc.GState({ opacity: 1 }));
}

/* ── Variants ────────────────────────────────────────────────────────────── */

interface Ctx {
  doc: jsPDF;
  accent: RGB;
  body: string;
  hero: WelcomeSignHero;
  eyebrow: string;
  hook: string;
  instruction: string;
}

/**
 * "Halo poster" — charcoal Didone caps at billboard scale on cream, one accent
 * colour, script demoted to an accent glyph.
 */
function layoutPoster(ctx: Ctx) {
  const { doc, accent, body, hero } = ctx;
  const lines = 1 + (hero.middle ? 1 : 0) + (hero.secondary ? 1 : 0);

  const primaryPt = lines === 3 ? 170 : 190;
  const isAmp = hero.middle?.trim() === "&";

  // Every element is placed by its gap to the one above, the column's height is
  // measured, and the whole thing is centred between the sheet's top edge and
  // the footer strip. A one-line sign therefore rises as a block — top and
  // bottom margins always come out equal, whatever the product.
  let y = BURST_OUTER; // ink top -> burst centre
  const yBurst = y;
  y += 26;
  const yEyebrow = y;
  y += 78 + capHeight(primaryPt);
  const yPrimary = y;
  y += lines === 3 ? 82 : 108;
  const yMiddle = y;
  y += 110;
  const ySecondary = y;
  y = (lines === 3 ? ySecondary : lines === 2 ? yMiddle : yPrimary) + 58;
  const yDivider = y;
  y += 70;
  const yHook = y;
  y += 46;
  const yInstruction = y;
  y += 28;
  const yCard = y;

  const shift = (FOOTER_Y - (yCard + CARD)) / 2;

  drawRingBurst(doc, CX, yBurst + shift, CHARCOAL);
  centerLine(doc, ctx.eyebrow, yEyebrow + shift, 34, body, CHARCOAL, {
    charSpace: 3.2,
    minPt: 22,
    maxWidth: 560,
  });

  if (hero.ghost) {
    // Caveat's numerals sit far smaller in the em than a script "&", so the
    // age ghost is set larger to occupy the same optical area. Both hang below
    // their baseline, hence the push upward to centre them on the name block.
    const digits = /^\d+$/.test(hero.ghost);
    const size = fitSize(doc, hero.ghost, "Script", digits ? 700 : 560, 360, 340);
    const blockTop = yPrimary - capHeight(primaryPt);
    const blockBottom = lines === 3 ? ySecondary : lines === 2 ? yMiddle : yPrimary;
    const centre = (blockTop + blockBottom) / 2;
    drawGhost(doc, hero.ghost, centre + (digits ? 44.5 : 41.5) + shift, size, accent);
  }

  centerLine(
    doc,
    hero.primary.toUpperCase(),
    yPrimary + shift,
    primaryPt,
    "Serif",
    hero.primaryAccent ? accent : CHARCOAL,
    { charSpace: 1.5, minPt: 90 },
  );

  if (hero.middle) {
    // The wedding "&" is the one place the couple's script font survives.
    centerLine(
      doc,
      hero.middle,
      yMiddle + shift,
      isAmp ? 110 : 90,
      "Script",
      isAmp ? accent : CHARCOAL,
      { minPt: 50 },
    );
  }

  if (hero.secondary) {
    centerLine(
      doc,
      hero.secondary.toUpperCase(),
      ySecondary + shift,
      170,
      "Serif",
      CHARCOAL,
      { charSpace: 1.5, minPt: 90 },
    );
  }

  drawDivider(doc, CX, yDivider + shift, accent, onCream(CHARCOAL, 0.55));

  centerLine(doc, ctx.hook, yHook + shift, 84, "SerifItalic", accent, {
    minPt: 54,
  });
  centerLine(doc, ctx.instruction, yInstruction + shift, 46, body, CHARCOAL, {
    minPt: 30,
  });

  return { cardX: CX - CARD / 2, cardY: yCard + shift, card: CARD, qr: QR };
}

/**
 * "Ulaz" — a full-height arch in the accent colour, the shape of the doorway
 * the sign stands in. Script-led and symmetrical.
 */
const ARCH_R = 250;
const ARCH_APEX = 330;
/** Top of the arch's crown. */
const ARCH_TOP = ARCH_APEX - ARCH_R;

function layoutArch(ctx: Ctx) {
  const { doc, accent, body, hero } = ctx;

  // The burst sits just above the crown, the way it sits above the handset in
  // the logo. Its lowest ink is the inner tip of the 50° ray, so place the
  // centre such that that tip clears the arc by 8 mm.
  drawRingBurst(doc, CX, ARCH_TOP - 8 + BURST_INNER_DROP, CHARCOAL);

  // Legs run all the way into the footer strip so the doorway reads as standing
  // on something rather than stopping in mid-air.
  drawArch(doc, ARCH_R, ARCH_APEX, H, 2.2, accent);
  drawArch(doc, ARCH_R - 14, ARCH_APEX, H, 0.9, onCream(accent, 0.55));

  // The eyebrow breaks onto two lines here — "DOBRODOŠLI" / "NA VENČANJE" —
  // because the arch is narrower than the sheet and a stacked pair sits better
  // under the crown than one long tracked line.
  const space = ctx.eyebrow.indexOf(" ");
  const eyebrow =
    space > 0
      ? [ctx.eyebrow.slice(0, space), ctx.eyebrow.slice(space + 1)]
      : [ctx.eyebrow];

  const lines = 1 + (hero.middle ? 1 : 0) + (hero.secondary ? 1 : 0);

  // Same measure-then-centre rule as the poster, but centred inside the arch.
  let y = capHeight(34);
  const yEyebrow1 = y;
  y += 29;
  const yEyebrow2 = y;
  y = (eyebrow.length === 2 ? yEyebrow2 : yEyebrow1) + 96;
  const yPrimary = y;
  y += 62;
  const yMiddle = y;
  y += 63;
  const ySecondary = y;
  y = (lines === 3 ? ySecondary : lines === 2 ? yMiddle : yPrimary) + 55;
  const yDivider = y;
  y += 70;
  const yHook = y;
  y += 46;
  const yInstruction = y;
  y += 28;
  const yCard = y;

  const shift = ARCH_TOP + (FOOTER_Y - ARCH_TOP - (yCard + CARD)) / 2;

  centerLine(doc, eyebrow[0], yEyebrow1 + shift, 34, body, CHARCOAL, {
    charSpace: 3.2,
    minPt: 22,
    maxWidth: 400,
  });
  if (eyebrow.length === 2) {
    centerLine(doc, eyebrow[1], yEyebrow2 + shift, 34, body, CHARCOAL, {
      charSpace: 3.2,
      minPt: 22,
      maxWidth: 400,
    });
  }

  // Inside the arch the script font leads and the serif plays the connector.
  centerLine(doc, hero.primary, yPrimary + shift, 150, "Script", accent, {
    minPt: 80,
    maxWidth: 440,
  });

  if (hero.middle) {
    centerLine(doc, hero.middle, yMiddle + shift, 64, "Serif", CHARCOAL, {
      minPt: 36,
      maxWidth: 440,
    });
  }

  if (hero.secondary) {
    centerLine(doc, hero.secondary, ySecondary + shift, 150, "Script", accent, {
      minPt: 80,
      maxWidth: 440,
    });
  }

  drawDivider(doc, CX, yDivider + shift, accent, onCream(CHARCOAL, 0.55));

  centerLine(doc, ctx.hook, yHook + shift, 72, "SerifItalic", CHARCOAL, {
    minPt: 46,
    maxWidth: 440,
  });
  centerLine(doc, ctx.instruction, yInstruction + shift, 42, body, CHARCOAL, {
    minPt: 28,
    maxWidth: 460,
  });

  return { cardX: CX - CARD / 2, cardY: yCard + shift, card: CARD, qr: QR };
}

/**
 * Arch outline: two legs joined by a semicircle, approximated with the usual
 * two cubic beziers (control offset 0.5523 r).
 */
function drawArch(
  doc: jsPDF,
  r: number,
  apexY: number,
  footY: number,
  lineWidth: number,
  color: RGB,
) {
  const k = 0.5523 * r;
  doc.setDrawColor(...color);
  doc.setLineWidth(lineWidth);
  doc.line(CX - r, apexY, CX - r, footY);
  doc.line(CX + r, apexY, CX + r, footY);
  doc.lines(
    [
      [0, -k, r - k, -r, r, -r],
      [k, 0, r, r - k, r, r],
    ],
    CX - r,
    apexY,
    [1, 1],
    "S",
  );
}

/* ── Entry point ─────────────────────────────────────────────────────────── */

export async function generateWelcomeSign(
  input: WelcomeSignInput,
): Promise<ArrayBuffer | void> {
  const load = input.assets ?? browserAsset;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
    compress: true,
  });

  const [scriptB64, serifB64, italicB64, sansB64] = await Promise.all([
    load(`${FONT_DIR}/${input.scriptFontFile}`),
    load(`${FONT_DIR}/${SERIF_FILE}`),
    load(`${FONT_DIR}/${SERIF_ITALIC_FILE}`),
    load(`${FONT_DIR}/${SANS_FILE}`),
  ]);
  doc.addFileToVFS("Script.ttf", scriptB64);
  doc.addFont("Script.ttf", "Script", "normal");
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("SerifItalic.ttf", italicB64);
  doc.addFont("SerifItalic.ttf", "SerifItalic", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");

  const ctx: Ctx = {
    doc,
    accent: readableAccent(hexToRgb(input.accent)),
    // Josefin Sans has no Cyrillic; Cormorant does.
    body: input.cyrillic ? "Serif" : "Sans",
    hero: input.hero,
    eyebrow: input.eyebrow,
    hook: input.hook,
    instruction: input.instruction,
  };

  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, H, "F");

  const card =
    input.variant === "arch" ? layoutArch(ctx) : layoutPoster(ctx);

  drawFooter(doc);
  await drawQrCard(
    doc,
    input.qrUrl,
    card.cardX,
    card.cardY,
    card.card,
    card.qr,
  );

  if (input.returnBytes) return doc.output("arraybuffer");
  doc.save(input.fileName);
}

/**
 * Renders and downloads ONE sign.
 *
 * Deliberately one file per call: two `save()` calls in a row trip Chrome's
 * "Download multiple files?" permission prompt, and a couple who taps Block
 * silently gets only one of the two designs. Each design therefore gets its own
 * button, so every click is a single, unconditional download.
 */
export async function downloadWelcomeSign(
  base: Omit<WelcomeSignInput, "variant" | "fileName">,
  fileBase: string,
  variant: WelcomeSignVariant,
  /** Products offering both designs number the file; birthdays don't. */
  numbered = true,
): Promise<void> {
  const suffix = numbered ? `-dizajn-${variant === "poster" ? 1 : 2}` : "";
  await generateWelcomeSign({
    ...base,
    variant,
    fileName: `${fileBase}-B1${suffix}.pdf`,
  });
}
