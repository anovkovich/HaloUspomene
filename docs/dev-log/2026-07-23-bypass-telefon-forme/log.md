# Log — Bypass telefonske verifikacije na svim formama

## 2026-07-23 — task kreiran / istražen (planned)

- **Šta je urađeno:** istražen obuhvat bypass-a kroz sve forme za kreiranje.
  Potvrđeno: bypass (BypassPhoneInput + `verifyBypassToken`) radi SAMO na
  `/napravi-pozivnicu` → `api/pozivnica/create` + `api/premium-pozivnica/create`.
  NE radi na: `/napravi-deciju-pozivnicu` (`api/deciji-rodjendan/create`),
  `/napravi-punoletstvo` (`api/punoletstvo/create`), `/raspored-sedenja`
  (`api/raspored-sedenja/request`), `/qr-galerija-slika-sa-vencanja`
  (`actions.ts`) — sve koriste samo `ensurePhoneVerified(phone_trust_token)`.
  QR galerija dodatno hardkoduje `+381` prefiks u formi. Radni obrazac
  (server + klijent) dokumentovan u `plan.md`.
- **Na šta utiče dalje:** implementacija dira 4 forme + 4 endpointa + admin
  BypassLinkModal/api. Nezavisno od LS PDV taska.
- **Blokade / sledeći korak:** čeka odluku korisnika: (a) da li lead-gen forme
  ulaze u obim, (b) go-ahead za implementaciju po planu (deljeni helper prvo).

## 2026-07-23 — implementacija e2e (5 formi, deljeni helper, admin selektor)

- **Šta je urađeno:** obim potvrđen (samo 5 formi koje kreiraju entitet;
  lead-gen forme van obima). Implementirano:
  - **Serverski helper** `resolvePhoneAuthorization({ rawPhone, bypassToken,
    phoneTrustToken })` + `PhoneAuthError(status, message)` u
    `src/lib/phone-verification.ts` — jedinstvena kapija: bypass token → soft
    ≥6-cifara + preskoči SMS; inače normalizacija (RS) + obavezan
    `ensurePhoneVerified`. SMS gate ostaje OBAVEZAN kad nema validnog bypass-a.
  - **Klijentski** `PhoneAuthField` (`src/components/verification/`) — SMS↔bypass
    switch; `resolveBypassInfo` + `BypassInfo` centralizovani u
    `src/lib/bypass-token.ts` (page servers samo pozovu resolve).
  - **Refaktor pozivnica create** da koristi helper (ponašanje nepromenjeno).
    napravi-pozivnicu page + FormPageWrapper koriste centralizovani resolve/tip.
  - **Ožičene 4 forme + endpointa:** raspored (`RasporedKontaktForm` +
    `api/raspored-sedenja/request`), qr-galerija (`GalleryLeadForm` + `actions.ts`,
    `+381` hardkod → dinamički prefiks), deciji (`BirthdayQuestionnaireForm` +
    `api/deciji-rodjendan/create` + validators `bypassActive` grana),
    punoletstvo (isto). Svaka page čita `?bypass=` i prosleđuje `bypassInfo`.
  - **Admin** `BypassLinkModal` + `api/admin/bypass-link` — selektor odredišnog
    proizvoda (5 formi → 5 putanja); token ostaje path-nezavisan (nosi samo
    country+tokenId).
  - Pre-existing lint počišćen (2× unescaped `"` u wizardima, mrtav `resetForm`
    u galeriji).
  - `tsc --noEmit` čist; `next build` **kompajlira/tipira/lintuje čisto** —
    build pukao samo na prerenderu `/lokacije/*` zbog MongoDB Atlas timeouta
    (mreža/allowlist na lokalnoj mašini, NEvezano za izmene; na Vercel prolazi).
- **Commit / PR:** — (još nije commitovano/pushovano)
- **Na šta utiče dalje:** premium create (`api/premium-pozivnica/create`)
  NAMERNO netaknut — on uopšte NE gejtuje SMS na domaćem putu (samo čita bypass
  za storage); ubacivanje helpera bi DODALO SMS gate i rizikovalo regresiju
  premium buildera. Ako se ikad želi SMS i tamo — poseban task.
- **Posledice:** strani kupci sa bypass linkom mogu da završe svih 5 tokova
  kreiranja. Domaći put nepromenjen (tax=0 analogno — SMS i dalje obavezan).
  `BirthdayData` ne persistuje bypass audit polja (za razliku od `WeddingData`) —
  svesno, tip ih nema; autorizacija svejedno radi. Revert = izolovan diff po
  fajlu.
- **Šta je rešeno:** bypass više ne radi samo na pozivnici — pokriva deciji,
  punoletstvo, raspored, qr-galeriju.
- **Šta je odblokirano:** admin može da izda bypass link za bilo koji od 5
  proizvoda i pošalje ga stranom kupcu.
- **Status:** planned → in-progress (kod gotov, `tsc`/lint čist, čeka
  e2e test uz Mongo pristup + deploy).
- **Blokade / sledeći korak:** testirati svih 5 tokova (bypass + domaći) na
  okruženju sa Mongo pristupom, pa push na `deploy`. Lokalni `next build` ne
  može do kraja bez Atlas allowlist-a.

## 2026-07-23 — note za strane posetioce bez srpskog broja

- **Šta je urađeno:** u `PhoneAuthField` dodat `ForeignCustomerNote` — prikazuje
  se SAMO u SMS modu (ne u bypass modu): „Nemate srpski broj i popunjavate iz
  inostranstva? Pišite nam na Instagram / WhatsApp — pošaljemo vam personalni
  link za pristup bez SMS-a." Klikabilni linkovi (IG `halo_uspomene`, WA
  `wa.me/381677621766`). Centralizovano → automatski na svih 5 formi, light+dark
  varijante. Uklonjen stariji, slabiji (ne-klikabilni) foreign note iz
  `FormPageWrapper` da se ne duplira na pozivnici.
