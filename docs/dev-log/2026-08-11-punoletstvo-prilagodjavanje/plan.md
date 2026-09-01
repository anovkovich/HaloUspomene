# Prilagođavanje pozivnice za punoletstvo (galerija + ručice po pozivnici)

- **ID:** 2026-08-11-punoletstvo-prilagodjavanje
- **Status:** deployed
- **Created:** 2026-08-11
- **Owner:** Aleksa

## Why

Punoletstvo je imalo **dve fiksne teme i nijednu ručicu**. Svaki poseban zahtev
klijenta („hoću drugu boju", „hoću svoju ilustraciju", „hoću slike") vodio je ka
pravljenju nove teme — što ne skalira: teme se množe, svaka je mrtav kod čim
proslava prođe.

Konkretan povod: Sara Vučetić (`/punoletstvo/sara-vucetic`, proslava 04.10.2026)
tražila je slike, svoju ilustraciju umesto zlatnog pečata i baby-blue pozadinu.

## Goals

- Punoletstvo dobija galeriju fotografija po uzoru na venčane pozivnice.
- Poseban zahtev klijenta rešava se **izmenom podatka u bazi**, bez deploya —
  ili, ako ručica ne postoji, dodavanjem **generičke** ručice koja od tada radi
  za svakog sledećeg klijenta.
- Nijedna nova tema; nijedna `if (slug === "...")` grana u rendereru.

## Non-Goals

- `overrides` objekat (tekst po slotovima, dodatne sekcije) — **namerno nije
  građen**, v. Decisions.
- Self-serve naplata galerije kroz `kinds.ts` — naplaćuje se ručno dok tražnja
  ne bude dokazana.
- Public upload ruta — vlasnik je jedini admin, admin ruta pokriva ceo tok.
- Refaktor 874-linijskog `PunoletstvoInvitationClient.tsx` u sekcije — nije bio
  potreban za ovaj obim.

## Decisions

**1. DB-driven generičke ručice, bez per-slug registra u kodu.**
Razmatran je registar per-slug override-a u kodu; odbačen. Punoletska pozivnica
živi 4–8 nedelja, pa bi per-slug kod postao smeće dve nedelje posle proslave i
niko ga ne bi brisao. Gvozdeno pravilo: kad zahtev ne pokrivaju postojeće
ručice, u kod ide **nova generička ručica**, nikad per-slug grana. Svaki takav
deploy trajno smanjuje verovatnoću sledećeg.

**2. Flat polja, ista imena kao na venčanju.**
`paid_for_images`, `images`, `image_layout`, `custom_primary_color`,
`custom_background_color` — imena preslikana sa `WeddingData` da admin, grep po
`paid_for_*` i mišićna memorija rade isto na oba proizvoda. Polja stoje na
`BirthdayData` (deljen tip sa dečijim rođendanom) kao opciona; dečiji renderer
ih ignoriše.

**3. Pozadina NE ide kroz `customBackgroundColor` prop.**
`buildCustomColorOverrides` na jedno polje postavlja `--theme-background`,
`--theme-surface` **i** `--theme-surface-alt` — što oboji i uokvirene kartice.
Na punoletstvu se override-uje samo `--theme-background`, jedan nivo ispod
`ThemeProvider`-a. **Isto ime polja, različit obim po proizvodu** — zabeleženo
u tipu jer je zamka.

**4. `overrides` odložen dok ne stigne stvarni zahtev.**
Predlog je bio `{ hiddenSections, copy: Partial<Record<CopySlot,string>>,
extraSections }` sa zatvorenom unijom slotova i čistim tekstom (nikad HTML/MDX).
Nije građen: nijedan od šest realnih zahteva tog dana nije bio „hoću drugačiji
tekst". Slotovi izmišljeni unapred verovatno ne bi bili oni koje prvi klijent
zatraži. `countdown_enabled` i `map_enabled` **već rade** i pokrivaju gašenje
sekcija.

**5. Ilustracija zamenjuje ceo amblem, u manjem okviru.**
`hero_emblem_url` gasi zrake + zlatni pečat + „18" (bore se sa bespoke crtežom)
i renderuje se u `w-32/sm:w-48` umesto `w-36/sm:w-60` — pečat je crtan da popuni
okvir, ilustracija na istoj veličini deluje predimenzionirano.

## Impact

| Fajl | Šta |
|---|---|
| `src/app/deciji-rodjendan/[slug]/types.ts` | +6 opcionih polja na `BirthdayData` |
| `src/app/api/admin/birthdays/[slug]/images/route.ts` | **nov** — POST/DELETE, `slot=gallery\|emblem` |
| `src/app/api/admin/birthdays/[slug]/route.ts` | revalidacija i za `/punoletstvo/` |
| `src/app/punoletstvo/[slug]/PunoletstvoInvitationClient.tsx` | galerija, amblem, boje |
| `src/app/pozivnica/[slug]/PolaroidGallery.tsx` | `showTitle`, donja ivica, hover fix |
| `src/app/admin/rodjendan/[slug]/page.tsx` | panel: galerija / ilustracija / boje |
| `src/lib/birthday.ts` | blob cleanup u `deleteBirthday` |

**Deljena površina:** `PolaroidGallery` koriste i venčane pozivnice — donja
ivica i popravka hovera vide se i tamo (svesno, potvrdio vlasnik).
**Blob:** `images/{slug}/` i `emblem/{slug}/` na Vercel Blob.

## Dependencies

- Nasleđuje `ThemeProvider` iz `/pozivnica/[slug]` — podrška za custom boje je
  tamo već postojala, punoletstvo joj propove nije slalo.
- Vezano za `2026-07-23-bypass-telefon-forme` (deli punoletstvo forme).

## Risks

- **Deljena kolekcija `birthday_events`** — nova polja moraju ostati opciona da
  dečiji rođendan ne pukne. Admin JSON textarea round-tripuje sirov JSON, pa
  nepoznata polja preživljavaju snimanje (provereno).
- **Deljena `PolaroidGallery`** — svaka izmena dira i žive venčane pozivnice.
- **Blob curenje** — `deleteBirthday` nije brisao blobove; postalo bi bag čim
  punoletstvo dobije slike. Zatvoreno u istom deployu.
- **Naplata** — dodavanje `images` tiera u `kinds.ts` povlači ceo karantinski
  protokol (LS proizvod na tačnoj ceni, storefront OFF, `LS_VARIANT_*`).
  Izbegnuto: naplata ručno + admin toggle, kao `paid_for_raspored`.

## Steps

- [x] **Galerija** — polja, admin upload ruta, `PolaroidGallery` posle heroja. _Acceptance:_ 2 slike se renderuju na `/punoletstvo/sara-vucetic`. (log: 2026-08-11)
- [x] **Boje po pozivnici** — `custom_*` u `ThemeProvider`, pozadina odvojena od `surface`. _Acceptance:_ `--theme-background` obojen, `--theme-surface` iz teme. (log: 2026-08-11)
- [x] **Ilustracija u zaglavlju** — `hero_emblem_url`, `slot=emblem`, manji okvir. _Acceptance:_ nema `gold-wax` u heroju. (log: 2026-08-11)
- [x] **Admin panel** — galerija, ilustracija, birači boja; samo `type === "eighteenth"`. _Acceptance:_ sve se menja bez deploya. (log: 2026-08-11)
- [x] **Zatečeni bagovi** — blob cleanup, revalidacija `/punoletstvo/`, hover polaroida. _Acceptance:_ eslint 7 → 0 grešaka. (log: 2026-08-11)

## Verification

```
npx tsc --noEmit
npx eslint "src/app/pozivnica/[slug]/PolaroidGallery.tsx"    # 0 gresaka
rm -rf .next && npx next build && npx next start -p 3000
node /tmp/check-imports.mjs   # svi @/ uvozi u HEAD pokazuju na pracene fajlove
```

Ručno: `/punoletstvo/sara-vucetic` (galerija, ilustracija, pozadina, obe ivice),
`/punoletstvo/primer-momak` (netaknuto), `/deciji-rodjendan/primer-devojcica`,
`/pozivnica/ana-dejan`.

**Rollback:** ručice su opciona polja — brisanje `hero_emblem_url` /
`custom_background_color` iz zapisa vraća podrazumevani izgled bez deploya.
Kod: `git revert` po commitu; nijedna migracija nije rađena.

## Open questions

- Koverta (`EnvelopeLoader`) i dalje nosi zlatni pečat sa „18" — treba li i ona
  da prati ilustraciju?
- Traka galerije je tvrdo bela (`#FFFFFF`); na obojenoj pozadini je beli pojas.
  Namerno zbog „foto-papir" utiska — vezati za temu ako zasmeta.
