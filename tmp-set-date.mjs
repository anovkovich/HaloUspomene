/** Privremeno pomeranje datuma dogadjaja radi testa.
 *  usage: node --env-file=.env.local tmp-set-date.mjs <slug> <YYYY-MM-DD> */
import { MongoClient } from "mongodb";

const [slug, date] = process.argv.slice(2);
if (!slug || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
  console.error("usage: tmp-set-date.mjs <slug> <YYYY-MM-DD>");
  process.exit(1);
}

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const col = c.db("halouspomene").collection("couples");

const before = await col.findOne(
  { slug },
  { projection: { _id: 0, slug: 1, event_date: 1, gallery_key: 1, potvrde_password: 1, "couple_names.full_display": 1 } }
);
if (!before) {
  console.error("nema para sa slugom", slug);
  process.exit(2);
}
console.log("PRE :", before.event_date);

await col.updateOne({ slug }, { $set: { event_date: `${date}T16:00:00` } });

const after = await col.findOne({ slug }, { projection: { _id: 0, event_date: 1 } });
console.log("POSLE:", after.event_date);
console.log("\npar    :", before.couple_names?.full_display);
console.log("lozinka:", before.potvrde_password);
console.log("kljuc  :", before.gallery_key ?? "(nema)");
console.log("\nQR (bez kljuca)   : https://halouspomene.rs/pozivnica/" + slug + "/galerija/");
console.log("link sa kljucem   : https://halouspomene.rs/pozivnica/" + slug + "/galerija/?k=" + (before.gallery_key ?? ""));
await c.close();
