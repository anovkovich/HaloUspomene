// One-off: enable the guest hub's Gallery + Menu tabs for the ana-dejan demo
// couple, with dummy menu data, so we can eyeball the hub UI locally.
// Run: node scripts/enable-hub-ana-dejan.mjs
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const m = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/);
if (!m) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = m[1];

const meni = {
  food: [
    { id: "f1", kategorija: "predjelo", naziv: "Dalmatinski pršut i sir", opis: "Domaći pršut, sir iz ulja, masline" },
    { id: "f2", kategorija: "predjelo", naziv: "Carpaccio od junetine", opis: "Rukola, parmezan, kapari" },
    { id: "f3", kategorija: "glavno", naziv: "Punjena teletina", opis: "Sa mladim krompirom i sezonskim povrćem" },
    { id: "f4", kategorija: "glavno", naziv: "Losos na žaru", opis: "Blitva i limun" },
    { id: "f5", kategorija: "glavno", naziv: "Rižoto sa vrganjima", opis: "Vegetarijanska opcija" },
    { id: "f6", kategorija: "desert", naziv: "Mladenačka torta" },
    { id: "f7", kategorija: "desert", naziv: "Panna cotta sa šumskim voćem" },
  ],
  drinks: [
    { id: "d1", kategorija: "alkoholno", naziv: "Vranac", opis: "Crveno vino" },
    { id: "d2", kategorija: "alkoholno", naziv: "Chardonnay", opis: "Belo vino" },
    { id: "d3", kategorija: "alkoholno", naziv: "Domaća rakija", opis: "Šljiva i kajsija" },
    { id: "d4", kategorija: "bezalkoholno", naziv: "Prirodni sokovi" },
    { id: "d5", kategorija: "bezalkoholno", naziv: "Voda (negazirana / gazirana)" },
    { id: "d6", kategorija: "toplo", naziv: "Espresso i čaj" },
  ],
};

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");
  const res = await db
    .collection("couples")
    .updateOne(
      { slug: "ana-dejan" },
      { $set: { paid_for_gallery: true, meni } },
    );
  console.log("matched:", res.matchedCount, "modified:", res.modifiedCount);
  const doc = await db
    .collection("couples")
    .findOne(
      { slug: "ana-dejan" },
      { projection: { paid_for_raspored: 1, paid_for_gallery: 1, meni: 1, event_date: 1 } },
    );
  console.log("ana-dejan now:", JSON.stringify(doc, null, 2));
} finally {
  await client.close();
}
