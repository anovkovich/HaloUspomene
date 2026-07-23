# Bypass telefonske verifikacije na svim formama za kreiranje

- **ID:** 2026-07-23-bypass-telefon-forme
- **Status:** planned
- **Created:** 2026-07-23
- **Owner:** Aleksa

## Why
Validacija broja telefona je Srbija-only (Infobip SMS OTP). Za kupce iz
inostranstva admin generiše potpisani **bypass link** (JWT, BA/HR/ME/RS) koji
preskače SMS i prihvata broj koji korisnik unese. Ali bypass je ožičen **samo na
`/napravi-pozivnicu`**. Ostale forme za kreiranje/prodaju gase strane kupce na
SMS koraku — ne mogu da kupe.

### Potvrđeno stanje (istraženo 2026-07-23)
| Forma | Klijent | Server | Bypass? |
|---|---|---|---|
| `/napravi-pozivnicu` | QuestionnaireForm | `api/pozivnica/create` + `api/premium-pozivnica/create` | ✅ radi (BypassPhoneInput + verifyBypassToken) |
| `/napravi-deciju-pozivnicu` | BirthdayQuestionnaireForm | `api/deciji-rodjendan/create` | ❌ samo PhoneVerificationField + `ensurePhoneVerified` |
| `/napravi-punoletstvo` | PunoletstvoQuestionnaireForm | `api/punoletstvo/create` | ❌ isto |
| `/raspored-sedenja` | RasporedKontaktForm | `api/raspored-sedenja/request` | ❌ isto (phone_trust_token) |
| `/qr-galerija-slika-sa-vencanja` | GalleryLeadForm | `actions.ts` (server action) | ❌ `ensurePhoneVerified`; broj hardkodovan `+381` |

Radni obrazac (server, `api/pozivnica/create`): ako postoji `body.bypass_token`
→ `verifyBypassToken` daje `{country, tokenId}`; `normalizePhone(raw, country)`;
soft-check ≥6 cifara u bypass modu; `ensurePhoneVerified` se zove **samo kad
NEMA** bypass-a; persist `phone_country`, `phone_verified:false`,
`bypass_token_id`. Klijent: čita token iz URL-a, renderuje `BypassPhoneInput`
umesto `PhoneVerificationField`, šalje `bypass_token` u payload-u.

## Goals
- Strani kupac sa bypass linkom može da završi kreiranje na svih 5 formi.
- Isti bezbednosni model kao pozivnica (potpisan token = autorizacija; SMS se
  preskače samo uz validan token).
- Admin može da generiše bypass link za svaki od ovih tokova.

## Non-Goals
- Menjanje SMS verifikacije za domaće kupce.
- Bypass na čisto lead-gen formama koje NE kreiraju entitet (car/equipment
  rental, štampane, ContactForm) — one samo šalju upit; odlučiti odvojeno.

## Decisions
- Ekstrahovati serverski bypass-branč u deljeni helper (npr.
  `resolvePhoneAuthorization(body)` u `src/lib/phone-verification.ts` ili uz
  `bypass-token.ts`) da se logika ne kopira 5×. _Alternativa (copy-paste po
  ruti) odbačena — feedback: deljene utils idu u `src/lib`._
- Klijent: deljena logika „ako ima ?bypass= token, renderuj BypassPhoneInput" —
  proveriti da li se može izvući iz QuestionnaireForm u deljeni hook/komponentu.

## Impact
- Klijent: BirthdayQuestionnaireForm, PunoletstvoQuestionnaireForm,
  RasporedKontaktForm, GalleryLeadForm (+ eventualni deljeni hook).
- Server: `api/deciji-rodjendan/create`, `api/punoletstvo/create`,
  `api/raspored-sedenja/request`, `qr-galerija-.../actions.ts`.
- Admin: `BypassLinkModal` + `api/admin/bypass-link` — dodati izbor odredišne
  forme (trenutno verovatno hardkodovano na `/napravi-pozivnicu`).
- QR galerija dodatno: broj je hardkodovan `+381` u formi — mora da poštuje
  bypass calling code.

## Dependencies
- Nezavisno od LS PDV taska (2026-07-23-ls-pdv-inostranstvo).
- Odluka: koji tokovi dobijaju bypass (svih 5 kreiranja da, lead-gen forme TBD).

## Risks
- Svaka forma ima svoj payload/oblik — deljeni helper mora da bude dovoljno
  generičan a da ne oslabi proveru (soft ≥6 cifara samo u bypass modu).
- QR galerija koristi server action, ne API rutu — helper mora da radi u oba.
- Da se ne olabavi domaći put: `ensurePhoneVerified` MORA da ostane obavezan kad
  nema validnog bypass tokena.

## Steps
- [ ] **Deljeni serverski helper** — izdvojiti bypass-vs-SMS autorizaciju iz
      `api/pozivnica/create` u reusable f-ju. _Acceptance:_ pozivnica create
      refaktorisan da je koristi, ponašanje nepromenjeno, `tsc` prolazi.
- [ ] **Deljena klijentska logika** — token-iz-URL + BypassPhoneInput switch kao
      hook/komponenta. _Acceptance:_ napravi-pozivnicu koristi je bez regresije.
- [ ] **Ožičiti 4 forme + endpointa** — deciji, punoletstvo, raspored, galerija
      (uklj. `+381` hardkod u galeriji). _Acceptance:_ svaka forma sa validnim
      bypass tokenom kreira entitet bez SMS-a.
- [ ] **Admin bypass link po tipu** — BypassLinkModal bira odredišnu formu.
      _Acceptance:_ admin generiše ispravan link za svaki tok.
- [ ] **Test svih tokova** — `next build && next start`, po jedan bypass i jedan
      domaći submit po formi. _Acceptance:_ bypass prolazi, domaći i dalje traži SMS.

## Verification
Po formi: (1) bez tokena → domaći SMS put i dalje obavezan (403 bez trust
tokena); (2) sa validnim bypass tokenom → kreira entitet sa unetim stranim
brojem, `phone_verified:false`, `bypass_token_id` upisan. Kroz
`next build && next start` (dev 404-uje non-GET dinamičke rute).

## Open questions
- Da li lead-gen forme (car/equipment/štampane/ContactForm) uopšte treba da imaju
  bypass, ili je dovoljno da strani lead prosto ostavi broj bez SMS-a?
- Da li admin bypass link treba jedan „univerzalni" ili po-tipu? (payload već
  nosi samo country; odredište je URL na koji admin lepi token.)
