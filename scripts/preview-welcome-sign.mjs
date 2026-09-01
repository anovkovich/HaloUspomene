/**
 * Renders sample QR pano dobrodošlice PDFs — both design variants, all three
 * products — so the look can be judged on paper instead of in a description.
 *
 *   node scripts/preview-welcome-sign.mjs [outDir]
 *
 * With a real couple, exactly as that couple would download it (their theme
 * colour, their script font, their /gde-sedim URL) — needs MONGODB_URI:
 *
 *   node --env-file=.env.local scripts/preview-welcome-sign.mjs --slug=ana-dejan
 *
 * Add --font=<kljuc> and/or --cyrillic to try a different script font or the
 * Cyrillic sign on that couple, without touching their saved record:
 *
 *   node --env-file=.env.local scripts/preview-welcome-sign.mjs --slug=ana-dejan --font=jasminum --cyrillic
 *
 * Compiles the shared renderer on the fly (it deliberately imports nothing but
 * jspdf + qrcode, so it type-checks standalone) and feeds it a filesystem
 * asset loader in place of the browser's fetch.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const slugArg = argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);
/** Try a font on the sign WITHOUT changing what the couple has saved. */
const fontArg = argv.find((a) => a.startsWith("--font="))?.slice("--font=".length);
/** Same, for pano_cyrillic — preview the Cyrillic sign before setting the flag. */
const cyrillicArg = argv.includes("--cyrillic");
/**
 * Raw .ttf filename from public/fonts/invitation, for auditioning a face that
 * is not in the product's font registry yet. Bypasses --font entirely.
 */
const fontFileArg = argv
  .find((a) => a.startsWith("--fontfile="))
  ?.slice("--fontfile=".length);
const OUT = resolve(argv.find((a) => !a.startsWith("--")) ?? join(ROOT, "tmp", "pano-preview"));
// Must live inside the repo so the compiled output can resolve jspdf/qrcode.
const BUILD = join(ROOT, "node_modules", ".cache", "welcome-sign-preview");

const SRC = [
  "src/lib/seating/pdf/welcomeSign.ts",
  "src/lib/seating/pdf/welcomeSignContent.ts",
  // Compiled in rather than re-implemented here, so the preview transliterates
  // names with exactly the rules the browser will use.
  "src/lib/serbian-script.ts",
];

rmSync(BUILD, { recursive: true, force: true });
mkdirSync(BUILD, { recursive: true });

console.log("Kompajliram deljeni renderer...");
execFileSync(
  process.execPath,
  [
    join(ROOT, "node_modules", "typescript", "bin", "tsc"),
    ...SRC,
    "--outDir",
    BUILD,
    // Pinned so the emitted tree stays stable: without it tsc derives the root
    // from the common ancestor of SRC, so adding a file outside seating/pdf
    // silently moves every output path.
    "--rootDir",
    "src/lib",
    "--module",
    "esnext",
    "--target",
    "es2022",
    "--moduleResolution",
    "bundler",
    "--skipLibCheck",
  ],
  { cwd: ROOT, stdio: "inherit" },
);

// tsc emits .js; Node needs the ESM extension hint via package.json type.
writeFileSync(join(BUILD, "package.json"), JSON.stringify({ type: "module" }));

const emitted = join(BUILD, "seating", "pdf", "welcomeSign.js");

