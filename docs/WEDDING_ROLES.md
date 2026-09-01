# Funkcija: Uloge u Svadbi

Plan za dodavanje srpskih svadbenih uloga u Moje Venčanje portal — par može da označi ko su im kum, kuma, dever, deveruša, stari svat, barjaktar, devojke za kićenje svatova, itd. — birajući iz RSVP guest liste ili upisujući slobodan tekst.

## 1. Podaci — `wedding_portal` kolekcija

Dodati novo polje uz postojeći checklist/budget:

```ts
type WeddingRoleSlot = {
  id: string; // npr. "kum", "kuma", "dever", "deverusa_1", ...
  roleType: WeddingRoleType;
  label: string; // prikazno ime sa override-om ako treba
  // Slot je popunjen na jedan od dva načina:
  guestName?: string; // izabran iz RSVP/guest liste
  freeText?: string; // ručno unet (kad gost nije u listi)
  note?: string; // opciono — npr. „nosi prsten" ili broj telefona
};

type WeddingRoleType =
  | "kum"
  | "kuma"
  | "dever"
  | "deverusa"
  | "stari_svat"
  | "stara_svatica"
  | "barjaktar"
  | "kicenje_svatova"
  | "custom";
```

Skladišti se kao `roles: WeddingRoleSlot[]` u `wedding_portal` dokumentu para. Ako par nema dokument, kreira se na prvo čuvanje (već postoji obrazac za checklist/budget).

## 2. Predefinisani slotovi (prilikom prvog otvaranja)

Sistem inicijalno popunjava listu sa standardnim srpskim ulogama:

| Slot ID           | Label           | Default kvota       |
| ----------------- | --------------- | ------------------- |
| `kum`             | Kum             | 1                   |
| `kuma`            | Kuma            | 1                   |
| `dever`           | Dever           | 1 (može dodati još) |
| `deverusa`        | Deveruša        | 1 (može dodati još) |
| `stari_svat`      | Stari svat      | 1                   |
| `barjaktar`       | Barjaktar       | 1                   |
| `kicenje_svatova` | Kićenje svatova | do 3                |

Par može:

- **Dodati** dodatne dever-/deveruše instance (drugi dever, treća deveruša)
- **Dodati custom slot** za bilo koju ulogu koja nije u listi
- **Obrisati** slot (osim ako je popunjen — onda samo obriše vrednost)

## 3. UI — gde živi

**Preporuka:** novi sub-tab unutar `GuestsCard`-a, ne nova stranica u sidebar-u. Razlog: uloge su semantički povezane sa gostima, a sidebar je već gust. Tab bar na vrhu GuestsCard:

```
Gosti  |  Uloge   ← novi tab
```

Alternativa (ako želiš veću vidljivost): nova sidebar stavka „Uloge". Recimo ako misliš da treba isticati. Inače sub-tab je čistiji.

## 4. Layout slota

Svaki slot je kartica:

```
┌──────────────────────────────────────────────┐
│  👑  Kum                                     │
│  ┌────────────────────────────────────────┐ │
│  │ Izaberi gosta ili upiši ime...      ▼ │ │ ← combobox
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ Beleška (opciono)                     │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Combobox ponašanje:**

- Otvara dropdown sa **RSVP gostima koji dolaze** (najčešći scenarij)
- Filter po unosu
- Ako uneti tekst ne odgovara nijednom gostu, pokazuje opciju „Koristi kao tekst: '...'" — pa se čuva kao `freeText` umesto `guestName`
- Ovo pokriva oba slučaja koja je pomenuto bez kompleksnog UI-ja

**Vizuelni hint** za status slota:

- Prazan slot → neutralna boja
- Popunjen iz gosta → mali ✓ ikonica + diskretna boja AE343F
- Popunjen freeText → ista boja, ali bez ✓ (nije linkovan na RSVP)

## 5. Server actions

Dva nova actiona u `moje-vencanje/actions.ts`:

```ts
loadWeddingRolesAction(): Promise<WeddingRoleSlot[]>
saveWeddingRoleAction(slot: WeddingRoleSlot): Promise<void>
deleteWeddingRoleAction(id: string): Promise<void>
```

Slot-level save (ne ceo niz) — manje preuzeto na svaki keystroke. Save na blur input/dropdown change.

## 6. Lib facade

Novi fajl `src/lib/wedding-roles.ts` (po CLAUDE.md pravilu — svi MongoDB pristupi idu kroz lib facade). Funkcije:

```ts
getRolesForCouple(slug: string);
upsertRole(slug: string, slot: WeddingRoleSlot);
deleteRole(slug: string, id: string);
```

Skladištenje unutar `wedding_portal` dokumenta — ne pravimo novu kolekciju.

## 7. Inicijalizacija

Prilikom prvog `loadWeddingRolesAction` poziva, ako `roles` polje ne postoji u `wedding_portal` dokumentu, vrati 7 default slotova (kum, kuma, dever, deveruša, stari svat, barjaktar, kićenje svatova). Ne perzistuj defaults dok par nešto ne unese — sprečava "smeće" zapise.

## 8. Cyrillic / Latin

Slotovi koriste `useCyrillic` iz coupleInfo. Mapping objekat:

```ts
const ROLE_LABELS = {
  latin: { kum: "Kum", kuma: "Kuma", dever: "Dever", ... },
  cyrillic: { kum: "Кум", kuma: "Кума", dever: "Девер", ... }
};
```

## 9. Faza 2 (kasnije, ne sada)

- **Render u PDF pozivnici** — opciono sekcija „Svatovi" sa imenima ključnih uloga, gate-ovano novim opt-in čekboksom u PDF modal-u
- **Brza navigacija** sa Overview kartice ako su uloge popunjene (npr. „Kum: Marko Petrović • Kuma: Jelena Đurić")
- **Provera kolizije** — ako je gost dodeljen ulozi pa kasnije promeni RSVP na „ne dolazi", prikazati upozorenje
- **Srpski svadbeni običaji u checklisti** — zaseban dodatak (kupovina mlade, lomljenje čaše, podsetnik za rakiju, dolazak po mladu sa svatovima...) ide u `defaults.ts` kao novi checklist preset koji par može da uveze. Uloge i checklist su različite stvari (uloge = ko, checklist = šta treba uraditi).

## 10. Procena obima

- 1 lib fajl (`wedding-roles.ts`) — ~80 linija
- 3 server actiona u `actions.ts` — ~50 linija
- 1 React komponenta `RolesTab.tsx` — ~250 linija (sa comboboxom)
- 1 sub-tab integracija u `GuestsCard.tsx` — ~30 linija izmena
- TypeScript tipovi u `types.ts` — ~20 linija

**Ukupno: ~430 linija novog koda. Realno ~3-4h posla, plus testiranje.**

## Otvorena pitanja

1. **UI placement** — sub-tab u GuestsCard (predlog) ili nova sidebar stavka „Uloge"?
2. **Custom slotovi** — dozvoliti od starta ili u Fazi 2?
3. **PDF integracija** — Faza 1 ili Faza 2?
