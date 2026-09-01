// One-off (recording): switch ana-dejan wedding theme + script font.
// Logs the previous values first so we can revert after the recording.
// Run: node scripts/set-ana-dejan-theme.mjs [themeKey] [scriptFont]
//   e.g. node scripts/set-ana-dejan-theme.mjs classic_rose parisienne
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const NEW_THEME = process.argv[2] || "white_gold_navy";
const NEW_FONT = process.argv[3]; // optional

const env = readFileSync(".env.local", "utf8");
const m = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/);
if (!m) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const client = new MongoClient(m[1]);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const before = await couples.findOne(
    { slug: "ana-dejan" },
    { projection: { theme: 1, scriptFont: 1, couple_names: 1 } },
  );
  if (!before) {
    console.error("ana-dejan not found");
    process.exit(1);
  }
  console.log("PREVIOUS theme:", before.theme, "| font:", before.scriptFont);

  const set = { theme: NEW_THEME };
  if (NEW_FONT) set.scriptFont = NEW_FONT;

  const res = await couples.updateOne({ slug: "ana-dejan" }, { $set: set });
  console.log(
    `matched: ${res.matchedCount}  modified: ${res.modifiedCount}  ->  theme=${NEW_THEME}` +
      (NEW_FONT ? `  font=${NEW_FONT}` : ""),
  );
} finally {
  await client.close();
}
