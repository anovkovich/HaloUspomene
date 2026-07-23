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
