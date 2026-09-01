// Generise SVE ikonice brenda iz jednog crteza: krem podloga, crn znak.
//
// Zasto uopste postoji: Google u rezultatima pretrage sece favicon u KRUG i
// prikazuje ga na ~16-20 px. Stara ikonica je bila zaobljeni kvadrat sa tamnim
// okvirom uz ivicu, pa je krug odsecao uglove i okvir. Google trazi i umnozak od
// 48 px, a najveci kadar u starom .ico bio je 48 -> razvlacilo se na ekranima sa
// dvostrukom gustinom.
//
// Sta ovaj skript radi:
//   1. uzme `scripts/assets/znak-512.png`,
//   2. OBRISE okvir — ne isece ga,
//   3. izmeri dokle crtez dopire i umanji ga tacno toliko da nista ne izadje iz
//      kruga koji ce ga seci,
//   4. izveze sve ikonice.
//
// Korak 2 je bitan. Okvir je tamna traka od oko 15 px uz ivicu, ali SPIRALA
// KABLA dopire do x=477 od 512 — sasvim blizu nje. Prva verzija ovog skripta
// skidala je okvir secenjem 11% sa svake strane i time odsekla vrh spirale.
// Zato se okvir sada uklanja kao povezana tamna oblast koja dodiruje ivicu
// slike; crtez ostaje ceo jer je od okvira odvojen krem prazninom.
//
// Korak 3 se ne pogadja nego racuna: izmeri se najveci poluprecnik na kojem ima
// mastila, pa se skala izvede iz njega. Dva sistema seku razlicito:
//   krug   — Google sece krugom poluprecnika 0.5 W  -> META_KRUG
//   maska  — Android `purpose: "maskable"` garantuje samo krug PRECNIKA 80%
//            (poluprecnik 0.40 W); sve preko toga sme da odsece bilo kojim
//            oblikom (krug, squircle, suza) -> META_MASKA
// Zato maskable ikonica ima vidno vise praznine oko znaka — uslov formata, ne
// greska.
//
// Pokretanje:  node scripts/generate-favicon.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

// Izvorni crtez stoji van `public/` jer skripta prepisuje `public/images/icon-*.png`
// — da izlaz nikad ne postane ulaz sledeceg pokretanja.
const IZVOR = "scripts/assets/znak-512.png";
const N = 512;
const META_KRUG = 0.485; // poluprecnik u delovima platna; 0.5 je sama ivica kruga
const META_MASKA = 0.385; // maskable bezbedna zona je 0.40, uzeto malo unutra
const KREM = "#F5F4DC";
const PRAG = 150; // ispod ove svetline se racuna kao crtez

// Ucita izvor i obrise okvir: svaka tamna oblast povezana sa ivicom slike
// postaje krem. Crtez preziv jer ga od okvira deli krem praznina.
async function ucitajBezOkvira() {
  const { data, info } = await sharp(IZVOR)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const tamno = (i) => (data[i] + data[i + 1] + data[i + 2]) / 3 < PRAG;

  const red = [];
  const videno = new Uint8Array(W * W);
  for (let x = 0; x < W; x++)
    for (const y of [0, W - 1]) {
      if (!videno[y * W + x] && tamno((y * W + x) * 4)) {
        videno[y * W + x] = 1;
        red.push(y * W + x);
      }
    }
  for (let y = 0; y < W; y++)
    for (const x of [0, W - 1]) {
      if (!videno[y * W + x] && tamno((y * W + x) * 4)) {
        videno[y * W + x] = 1;
        red.push(y * W + x);
      }
    }

  const krem = [245, 244, 220];
  while (red.length) {
    const p = red.pop();
    const i = p * 4;
    for (let k = 0; k < 3; k++) data[i + k] = krem[k];
    data[i + 3] = 255;
    const x = p % W;
    const y = (p - x) / W;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= W) continue;
      const q = ny * W + nx;
      if (!videno[q] && tamno(q * 4)) {
        videno[q] = 1;
        red.push(q);
      }
    }
  }
  return { data, W };
}

