# Plan — Oldtajmer landing + razdvajanje od luksuzne ponude

## Cilj

Zauzeti SERP za "iznajmljivanje oldtajmera za venčanje" i srodne upite, i
razdvojiti retro ponudu od postojeće luksuzne (Mercedes) stranice tako da se
dve stranice ne kanibalizuju.

## Polazni nalazi (SEO istraživanje, 2026-08-03)

- U Srbiji dominira fonetski oblik **oldtajmer** (ne "oldtimer") — svi jaki
  konkurenti ga koriste u domenu, URL-u i title-u. Ćirilične varijante su
  marginalne.
- Konkurencija je slaba: `limostar.rs`, `iznajmljivanjeoldtajmera.rs`,
  `iznajmljivanje-limuzina.rs`, `topvencanje.rs`, `oldtimersvadbe.com`.
  Rupe koje koristimo:
  1. niko nije fokusiran **isključivo na venčanja** (svi mešaju mature/snimanja),
  2. cene su skrivene ili raštrkane — jedina stranica sa "cena" u naslovu nema
     nijednu cenu,
  3. **nula strukturiranih podataka** kod konkurencije (nema Service/FAQPage),
  4. lokalni upiti van Beograda su prazni,
  5. najbolji konkurentski FAQ ima 3 pitanja.
- Postojeća luksuzna stranica već rangira za "stari automobili za venčanje" —
  te upite svesno prepuštamo novoj stranici.

## Odluke

1. **Slug:** `/iznajmljivanje-oldtajmera-za-vencanje` (genitiv množine, paralelan
   postojećem `/iznajmljivanje-automobila-za-vencanje`).
2. **Luksuzna stranica zadržava URL** — nosi generički head-term i svu istoriju.
   Menjaju se samo labele (nav, footer, breadcrumb) u "Luksuzni automobili".
   Odbačene alternative: preimenovanje uz 301 (gubitak exact-match sluga) i
   hub+2 ogranka (rizik tankog sadržaja na hubu).
3. **Razdvajanje ključnih reči:** oldtajmer/retro/vintage/stari automobili i
   imena modela idu isključivo na novu stranicu; auto za venčanje / mercedes /
   limuzina / auto za kuma ostaju na luksuznoj. Uzajamni linkovi sa jasnim
   anchor tekstom (retro ↔ moderno) uče Google da su to dve namere.
4. **Cene se prikazuju** (250 € i 350–400 €) — to je glavni diferencijator
   naspram tržišta gde je norma "na upit".
5. **Nav:** stavka TELEFON zamenjena padajućom listom IZNAJMLJIVANJE
   (Retro telefon / Paviljoni i oprema / Retro automobili / Luksuzni automobili).
   Linkovi se uvek renderuju u DOM, skrivaju se samo CSS-om — crawlable bez JS.
6. **Flota u zasebnom data fajlu** (`src/data/oldtajmeri.ts`) jer se ponuda širi
   — dodavanje vozila je dodavanje jednog objekta.

## Invarijante

- Partneri se **nikada ne imenuju** na stranici (white-label, isto pravilo kao
  za luksuznu flotu).
- Ne obećavati modele koje nemamo (fića, buba, Ponton se pominju samo kao
  tržišni pregled u blog postu, nikad u CTA).
- Ne izmišljati domaće statistike — javnih srpskih podataka o udelu oldtajmera
  na svadbama nema.
