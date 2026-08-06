// Generise favicon iz postojeceg znaka: crvena podloga, krem znak.
//
// Zasto uopste postoji: Google u rezultatima pretrage sece favicon u KRUG i
// prikazuje ga na ~16-20 px. Stara ikonica je bila zaobljeni kvadrat sa krem
// podlogom i tamnim okvirom, pa je krug odsecao uglove i okvir, a gust crtez
// (spirala kabla, zraci) se na toj velicini slivao u tamnu mrlju. Google trazi
// i umnozak od 48 px, a najveci kadar u starom .ico bio je 48 -> razvlacilo se
// na ekranima sa dvostrukom gustinom.
//
// Sta ovaj skript radi:
//   1. uzme `public/images/icon-512.png` i skine mu zaobljeni okvir,
//   2. prebaci boje (krem podloga -> #AE343F, crn crtez -> #F5F4DC),
//   3. umanji znak na SAFE_SCALE tako da nista ne ispadne iz upisanog kruga,
//   4. upise `public/images/favicon-192.png` i `src/app/favicon.ico` (16/32/48).
//
// PWA i apple-touch ikonice (`public/images/icon-192.png`, `icon-512.png`)
// NAMERNO ostaju stare — menjanje njih bi promenilo ikonicu na pocetnom ekranu
// svima koji su vec instalirali aplikaciju.
//
// Pokretanje:  node scripts/generate-favicon.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const IZVOR = "public/images/icon-512.png";
const N = 512;
const OKVIR = 0.11; // koliko se uvuce da nestane zaobljeni kvadrat sa okvirom
const SAFE_SCALE = 0.78; // izmereno: na 79% i 99,9% mastila staje u krug
const KREM = [245, 244, 220]; // #F5F4DC
const CRVENA = [174, 52, 63]; // #AE343F

async function napraviZnak() {
  const u = Math.round(N * OKVIR);
  const bezOkvira = await sharp(IZVOR)
    .ensureAlpha()
    .extract({ left: u, top: u, width: N - 2 * u, height: N - 2 * u })
    .resize(N, N)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Zamena boja po svetlini: tamno -> krem, svetlo -> crvena. Prelaz je mek da
  // se ne nazubi, jer je izvor rasterski i ivice su antialiasovane.
  const { data, info } = bezOkvira;
  for (let i = 0; i < data.length; i += 4) {
    const l = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const t = Math.min(1, Math.max(0, (l - 60) / 140));
    for (let k = 0; k < 3; k++)
      data[i + k] = Math.round(KREM[k] * (1 - t) + CRVENA[k] * t);
    data[i + 3] = 255;
  }
  const obojen = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Znak se umanji i centrira na punoj crvenoj podlozi. Podloga ide preko celog
  // platna, bez zaobljenja — Google svakako sece u krug, a u tabu se dobija pun
  // crveni kvadratic koji se lepo vidi i na svetloj i na tamnoj temi.
  const s = Math.round(N * SAFE_SCALE);
  const umanjen = await sharp(obojen).resize(s, s).png().toBuffer();
  return sharp({
    create: { width: N, height: N, channels: 4, background: "#AE343F" },
  })
    .composite([
      { input: umanjen, left: Math.round((N - s) / 2), top: Math.round((N - s) / 2) },
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

const znak = await napraviZnak();
// PNG ide u `public/` a ne u `app/` kao `icon.png`: cim se `icons` navede u
// metadata, Next preskoci konvenciju iz `app/` i tag se prosto ne ispise.
await sharp(znak).resize(192, 192).png().toFile("public/images/favicon-192.png");
await upisiIco(znak, "src/app/favicon.ico", [16, 32, 48]);
console.log("Upisano: public/images/favicon-192.png i src/app/favicon.ico (16/32/48)");