// Izdvoji sam crtez i sredi ga na kvadratno platno, pa vrati koliko daleko od
// sredista dopire mastilo — u delovima stranice tog platna.
async function pripremiCrtez() {
  const { data, W } = await ucitajBezOkvira();
  let x0 = W,
    x1 = 0,
    y0 = W,
    y1 = 0;
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if ((data[i] + data[i + 1] + data[i + 2]) / 3 < PRAG) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  const gw = x1 - x0 + 1;
  const gh = y1 - y0 + 1;
  const S = Math.max(gw, gh);
  const pun = await sharp(data, { raw: { width: W, height: W, channels: 4 } })
    .png()
    .toBuffer();
  const crtez = await sharp({
    create: { width: S, height: S, channels: 4, background: KREM },
  })
    .composite([
      {
        input: await sharp(pun)
          .extract({ left: x0, top: y0, width: gw, height: gh })
          .png()
          .toBuffer(),
        left: Math.round((S - gw) / 2),
        top: Math.round((S - gh) / 2),
      },
    ])
    .png()
    .toBuffer();

  const { data: d2 } = await sharp(crtez)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let rMax = 0;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if ((d2[i] + d2[i + 1] + d2[i + 2]) / 3 < PRAG)
        rMax = Math.max(rMax, Math.hypot(x - S / 2, y - S / 2));
    }
  return { crtez, S, domet: rMax / S };
}

const { crtez, domet } = await pripremiCrtez();

// Crtez na krem podlozi preko celog platna. Podloga bez zaobljenja: Google
// svakako sece u krug, a u tabu se dobija krem plocica kao i do sada.
async function napraviZnak(meta) {
  const m = Math.min(N, Math.round((N * meta) / domet));
  const umanjen = await sharp(crtez).resize(m, m).png().toBuffer();
  return sharp({ create: { width: N, height: N, channels: 4, background: KREM } })
    .composite([
      {
        input: umanjen,
        left: Math.round((N - m) / 2),
        top: Math.round((N - m) / 2),
      },
    ])
    .png()
    .toBuffer();
}

// ICO sa BMP kadrovima. Ikonica je neprovidna, pa AND maska ide sve nule.
async function upisiIco(znak, putanja, velicine) {
  const kadrovi = [];
  for (const v of velicine) {
    const { data } = await sharp(znak)
      .resize(v, v)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const zaglavlje = Buffer.alloc(40);
    zaglavlje.writeUInt32LE(40, 0);
    zaglavlje.writeInt32LE(v, 4);
    zaglavlje.writeInt32LE(v * 2, 8); // visina x2: XOR + AND maska
    zaglavlje.writeUInt16LE(1, 12);
    zaglavlje.writeUInt16LE(32, 14);

    const piksel = Buffer.alloc(v * v * 4);
    for (let y = 0; y < v; y++)
      for (let x = 0; x < v; x++) {
        const iz = ((v - 1 - y) * v + x) * 4; // BMP ide odozdo nagore
        const u = (y * v + x) * 4;
        piksel[u] = data[iz + 2]; // B
        piksel[u + 1] = data[iz + 1]; // G
        piksel[u + 2] = data[iz]; // R
        piksel[u + 3] = data[iz + 3]; // A
      }
    const maska = Buffer.alloc((Math.ceil(v / 32) * 4) * v);
    kadrovi.push({ v, telo: Buffer.concat([zaglavlje, piksel, maska]) });
  }

  const zag = Buffer.alloc(6);
  zag.writeUInt16LE(0, 0);
  zag.writeUInt16LE(1, 2);
  zag.writeUInt16LE(kadrovi.length, 4);
  let pomak = 6 + 16 * kadrovi.length;
  const stavke = kadrovi.map(({ v, telo }) => {
    const s = Buffer.alloc(16);
    s.writeUInt8(v === 256 ? 0 : v, 0);
    s.writeUInt8(v === 256 ? 0 : v, 1);
    s.writeUInt16LE(1, 4);
    s.writeUInt16LE(32, 6);
    s.writeUInt32LE(telo.length, 8);
    s.writeUInt32LE(pomak, 12);
    pomak += telo.length;
    return s;
  });
  writeFileSync(
    putanja,
    Buffer.concat([zag, ...stavke, ...kadrovi.map((k) => k.telo)]),
  );
}

const znak = await napraviZnak(META_KRUG);
const znakMaska = await napraviZnak(META_MASKA);

// Favicon PNG ide u `public/` a ne u `app/` kao `icon.png`: cim se `icons`
// navede u metadata, Next preskoci konvenciju iz `app/` i tag se ne ispise.
const izlazi = [
  [znak, 192, "public/images/favicon-192.png"],
  [znak, 192, "public/images/icon-192.png"], // PWA + apple-touch
  [znak, 512, "public/images/icon-512.png"], // PWA `purpose: "any"`
  [znakMaska, 512, "public/images/icon-maskable-512.png"],
];
for (const [izvor, v, putanja] of izlazi) {
  await sharp(izvor).resize(v, v).png().toFile(putanja);
}
await upisiIco(znak, "src/app/favicon.ico", [16, 32, 48]);
console.log("Upisano:");
for (const [, , putanja] of izlazi) console.log("  " + putanja);
console.log("  src/app/favicon.ico (16/32/48)");