- **Na šta utiče dalje:** strani posetilac bez linka sada zna gde da se javi za
  bypass link umesto da zapne na SMS koraku.
- **Blokade / sledeći korak:** dev-render potvrđen (SMS mod: note+linkovi;
  bypass mod: 0 pojavljivanja). Deo istog uncommitted batch-a — čeka push.

## 2026-07-23 — ujednačavanje pozivnica wizarda na PhoneAuthField

- **Šta je urađeno:** napravi-pozivnicu QuestionnaireForm je koristio stari
  inline phone switch (`BypassPhoneInput`/`PhoneVerificationField` direktno) +
  ručno dodat `ForeignCustomerNote` posle „Kliknite na dugme Kod" hinta →
  drugačiji redosled i drugačija komponenta od deciji/punoletstvo. Prebačen na
  deljenu `PhoneAuthField` (3 importa → 1). Sada sve 3 wizard forme identične:
  polje → ForeignCustomerNote → „Kliknite na dugme Kod" hint. `ForeignCustomerNote`
  je usput ekstrahovan u zaseban fajl da ga dele PhoneAuthField + (ranije)
  pozivnica; sada ga pozivnica dobija kroz PhoneAuthField pa direktan import više
  nije potreban.
- **Na šta utiče dalje:** konzistentan UX telefonskog polja na svih 5 formi.
  onChange semantika ekvivalentna (PhoneAuthField zove onChange+onUnverified;
  clearing praznog tokena je no-op) — isti obrazac koji deciji/punoletstvo već
  koriste u produkciji.
- **Posledice:** manje koda u QuestionnaireForm, jedan izvor istine za phone UI.
  Revert = vraćanje inline switch-a.
- **Blokade / sledeći korak:** HTTP 200, `tsc`/lint čisti. Note na wizard-u je na
  koraku 2 (ne vidi se u curl-u SSR-a). Deo istog uncommitted batch-a.

## 2026-07-23 — foreign note → collapsible click-popover

- **Šta je urađeno:** `ForeignCustomerNote` prebačen sa uvek-vidljivog paragrafa
  na **one-liner sa „…"** (globe + truncate tekst) koji na klik/tap otvara mali
  custom popover sa punim tekstom + IG/WhatsApp linkovima. Klik-toggle (ne
  hover) jer sadrži linkove i mora da radi na mobilnom; zatvara se na
  outside-click / Escape / X. Light+dark varijante.
- **Na šta utiče dalje:** čistiji izgled forme (jedan red umesto 3), sadržaj se
  ne renderuje dok se ne otvori.
- **Blokade / sledeći korak:** dev-render potvrđen (trigger vidljiv; popover tek
  na klik). Deo istog uncommitted batch-a.

## 2026-07-23 — proširenje zemalja: MK + SI + "INT" catch-all

- **Šta je urađeno:** bypass je pokrivao samo RS/BA/HR/ME. Dodato:
  - `bypass-token.ts`: `BypassCountry` proširen sa `MK` (+389), `SI` (+386) i
    **`INT`** (catch-all, callingCode `"+"`, klijent unosi ceo broj sa svojim
    pozivnim → pokriva Austriju/Australiju/bilo šta bez per-country metapodataka;
    bezbedno jer bypass svakako ne validira po zemlji, samo soft ≥6 cifara).
  - `BypassPhoneInput`: INT mod (callingCode `"+"`) → prefiks `+`, poseban
    placeholder + hint „Unesite ceo broj sa pozivnim brojem vaše zemlje".
  - `BypassLinkModal`: region grid dobio MK+SI; dodato full-width „Ostalo —
    druga zemlja" dugme za INT.
  - `resolvePhoneAuthorization`: `normalizePhone` dobija country ≠ INT (INT →
    fallback "RS" za parse hint; broj ionako stiže sa `+` i vodećim pozivnim,
    soft-check je prava kapija).
  - Ijekavica detekcija ispravljena u 4 fajla (InvitationClient,
    PremiumInvitationClient, gde-sedim, audio-knjiga): sa „phone_country != RS →
    ijekavica" na eksplicitno **samo BA/HR/ME → ijekavica** (RS/MK/SI/INT ostaju
    ekavica). `WeddingData.phone_country` i 2 page-local tipa prošireni.
  - premium-create lokalni `bypassCountry` tip proširen na `BypassCountry`.
  - `tsc` + eslint čisti. Dev-render potvrđen: INT → `+` + hint; MK → `+389`.
- **Commit / PR:** — (još nije commitovano/pushovano)
- **Na šta utiče dalje:** admin sada bira 5 region-zemalja + „Ostalo" za sve
  ostalo. Ijekavica logika sada tačnija (MK/SI kupci više ne dobijaju ijekavicu
  greškom).
- **Posledice:** stari zapisi (phone_country RS/BA/HR/ME) nepromenjeni. Novi INT
  zapisi nose `phone_country: "INT"`. Bez migracija.
- **Šta je rešeno:** bypass pokriva bilo koju zemlju sveta, ne samo region.
- **Blokade / sledeći korak:** isto — e2e test uz Mongo pristup + deploy.
  Lokalni `next build` i dalje puca na Atlas timeout pri prerenderu `/lokacije/*`
  (mreža/allowlist ove mašine, tranzitno — NEvezano za kod; `tsc`/lint/kompajl
  prolaze). Za pregled UI koristi `next dev` (modal + forme se renderuju).
