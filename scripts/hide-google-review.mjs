/**
 * Sakriva (ili vraća) pojedinačnu Google recenziju sa sajta.
 *
 *   node --env-file=.env.local scripts/hide-google-review.mjs                    # lista sve
 *   node --env-file=.env.local scripts/hide-google-review.mjs "Ana Novković"     # dry-run
 *   node --env-file=.env.local scripts/hide-google-review.mjs "Ana Novković" --apply
 *   node --env-file=.env.local scripts/hide-google-review.mjs "Ana Novković" --show --apply
 *
 * Zašto `hidden: true` a ne brisanje: `scripts/sync-google-reviews.mjs` radi
 * upsert po `review_id` i uredno bi vratio obrisan dokument već sledećeg
 * meseca. Sync namerno ne dira polje `hidden`, pa jednom sakrivena recenzija
 * ostaje sakrivena.
 *
 * Recenzija i dalje postoji na Google-u — ovo je samo odluka šta ide na naš
 * sajt. Ocena i ukupan broj u kartici iznad dolaze sa profila i ostaju
 * nepromenjeni.
 */
import { MongoClient } from "mongodb";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const SHOW = args.includes("--show");
const query = args.filter((a) => !a.startsWith("--"))[0];

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("\n✖ Nedostaje MONGODB_URI.\n");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
try {
  await client.connect();
  const col = client.db("halouspomene").collection("google_reviews");

  if (!query) {
    const all = await col.find({}).sort({ published_at: -1 }).toArray();
    console.log("\nSve recenzije u bazi:\n");
    all.forEach((d, i) => {
      const oznaka = d.hidden ? "SAKRIVENA" : "         ";
      const tekst = d.text ? d.text.replace(/\s+/g, " ").slice(0, 50) : "(bez teksta)";
      console.log(
        `${String(i + 1).padStart(2)} ${oznaka} ${"★".repeat(d.rating)} ` +
          `${d.author_name} · ${d.published_at.slice(0, 10)}\n     ${tekst}`
      );
    });
    console.log("\nPozovi ponovo sa imenom autora da sakriješ jednu.\n");
    process.exitCode = 0;
  } else {
    const matches = await col
      .find({ author_name: { $regex: query, $options: "i" } })
      .toArray();

    if (matches.length === 0) {
      console.error(`\n✖ Nijedna recenzija ne odgovara "${query}".\n`);
      process.exitCode = 1;
    } else if (matches.length > 1) {
      // Radije ništa nego pogrešnu: dve osobe umeju da dele prezime.
      console.error(`\n✖ "${query}" odgovara na ${matches.length} recenzija:\n`);
      for (const m of matches) {
        console.error(`   • ${m.author_name} · ${m.published_at.slice(0, 10)}`);
      }
      console.error("\nSuzi upit da pogodi tačno jednu.\n");
      process.exitCode = 1;
    } else {
      const m = matches[0];
      const akcija = SHOW ? "VRAĆA SE NA SAJT" : "SAKRIVA SE";
      console.log(`\n${akcija}: ${m.author_name} · ${m.published_at.slice(0, 10)}`);
      console.log(`  ${m.text ? m.text.replace(/\s+/g, " ") : "(bez teksta)"}\n`);

      if (APPLY) {
        await col.updateOne(
          { review_id: m.review_id },
          SHOW ? { $unset: { hidden: "" } } : { $set: { hidden: true } }
        );
        console.log("✓ Upisano.\n");
      } else {
        console.log("Dry-run — ništa nije promenjeno. Dodaj --apply.\n");
      }
    }
  }
} finally {
  await client.close();
}
