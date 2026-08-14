# Log — Pregled za proslave: link, rok, QR za potvrde, print mreža

## 2026-08-14 — Task zaveden i isplaniran

- **Šta je urađeno:** napravljen `plan.md` za obogaćivanje taba Pregled na
  portalu za punoletstvo i dečiji rođendan. Istraženo pre pisanja:
  `OverviewCard.tsx` (1228 lin) razložen na delove koji se **mogu** preneti i
  one koji ne mogu; `extendRsvpDeadlineAction` pročitana u celini;
  `PrintCard` lociran kao lokalna komponenta (`OverviewCard.tsx:1206`);
  `generateQrFlyerPDF` potvrđen kao generičan.
- **Commit / PR:** — (nije pisan proizvodni kod, PLAN mode)
- **Na šta utiče dalje:** koraci 1 i 2 diraju **živa venčanja**
  (`OverviewCard.tsx`, `moje-vencanje/actions.ts`); paralelna sesija je više
  puta tokom 13.08. držala te fajlove, pa pre početka ide `git status`.
- **Posledice:** —
- **Šta je rešeno:** — (planiranje)
- **Šta je odblokirano:** implementacija može da počne čim vlasnik potvrdi obim.
- **Status:** — → planned
- **Blokade / sledeći korak:** čeka odobrenje. Dva otvorena pitanja u planu
  (poruka za Viber uz link; da li flajer za galeriju nuditi pre dana proslave).

### Nalazi iz istraživanja koji su oblikovali plan

- **`/rsvp/[id]` već podržava rođendane.** `TYPES` na liniji 15 sadrži
  `rodjendan` i `punoletstvo`, granjanje po tipu je na 134-166. Uživo
  provereno: `/rsvp/punoletstvo-sara-vucetic/` i `/rsvp/rodjendan-lenka/` daju
  200 sa ispravnim imenom slavljenika. **QR za potvrde time ne traži nijednu
  novu rutu** — što ga je pomerilo sa „možda vredi" na jeftin korak.
- **Venčani QR za potvrde NE vodi na `#rsvp` sidro** nego na
  `/rsvp/pozivnica-{slug}` (`OverviewCard.tsx:290`). Rođendani prate isti
  obrazac; sidro bi gostu otvorilo celu pozivnicu umesto forme.
- **`submit_until` već postoji na `BirthdayData`** i već gejtuje RSVP formu —
  dakle rok se ne uvodi, samo se **prikazuje** klijentu koji ga danas ne vidi.
- **Datumska logika produženja je product-agnostična.** `toISODate` postoji baš
  da izbegne UTC off-by-one koji bi gost osetio kao dan manje; kapa na
  `event_date` sprečava rok posle proslave. Izvlači se umesto da se kopira.
- **Rođendani nemaju generator PDF pozivnice**, pa je ta kartica izbačena iz
  obima (venčanja imaju `generateInvitationPDF`).

### Kontekst: šta je isporučeno pre ovog taska (nije bilo zavedeno)

Rad od 13.08. na istoj površini otišao je u produkciju bez dev-log unosa.
Ukratko, da se ne izgubi:

- `ce48537` — kupac posle uplate dobija PIN i link ka `/pristup` (pre toga:
  punoletstvo i rođendan su propadali kroz PIN granu na `/hvala`, a share link
  se nikad nije kreirao automatski)
- `0a84ab1` — deljena ljuštura portala; dva byte-identična duplikata od po 545
  linija svedena na jednu komponentu
- `246ce5d` — raspored 2.500 / galerija 3.500 / slike 600 kao kupljivi tierovi
- `52054b6` — QR galerija za rođendane + `gde-sedim` kao gostinski hub
- `1e44a91` — lenj `r2` import (statički je vukao ceo S3 klijent u graf svakog
  potrošača `birthday.ts` i rušio `/api/admin/birthday-stats`)
- `8c20384` — SMS zvono adminu na IPS notify
- IPS ispred kartice (utopljeno u tuđi commit `55aa799`)

Ako vlasnik želi, to zaslužuje sopstveni retroaktivan task-folder; ovde stoji
samo kao kontekst za Pregled.

## 2026-08-14 — Ispravka plana: venčanja se ne diraju

- **Šta je urađeno:** revidiran `plan.md` (Odluke 2 i 3, Uticaj, Rizici, korak 1).
  Prva verzija je tražila izvlačenje `PrintCard` iz `OverviewCard.tsx` i
  datumske logike iz `moje-vencanje/actions.ts` u deljene fajlove — čime bi UI
  izmena za rođendane dirala **živa venčanja**. Vlasnik je pitao zašto to uopšte
  dira venčanja i ukazao na presedan samostalnog rasporeda i galerije, gde
  venčani kod nije refaktorisan.
- **Commit / PR:** — (i dalje PLAN mode)
- **Na šta utiče dalje:** task sad nema nijedan dodirni fajl sa paralelnom
  sesijom, pa može da se deployuje sam. Migracija venčanja na
  `PrintCard`/`rsvp-deadline` postaje opciono zasebno čišćenje.
