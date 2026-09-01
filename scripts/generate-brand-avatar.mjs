// Profilna slika brenda — isti znak kao favicon, ali u punoj rezoluciji.
//
// Zasto ne iz `scripts/assets/znak-512.png`: taj crtez JE samo 512 px, pa bi
// svako uvecanje bilo interpolacija. Znak medjutim postoji i u `logo.png`
// (3519x1301, providna podloga) kao deo natpisa HALO — slovo O sa slusalicom,
// kablom i crticama zvona. Odatle se dobija oko dvostruko vise piksela.
//
// Znak se NE isecа po koordinatama nego se nalazi povezanim oblastima: slova
// H, A i L su odvojene oblasti, a slusalica preklapa L po x-osi (stoji iznad
// njega), pa bi uspravan rez odsekao vrh slusalice.
//
// Geometrija je ista kao u `generate-favicon.mjs`: znak se umanji tako da stane
// u krug poluprecnika 0.485 platna, jer vecina platformi (LS, Instagram, Google)
// profilnu sliku sece u krug.
//
// Pokretanje:  node scripts/generate-brand-avatar.mjs
import sharp from "sharp";

const IZVOR = "public/images/logo.png";
const KREM = "#F5F4DC";
const META_KRUG = 0.485;
const IZLAZI = [
  [1024, "public/images/brand-avatar-1024.png"],
  [512, "public/images/brand-avatar-512.png"],
];

const { data, info } = await sharp(IZVOR)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const ima = (p) => data[p * 4 + 3] > 128; // providna podloga -> alfa je mastilo

// Povezane oblasti (4-susedstvo), sa bbox-om i povrsinom svake.
const oznaka = new Int32Array(W * H).fill(-1);
const oblasti = [];
const red = new Int32Array(W * H);
for (let start = 0; start < W * H; start++) {
  if (oznaka[start] !== -1 || !ima(start)) continue;
  const id = oblasti.length;
  let glava = 0,
    rep = 0;
  red[rep++] = start;
  oznaka[start] = id;
  let x0 = W,
    x1 = -1,
    y0 = H,
    y1 = -1,
    povrsina = 0;
  while (glava < rep) {
    const p = red[glava++];
    const x = p % W;
    const y = (p - x) / W;
    povrsina++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    if (x > 0 && oznaka[p - 1] === -1 && ima(p - 1)) { oznaka[p - 1] = id; red[rep++] = p - 1; }
    if (x < W - 1 && oznaka[p + 1] === -1 && ima(p + 1)) { oznaka[p + 1] = id; red[rep++] = p + 1; }
    if (y > 0 && oznaka[p - W] === -1 && ima(p - W)) { oznaka[p - W] = id; red[rep++] = p - W; }
    if (y < H - 1 && oznaka[p + W] === -1 && ima(p + W)) { oznaka[p + W] = id; red[rep++] = p + W; }
  }
  oblasti.push({ id, x0, x1, y0, y1, povrsina });
}

// Znak je oblast koja dopire najdalje udesno (spirala kabla).
const glavna = oblasti.reduce((a, b) => (b.x1 > a.x1 ? b : a));

// Crtice zvona su sitne oblasti unutar x-raspona znaka. Slova su prevelika da
// prodju kroz uslov povrsine, pa ostaju napolju i kad se x-rasponi preklope.
const delovi = oblasti.filter(
  (o) =>
    o.id === glavna.id ||
    (o.povrsina < glavna.povrsina * 0.01 &&
      o.x0 >= glavna.x0 &&
      o.x1 <= glavna.x1),
);

const x0 = Math.min(...delovi.map((o) => o.x0));
const x1 = Math.max(...delovi.map((o) => o.x1));
const y0 = Math.min(...delovi.map((o) => o.y0));
const y1 = Math.max(...delovi.map((o) => o.y1));

console.log(`oblasti u logotipu: ${oblasti.length}`);
console.log(`znak = ${delovi.length} oblasti (1 glavna + ${delovi.length - 1} crtica)`);
console.log(`isecak: ${x1 - x0 + 1}x${y1 - y0 + 1} px na (${x0}, ${y0})`);

// Sve sto NIJE deo znaka se obrise, pa se isece bbox — tako slovo L ne ostane
// u kadru ako mu bbox zalazi u kadar znaka.
const cist = Buffer.from(data);
const pripada = new Uint8Array(oblasti.length);
for (const o of delovi) pripada[o.id] = 1;
for (let p = 0; p < W * H; p++) {
  const id = oznaka[p];
  if (id === -1 || !pripada[id]) cist[p * 4 + 3] = 0;
}

const gw = x1 - x0 + 1;
const gh = y1 - y0 + 1;
const znak = await sharp(cist, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: x0, top: y0, width: gw, height: gh })
  .png()
  .toBuffer();

// Kvadratno platno + domet mastila od sredista, radi istog kruga kao favicon.
const S = Math.max(gw, gh);
const kvadrat = await sharp({
  create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: znak, left: Math.round((S - gw) / 2), top: Math.round((S - gh) / 2) }])
  .png()
  .toBuffer();

const { data: d2 } = await sharp(kvadrat).raw().toBuffer({ resolveWithObject: true });
let rMax = 0;
for (let y = 0; y < S; y++)
  for (let x = 0; x < S; x++)
    if (d2[(y * S + x) * 4 + 3] > 128)
      rMax = Math.max(rMax, Math.hypot(x - S / 2, y - S / 2));
const domet = rMax / S;

for (const [N, putanja] of IZLAZI) {
  const m = Math.min(N, Math.round((N * META_KRUG) / domet));
  const umanjen = await sharp(kvadrat).resize(m, m).png().toBuffer();
  await sharp({ create: { width: N, height: N, channels: 4, background: KREM } })
    .composite([{ input: umanjen, left: Math.round((N - m) / 2), top: Math.round((N - m) / 2) }])
    .png()
    .toFile(putanja);
  console.log(`upisano: ${putanja} (${N}x${N}, znak ${m} px)`);
}
