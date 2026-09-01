/**
 * Backfill: stamps `standalone_gallery: true` on couples that were sold the
 * standalone QR photo gallery before the explicit marker existed.
 *
 * Why this can't just run blind
 * -----------------------------
 * The legacy heuristic (paid_for_gallery && draft && nothing else paid) is also
 * the exact signature of a couple that signed up through /planiranje-vencanja
 * and later bought a gallery. Those couples are currently mis-locked by that
 * same heuristic; stamping them would cement the bug forever. So every match is
 * classified first:
 *
 *   SET     — clean gallery signup (empty groom + classic_rose, no planner or
 *             invitation content). Safe to stamp.
 *   REVIEW  — has portal data, locations or timeline. Probably a planner couple.
 *             Never stamped automatically.
 *
 * Deliberately NOT covered: unpaid old gallery signups (paid_for_gallery:false)
 * are indistinguishable from planner signups in the database, so they stay
 * unmarked and will see the full planner. That is an error in the client's
 * favour and the set cannot grow — every new signup gets the marker at create.
 *
 * Idempotent: safe to re-run (already-stamped records are excluded by the query).
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-standalone-gallery.mjs
 *   node --env-file=.env.local scripts/backfill-standalone-gallery.mjs --apply
 *   node --env-file=.env.local scripts/backfill-standalone-gallery.mjs --apply --exclude=slug-a,slug-b
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const DB = "halouspomene";
const APPLY = process.argv.includes("--apply");
const excludeArg = process.argv.find((a) => a.startsWith("--exclude="));
const EXCLUDE = new Set(
  excludeArg
    ? excludeArg
        .slice("--exclude=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []
);

/** Exact replica of the legacy heuristic, plus idempotency. */
const QUERY = {
  paid_for_gallery: true,
  draft: true,
  paid_for_raspored: { $ne: true },
  paid_for_audio: { $ne: true },
  premium_paid: { $ne: true },
  standalone_gallery: { $ne: true },
};

/** True when the portal document carries anything the couple actually entered. */
function portalHasContent(p) {
  if (!p) return false;
  const checklistDone = (p.checklist ?? []).some((i) => i?.completed);
  const budgetUsed =
    (p.budget?.totalBudget ?? 0) > 0 ||
    (p.budget?.categories ?? []).some((c) => (c?.spent ?? 0) > 0 || (c?.planned ?? 0) > 0);
  const favourites = (p.vendorFavorites ?? []).length > 0;
  // guestList is an object ({ sections, invitees, keyRoles }), not an array.
  const guests = (p.guestList?.invitees ?? []).length > 0;
  return checklistDone || budgetUsed || favourites || guests;
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(DB);
  const couples = db.collection("couples");
  const portal = db.collection("wedding_portal");

  const matches = await couples.find(QUERY).toArray();

  if (matches.length === 0) {
    console.log("Nema kandidata — ništa za backfill.");
    process.exit(0);
  }

  const rows = [];
  for (const c of matches) {
    const p = await portal.findOne({ slug: c.slug });
    const hasPortal = portalHasContent(p);
    const locations = (c.locations ?? []).length;
    const timeline = (c.timeline ?? []).length;
    const cleanSignup =
      (c.couple_names?.groom ?? "") === "" && c.theme === "classic_rose";

    const verdict =
      hasPortal || locations > 0 || timeline > 0 || !cleanSignup
        ? "REVIEW"
        : "SET";

    rows.push({
      slug: c.slug,
      ime: c.couple_names?.full_display ?? "—",
      kreiran: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : "—",
      "prazan groom": (c.couple_names?.groom ?? "") === "" ? "da" : "NE",
      lokacije: locations,
      timeline,
      portal: hasPortal ? "IMA" : "—",
      verdict: EXCLUDE.has(c.slug) ? "SKIP (--exclude)" : verdict,
    });
  }

  console.table(rows);

  const toSet = rows.filter((r) => r.verdict === "SET").map((r) => r.slug);
  const toReview = rows.filter((r) => r.verdict === "REVIEW").map((r) => r.slug);
  const skipped = rows.filter((r) => r.verdict.startsWith("SKIP")).map((r) => r.slug);

  console.log(`\nUkupno kandidata: ${matches.length}`);
  console.log(`  SET    (upisuje se): ${toSet.length}`);
  console.log(`  REVIEW (ručno):      ${toReview.length}${toReview.length ? ` → ${toReview.join(", ")}` : ""}`);
  if (skipped.length) console.log(`  SKIP:                ${skipped.join(", ")}`);

  if (toReview.length) {
    console.log(
      "\nREVIEW zapisi imaju tragove planera ili pozivnice — proveri ih ručno.\n" +
        "Ako je neki ipak čista galerija, upiši mu polje pojedinačno."
    );
  }

  if (!APPLY) {
    console.log("\nDRY-RUN. Pokreni sa --apply da upišeš SET redove.");
    process.exit(0);
  }

  if (toSet.length === 0) {
    console.log("\nNema SET redova — ništa nije upisano.");
    process.exit(0);
  }

  const res = await couples.updateMany(
    { slug: { $in: toSet } },
    { $set: { standalone_gallery: true } }
  );
  console.log(`\nUpisano: matched=${res.matchedCount} modified=${res.modifiedCount}`);

  const left = await couples.countDocuments(QUERY);
  console.log(`Preostalo kandidata posle upisa: ${left} (očekivano = REVIEW + SKIP)`);
} finally {
  await client.close();
}
