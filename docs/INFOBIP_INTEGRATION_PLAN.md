# Specifikacija za implementaciju Infobip 2FA (OTP) verifikacije

## 1. Cilj projekta

Implementirati robustan sistem za validaciju brojeva telefona korisnika u Srbiji (i globalno) koristeći **Infobip API**. Sistem mora da podržava "Failover" logiku (Viber/WhatsApp prvenstveno, SMS kao rezervna opcija) kako bi se optimizovali troškovi i osigurala dostava.

## 2. Tehnološki Stack

- **Backend:** NEXT.js APIs
- **Baza podataka:** MongoDB
- **API:** Infobip REST API (Verify API) - INFOBIP_API_KEY i INFOBIP_BASE_URL su u .env fajlu!

## 3. Protok Integracije (Workflow)

1. **Trigger:** Korisnik unosi broj telefona na frontend-u (format: `+381...`).
2. **Backend Validation:** Provera formata broja (preporuka: `google-libphonenumber`).
3. **Infobip Verification Request:**
   - Backend poziva Infobip `2FA Create Config` (ako nije ranije podešeno).
   - Backend šalje zahtev za slanje PIN koda preko `Viber` kanala.
   - Postaviti `failover` na `SMS` ako poruka nije isporučena u roku od 60 sekundi.
4. **Verification:** Korisnik unosi 4-cifreni ili 6-cifreni kod.
5. **Final Check:** Backend šalje kod Infobip-u na validaciju. Ako je `valid: true`, broj se u bazi označava kao verifikovan.

## 4. Zadaci za Coding Agenta

### Faza 1: Environment Setup

- Dodaj `INFOBIP_API_KEY` i `INFOBIP_BASE_URL` u `.env` fajl.
- Instaliraj potrebne biblioteke (npr. `axios` za Node.js ili `requests` za Python).

### Faza 2: Implementacija API klijenta

- Kreiraj modul `InfobipService`.
- Implementiraj funkciju `sendVerificationCode(phoneNumber)`:
  - Koristi Infobip **Verify API**.
  - Konfiguriši `destinations` i `verification flow` (Viber -> SMS).
- Implementiraj funkciju `verifyCode(sessionId, code)`:
  - Šalje proveru ka Infobip-u i vraća boolean status.

### Faza 3: Sigurnost i Rate Limiting

- Implementiraj **Rate Limiting**: Maksimalno 3 pokušaja slanja koda po IP adresi/korisniku u roku od 10 minuta.
- Validacija internacionalnog formata broja pre slanja zahteva Infobip-u.

### Faza 4: Error Handling

- Obradi specifične Infobip greške (npr. "Invalid phone number", "No credit left", "Expired PIN").
- Implementiraj logging za neuspele pokušaje verifikacije.

## 5. Infobip Specifični Parametri (za Srbiju)

- **Sender ID:** Koristiti "Verify" ili uneti registrovano ime SaaS-a.
- **Failover:** Postaviti `viber` kao primarni, `sms` kao sekundarni kanal.
- **PIN Length:** 4 ili 6 cifara (definisati u konfiguraciji).

## 6. Production Ready Checklista

- [ ] Implementiran HTTPS poziv ka Infobip-u.
- [ ] Skriveni API ključevi u environment varijablama.
- [ ] ReCAPTCHA integrisana na frontend-u pre okidanja SMS-a (prevencija spam-a).
- [ ] Webhook-ovi za praćenje statusa dostave (opciono, ali preporučeno).

---

**Instrukcija za Agenta:** Kreni od kreiranja `InfobipService` modula i postavljanja osnovne rute za slanje koda. Istruisi programera da napravi account i sve sto treba na infobip dashboard-u!

Korak 1: Kreiranje 2FA Aplikacije (preko API-ja)
Agent treba da pošalje POST zahtev na /2fa/2/applications.
Ime: "HaloUspomene_App"
Šta dobijaš: Dobićeš applicationId. To je tvoj "ključ" za sva dalja slanja.

Korak 2: Kreiranje "Message Template-a"
Agent šalje POST na /2fa/2/applications/{appId}/messages.
Tekst: "Vas kod za verifikaciju je: {{pin}}"
Tip pina: alphanumeric ili numeric (stavi numeric, 4 cifara).

Korak 3: Postavljanje "Failover" pravila
U Infobip Verify API-ju, u kodu definišemo nc (Network Configuration) ili jednostavno listu kanala.

> Koristi Infobip Verify API. Prilikom slanja koda, definiši viber kao primarni kanal, a postavi failover na sms ukoliko poruka nije isporučena (status DELIVERED) u roku od 30-40 sekundi.