- **Posledice:** svesno privremeno dupliranje ~60 linija prezentacije i ~25
  linija datumske matematike, u zamenu za nula rizika po venčanja.
- **Šta je rešeno:** jedini blokada koju sam sâm postavio (strah od dodirivanja
  živih venčanja) — uklonjena promenom pristupa, ne prihvatanjem rizika.
- **Šta je odblokirano:** implementacija može da počne odmah, bez čekanja da
  paralelna sesija pusti `moje-vencanje` fajlove.
- **Status:** planned (bez promene)
- **Blokade / sledeći korak:** čeka „kreni".

**Merenje koje je odluku učinilo lakom:** `PrintCard` (`OverviewCard.tsx:1206`)
ima **nula** pominjanja `coupleInfo` / `weddingData` / `paidFor` — čista
prezentacija sa dve lucide ikone. Nema šta da se „izvlači"; kopija je tačna.

**Zašto ovo nije u suprotnosti sa jučerašnjim de-dupliranjem dva portala:** juče
su dva **identična** portala živela paralelno i razilazila se — dupliranje je
bilo aktivna šteta. Ovde venčani `PrintCard` radi i ne menja se; dirati ga znači
rizikovati živ ekran zbog estetike arhitekture.

## 2026-08-14 — Implementirano svih pet koraka

- **Šta je urađeno:**
  - `src/components/portal/PrintCard.tsx` — **nov**; prezentaciona kartica sa
    `locked`/`lockLabel` i novim `note` propom (za „aktivan na dan proslave").
  - `src/lib/rsvp-deadline.ts` — **dopisano**, ne prepisano: `MAX_EXTENSION_DAYS`,
    `toISODate`, `computeExtendedDeadline`, `describeDeadline`. Postojeći
    `endOfDeadlineDay` / `isPastSubmitDeadline` netaknuti i **ponovo iskorišćeni**
    u novoj logici umesto novog parsiranja datuma.
  - `portal-actions-core.ts` — `extendDeadlineCore` (auth + load + upis +
    revalidacija obe rute); tanki binderi u oba portala.
  - `ProslavaPortalClient.tsx` — dugme „Kopiraj link pozivnice", blok roka sa
    „Produži 7 dana", print mreža (QR za potvrde · QR Gde sedim · QR za
    galeriju) i modal sa PNG / A6 PDF. `AddonRow` obrisan — mreža ga zamenjuje.
- **Commit / PR:** — (necommitovano)
- **Na šta utiče dalje:** ništa venčano — `git status` potvrđeno bez ijednog
  fajla iz `moje-vencanje/`. Sledeći deploy nosi i ovo.
- **Posledice:** `submit_until` se od sada **menja iz portala** (ranije samo iz
  admina), pa klijent može sam da otvori zatvorene potvrde. Revalidacija obe
  rute je uslov — bez nje bi gost i dalje video zatvorenu formu do sledećeg
  prozora keša. **Revert:** sve aditivno osim brisanja `AddonRow`.
- **Šta je rešeno:** klijent nema odakle da uzme link pozivnice; istekao rok je
  tiho blokirao potvrde bez ijednog traga u portalu; zaključani dodaci su
  prodavali apstrakciju umesto artefakta.
- **Šta je odblokirano:** štampane rođendanske pozivnice mogu da nose QR za
  potvrde.
- **Status:** planned → code-complete
- **Blokade / sledeći korak:** deploy + **skeniranje QR-a telefonom** (jedino
  što `curl` ne može da proveri).

### Dve greške uhvaćene tokom rada

1. **Prepisao sam postojeći `src/lib/rsvp-deadline.ts`.** Fajl je već postojao i
   izvozio `isPastSubmitDeadline`, koji koriste `/api/raspored-sedenja/[slug]/rsvp`
   i `StandaloneRSVPForm`. `Write` je javio „updated", ne „created" — signal koji
   sam propustio. `tsc` je odmah pukao na dva potrošača; vraćeno sa
   `git checkout` i sadržaj **dopisan** umesto prepisan. Nova logika sad koristi
   postojeći `endOfDeadlineDay`, pa obe imaju istu definiciju „kraj tog dana".
2. **Dugme „Produži" se prikazivalo i za prošlu proslavu**, gde akcija uvek
   odbija (`dusan-ivkovic`, proslava 05.06.2026 — potvrđeno da vraća „Proslava
   je prošla"). Dodat uslov `days >= 0` i prikaz greške; ranije je pad bio tih.

### Verifikacija

- Produženje testirano na demo zapisu sa **budućom** proslavom i isteklim rokom:
  akcija vratila `{submitUntil:"2026-08-21", capped:false}`, baza upisala isto,
  demo vraćen na original.
- Tri portala renderuju tačno: `sara-vucetic` (bez rasporeda → 🔒 „Uz raspored
  sedenja"), `dusan-ivkovic` i `lenka` (raspored plaćen → otključan).
- Bundle sadrži sve nove ciljeve: `/rsvp/`, `gde-sedim/?tab=galerija`,
  `qr-potvrde-`, `flajer-potvrde-`, `qr-gde-sedim-`.
- Smoke 6 ruta uključujući `/moje-vencanje` — sve 200.
