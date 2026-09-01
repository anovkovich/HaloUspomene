/**
 * Suvi prolaz za SMS podsetnik neaktivnim planer nalozima.
 * Ništa ne menja u bazi — samo nabraja koga bi cron poslao i zašto.
 *
 *   node --env-file=.env.local scripts/planer-podsetnik-dry.mjs
 *
 * Pravila se ovde NE prepisuju iz `src/lib/planer/reminder-sms.ts` nego se
 * drže identičnim; ako se tamo promene pragovi, promeniti i ovde.
 */
import { MongoClient } from "mongodb";

const MIN_SILENT_DAYS = 30;
const MIN_DAYS_UNTIL_EVENT = 60;

const SMS =
  "HaloUspomene: Ceklista, budzet i lista zvanica cekaju vas u planeru " +
  "vencanja. Otvorite svoj portal i nastavite pripreme.";

// GSM-7 osnovna tablica + prošireni skup. Sve van ovoga obara poruku na UCS-2
// (70 znakova umesto 160), pa jedan „č" utrostručuje cenu svakog slanja.
const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà" +
  "^{}\\[~]|€";

function checkSms() {
  const bad = [...SMS].filter((ch) => !GSM7.includes(ch));
  console.log(`Poruka (${SMS.length} znakova):`);
  console.log(`  "${SMS}"`);
  if (SMS.length > 160) console.log(`  ✗ PREKO 160 — ide kao dva SMS-a`);
  else console.log(`  ✓ staje u jedan SMS`);
  if (bad.length) console.log(`  ✗ van GSM-7: ${[...new Set(bad)].join(" ")}`);
  else console.log(`  ✓ čist GSM-7`);
  console.log("");
}

const days = (from, to) => {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86_400_000);
};

const primaryPhone = (contact) => {
  const first = (contact || "").split(",")[0]?.trim();
  return first && first.startsWith("+") ? first : null;
};

async function main() {
  checkSms();

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("halouspomene");
  const now = new Date();

  const couples = await db
    .collection("couples")
    .find(
      {
        draft: true,
        example: { $ne: true },
        planner_reminder_sent: { $ne: true },
        contact_phone: { $exists: true, $ne: "" },
        event_date: { $exists: true, $ne: "" },
      },
      { projection: { slug: 1, event_date: 1, contact_phone: 1 } },
    )
    .toArray();

  console.log(`Draft parova sa telefonom i datumom: ${couples.length}\n`);

  const send = [];
  const skip = [];

  for (const c of couples) {
    const phone = primaryPhone(c.contact_phone);
    if (!phone) {
      skip.push([c.slug, "broj nije u E.164 obliku"]);
      continue;
    }
    const t = new Date(c.event_date).getTime();
    if (Number.isNaN(t)) {
      skip.push([c.slug, "neispravan event_date"]);
      continue;
    }
    const daysUntil = days(now, new Date(t));
    if (daysUntil < MIN_DAYS_UNTIL_EVENT) {
      skip.push([c.slug, `venčanje za ${daysUntil} dana (prag ${MIN_DAYS_UNTIL_EVENT})`]);
      continue;
    }
    const portal = await db
      .collection("wedding_portal")
      .findOne({ slug: c.slug }, { projection: { lastSeenAt: 1, updatedAt: 1 } });
    const lastSignal = portal?.lastSeenAt ?? portal?.updatedAt;
    const silentDays = lastSignal ? days(new Date(lastSignal), now) : MIN_SILENT_DAYS;
    if (silentDays < MIN_SILENT_DAYS) {
      skip.push([c.slug, `aktivan pre ${silentDays} dana (prag ${MIN_SILENT_DAYS})`]);
      continue;
    }
    send.push({
      slug: c.slug,
      phone,
      silentDays,
      daysUntil,
      izvor: portal?.lastSeenAt ? "lastSeenAt" : portal ? "updatedAt" : "nema portal",
    });
  }

  console.log(`ŠALJE SE (${send.length}):`);
  for (const s of send) {
    console.log(
      `  ${s.slug.padEnd(20)} ${s.phone.padEnd(16)} ćuti ${String(s.silentDays).padStart(3)}d ` +
        `| venčanje za ${String(s.daysUntil).padStart(3)}d | signal: ${s.izvor}`,
    );
  }

  console.log(`\nPRESKAČE SE (${skip.length}):`);
  for (const [slug, why] of skip) console.log(`  ${slug.padEnd(20)} ${why}`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