for (const file of [
  emitted,
  join(BUILD, "seating", "pdf", "welcomeSignContent.js"),
  join(BUILD, "serbian-script.js"),
]) {
  const patched = readFileSync(file, "utf8")
    // Node resolves "jspdf" to the CJS build, whose namespace object is not a
    // constructor. Bundlers give the browser the ES build, which has a real
    // default export — point this preview at the same file.
    .replace(/from ["']jspdf["']/g, 'from "jspdf/dist/jspdf.es.min.js"')
    // The app's relative imports carry no extension because a bundler resolves
    // them; Node's ESM loader will not. Type-only imports vanish at compile
    // time, so this only bites once a real value crosses a file boundary.
    .replace(/from ["'](\.[^"']*)["']/g, (m, spec) =>
      spec.endsWith(".js") ? m : `from "${spec}.js"`,
    );
  writeFileSync(file, patched);
}

const { generateWelcomeSign } = await import(pathToFileURL(emitted).href);
const {
  weddingSignContent,
  eventSignContent,
  birthdaySignContent,
  panoWeddingNames,
} = await import(
  pathToFileURL(join(BUILD, "seating", "pdf", "welcomeSignContent.js")).href
);

/** Serves /fonts/... and /images/... straight off the public dir. */
const assets = async (path) =>
  readFileSync(join(ROOT, "public", path.replace(/^\//, ""))).toString("base64");

/* ── Real couple from the DB (--slug) ─────────────────────────────────────
 *  Mirrors what generateWelcomePDF.ts does in the browser: theme primary from
 *  THEME_CONFIGS, script font file from its own map, Cyrillic couples pushed
 *  onto a script font that actually has Cyrillic glyphs. Kept as flat literals
 *  so this script stays free of the app's TSX imports. */
const THEME_PRIMARY = {
  luxury_gold: "#d4af37",
  classic_rose: "#AE343F",
  modern_mono: "#3D6B9C",
  minimal_sage: "#7c9a72",
  warm_terracotta: "#C0622A",
  white_gold_burgundy: "#800020",
  white_gold_navy: "#0A1F44",
};
const SCRIPT_FONT_FILES = {
  "great-vibes": "GreatVibesHU-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "cormorant-garamond": "CormorantGaramond-Regular.ttf",
  "poiret-one": "PoiretOne-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
  jasminum: "Jasminum-Regular.ttf",
};
const CYRILLIC_SCRIPT_FONTS = [
  "great-vibes",
  "cormorant-garamond",
  "poiret-one",
  "marck-script",
  "caveat",
  "bad-script",
  "jasminum",
];

async function coupleSample(slug) {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI nije postavljen — pokreni sa --env-file=.env.local");
    process.exit(1);
  }
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const doc = await client
    .db("halouspomene")
    .collection("couples")
    .findOne(
      { slug },
      {
        projection: {
          _id: 0,
          couple_names: 1,
          theme: 1,
          scriptFont: 1,
          useCyrillic: 1,
          pano_cyrillic: 1,
          pano_script_font: 1,
          pano_bride_name: 1,
          pano_groom_name: 1,
        },
      },
    );
  await client.close();

  if (!doc) {
    console.error(`Par '${slug}' nije pronađen u bazi.`);
    process.exit(1);
  }

  // Mirrors generateWelcomePDF.ts: the sign is Cyrillic if the invitation is,
  // or if the couple asked for this one printed piece in the other script.
  const cyrillic = !!doc.useCyrillic || !!doc.pano_cyrillic || cyrillicArg;
  const requested =
    fontArg ?? doc.pano_script_font ?? doc.scriptFont ?? "great-vibes";
  if (fontArg && !SCRIPT_FONT_FILES[fontArg]) {
    console.error(
      `Nepoznat font '${fontArg}'. Dostupni: ${Object.keys(SCRIPT_FONT_FILES).join(", ")}`,
    );
    process.exit(1);
  }
  const effective =
    cyrillic && !CYRILLIC_SCRIPT_FONTS.includes(requested) ? "marck-script" : requested;
  const display =
    doc.couple_names?.full_display ??
    `${doc.couple_names?.groom ?? ""} & ${doc.couple_names?.bride ?? ""}`;

  const names = panoWeddingNames(
    display,
    {
      bride: doc.couple_names?.bride,
      groom: doc.couple_names?.groom,
      panoBride: doc.pano_bride_name,
      panoGroom: doc.pano_groom_name,
    },
    cyrillic && !doc.useCyrillic,
  );

  console.log(
    `Par '${slug}': ${names} · tema ${doc.theme ?? "classic_rose"} · font ${effective}` +
      (cyrillic ? " · ćirilica" : "") +
      (names !== display ? `  (preslovljeno iz "${display}")` : ""),
  );

  return {
    name: slug,
    accent: THEME_PRIMARY[doc.theme] ?? THEME_PRIMARY.classic_rose,
    scriptFontFile:
      fontFileArg ??
      SCRIPT_FONT_FILES[effective] ??
      SCRIPT_FONT_FILES["great-vibes"],
    cyrillic,
    qrUrl: `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`,
    content: weddingSignContent(names, cyrillic),
  };
}

const SAMPLES = slugArg ? [await coupleSample(slugArg)] : [
  {
    name: "vencanje",
    accent: "#AE343F",
    scriptFontFile: "GreatVibesHU-Regular.ttf",
    qrUrl: "https://halouspomene.rs/pozivnica/marija-petar/gde-sedim/",
    content: weddingSignContent("Marija & Petar", false),
  },
  {
    name: "vencanje-cirilica",
    accent: "#800020",
    scriptFontFile: "MarckScript-Regular.ttf",
    cyrillic: true,
    qrUrl: "https://halouspomene.rs/pozivnica/andjela-milos/gde-sedim/",
    content: weddingSignContent("Анђела & Милош", true),
  },
  {
    name: "vencanje-duga-imena",
    accent: "#0A1F44",
    scriptFontFile: "Parisienne-Regular.ttf",
    qrUrl: "https://halouspomene.rs/pozivnica/aleksandra-konstantin/gde-sedim/",
    content: weddingSignContent("Aleksandra & Konstantin", false),
  },
  {
    name: "dogadjaj",
    accent: "#AE343F",
    scriptFontFile: "GreatVibesHU-Regular.ttf",
    qrUrl: "https://halouspomene.rs/raspored-sedenja/tim-godisnjica/gde-sedim/",
    content: eventSignContent("Godišnja proslava"),
  },
  {
    name: "rodjendan",
    accent: "#C0622A",
    scriptFontFile: "Caveat-Regular.ttf",
    qrUrl: "https://halouspomene.rs/deciji-rodjendan/mila-5/gde-sedim/",
    content: birthdaySignContent("Mila", 5, "child"),
  },
  {
    name: "punoletstvo",
    accent: "#d4af37",
    scriptFontFile: "Caveat-Regular.ttf",
    qrUrl: "https://halouspomene.rs/deciji-rodjendan/teodora-18/gde-sedim/",
    content: birthdaySignContent("Teodora", 18, "eighteenth"),
  },
];

mkdirSync(OUT, { recursive: true });
let written = 0;

const POSTER_ONLY = new Set(["rodjendan", "punoletstvo"]);
for (const variant of ["poster", "arch"]) {
  for (const s of SAMPLES) {
    if (variant === "arch" && POSTER_ONLY.has(s.name)) continue;
    const bytes = await generateWelcomeSign({
      variant,
      qrUrl: s.qrUrl,
      accent: s.accent,
      scriptFontFile: s.scriptFontFile,
      cyrillic: !!s.cyrillic,
      fileName: "preview.pdf",
      assets,
      returnBytes: true,
      ...s.content,
    });
    const file = join(OUT, `${variant}-${s.name}.pdf`);
    writeFileSync(file, Buffer.from(bytes));
    written++;
    console.log("  ✓", file);
  }
}

rmSync(BUILD, { recursive: true, force: true });
console.log(`\nGotovo — ${written} PDF-a u ${OUT}`);
