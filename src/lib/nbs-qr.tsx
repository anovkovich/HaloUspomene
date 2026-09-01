"use client";

// Shared NBS IPS QR machinery, extracted verbatim from `src/app/racun/page.tsx`
// so both the receipt flow (/racun) and the self-serve payment flow (/placanje)
// render the exact same, proven QR payload. The payload format below is
// byte-for-byte identical to what /racun shipped before the extraction — do not
// change it without re-scanning a real receipt in an m-banking app.

import { useState, useEffect } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

const CYR_TO_LAT: Record<string, string> = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Ђ: "Đ",
  Е: "E",
  Ж: "Ž",
  З: "Z",
  И: "I",
  Ј: "J",
  К: "K",
  Л: "L",
  Љ: "Lj",
  М: "M",
  Н: "N",
  Њ: "Nj",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  Ћ: "Ć",
  У: "U",
  Ф: "F",
  Х: "H",
  Ц: "C",
  Ч: "Č",
  Џ: "Dž",
  Ш: "Š",
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ђ: "đ",
  е: "e",
  ж: "ž",
  з: "z",
  и: "i",
  ј: "j",
  к: "k",
  л: "l",
  љ: "lj",
  м: "m",
  н: "n",
  њ: "nj",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ћ: "ć",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "č",
  џ: "dž",
  ш: "š",
};

// Full transliteration with diacritics (for display)
export function toLatin(text: string): string {
  return text
    .split("")
    .map((c) => CYR_TO_LAT[c] ?? c)
    .join("");
}

// ASCII-safe transliteration (for NBS API which rejects diacritics)
const CYR_TO_ASCII: Record<string, string> = {
  ...CYR_TO_LAT,
  Ђ: "Dj",
  Ж: "Z",
  Ћ: "C",
  Ч: "C",
  Џ: "Dz",
  Ш: "S",
  ђ: "dj",
  ж: "z",
  ћ: "c",
  ч: "c",
  џ: "dz",
  ш: "s",
};
export function toAscii(text: string): string {
  return text
    .split("")
    .map((c) => CYR_TO_ASCII[c] ?? c)
    .join("")
    .replace(/[čćžšđČĆŽŠĐ]/g, (m) => {
      const map: Record<string, string> = {
        č: "c",
        ć: "c",
        ž: "z",
        š: "s",
        đ: "dj",
        Č: "C",
        Ć: "C",
        Ž: "Z",
        Š: "S",
        Đ: "Dj",
      };
      return map[m] ?? m;
    });
}

export const BANK_ACCOUNTS = [
  { raw: "340000003258405791", display: "340-0000032584057-91" },
  { raw: "170001040456500004", display: "170-0010404565000-04" },
  { raw: "160600000143665585", display: "160-6000001436655-85" },
];

/** Recipient block as it is written on a paper uplatnica / dictated at a counter
 *  (pošta, banka, menjačnica).
 *
 *  Name: the account holder's REAL name, not the brand. The IPS QR keeps
 *  "HALO USPOMENE" in its N field on purpose — there the name is only shown to
 *  the payer and the money is routed by account number — but at a counter the
 *  teller writes what the client dictates, and the account is a personal one.
 *
 *  Address: deliberately only the town. The Odluka o obliku, sadržini i načinu
 *  korišćenja obrazaca platnih naloga defines the recipient element as "ime i
 *  prezime, odnosno naziv primaoca plaćanja" — the street address is required
 *  for the PAYER, not for the recipient. */
export const RECIPIENT = {
  name: "Aleksa Novković",
  place: "Novi Sad",
  /** Šifra plaćanja, 3 cifre: 1. cifra = oblik (1 gotovinski / 2 bezgotovinski),
   *  poslednje dve = osnov. Osnov 89 = "transakcije po nalogu građana, prenos sa
   *  računa građanina na račun građanina" — tačan osnov jer je primalac fizičko
   *  lice. Na šalteru se plaća gotovinom, pa 189; IPS QR se plaća sa računa, pa
   *  tamo ide 289 — v. `buildIpsPayload`. */
  paymentCodeCash: "189",
};

/** Svrha plaćanja — isti tekst u IPS QR tagu `S` i u redu na uplatnici.
 *
 *  Namerno KONSTANTA, bez ičega izvedenog iz entiteta ili kupljenih stavki:
 *  - mapa kombinacija paketa puca na custom računima i zastareva sa svakim
 *    novim proizvodom;
 *  - ime iz entiteta nije univerzalno — nije uvek par (rođendan, punoletstvo,
 *    raspored, retro telefon), a kod nekih proizvoda je to naziv događaja.
 *
 *  Brend je jedino što važi za svaki proizvod i svaki custom račun. Kupcu je
 *  dovoljno da prepozna kome plaća, na šalteru se lako izdiktira, a identifikaciju
 *  uplate radi poziv na broj. Ostaje komotno ispod 35 karaktera koliko tag `S`
 *  dozvoljava (duže NBS odbija sa code 608). */
export const PAYMENT_PURPOSE = "HaloUspomene";

/** "6900" → "6.900,00" — amount as it is written on an uplatnica. */
function formatSlipAmount(rsd: number): string {
  return rsd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ",00";
}

/** Builds the NBS IPS QR payload string. `ref` must already be the clean
 *  poziv-na-broj (digits only — callers strip any formatting first).
 *
 *  `S:` je po NBS specifikaciji SVRHA PLAĆANJA (naziv platioca je tag `P`, koji
 *  ne šaljemo — platiočeva banka ga popunjava sama). Do 2026-08-13 se u `S`
 *  slalo golo ime para, a parametar se zvao `payerName` — dakle i pogrešno
 *  imenovano i pogrešno popunjeno; kupac je pri skeniranju video "svrha: Marija
 *  & Dragan". Sada ide `PAYMENT_PURPOSE`, isti tekst koji stoji i na uplatnici.
 *  Čišćenje ostaje kao odbrana: ASCII, bez `|` i novih redova (inače bi se
 *  ubacili NBS tagovi), skraćeno na 35 karaktera koliko polje dozvoljava.
 *
 *  `SF:289` — prva cifra šifre plaćanja je oblik plaćanja (1 = gotovinski,
 *  2 = bezgotovinski), poslednje dve su osnov (89 = transakcije po nalogu
 *  građana). IPS QR se uvek skenira u m-banking aplikaciji i plaća sa računa,
 *  dakle bezgotovinski → 289. Do 2026-08-13 je stajalo 189 (gotovinska
 *  varijanta iste svrhe); polje je isključivo statističko i ne utiče ni na
 *  rutiranje ni na iznos, ali 289 je ono što propis traži za ovaj kanal.
 *
 *  `RO:00${ref}` — po NBS Preporukama prve DVE cifre RO taga su broj modela po
 *  kojem je utvrđen poziv na broj (97, 11…); ako model nije korišćen, upisuju se
 *  nule. Do 2026-08-13 smo slali goli `RO:${ref}`, pa su banke prve dve cifre
 *  našeg reference-a čitale kao model: `202608132133` → "model 20". Na
 *  `/placanje` je ref 12 slučajnih cifara (`generateOrderId`, `src/lib/orders.ts`),
 *  pa je ~1% naloga počinjalo sa `97` — tada aplikacija primenjuje MOD 97-10
 *  kontrolu, ona ne prolazi i nalog se ODBIJA pre slanja. Otud prefiks `00`.
 *  Dužina: 2 + 12 = 14 karaktera, limit RO taga je 25. */
export function buildIpsPayload({
  accountRaw,
  amountRsd,
  purpose,
  ref,
}: {
  accountRaw: string;
  amountRsd: number;
  /** Svrha plaćanja — v. `PAYMENT_PURPOSE`. */
  purpose: string;
  ref: string;
}): string {
  const sField = toAscii(purpose)
    .replace(/\|/g, "")
    .replace(/\n/g, " ")
    .slice(0, 35);
  return `K:PR|V:01|C:1|R:${accountRaw}|N:HALO USPOMENE\nNOVI SAD|I:RSD${amountRsd},00|SF:289|S:${sField}|RO:00${ref}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Kopiraj ${label}`}
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {});
      }}
      className="shrink-0 p-1 -m-1 text-gray-400 hover:text-[#AE343F] transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function SlipRow({
  label,
  value,
  copy,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  copy?: string;
  strong?: boolean;
  /** Field the client fills in / leaves empty — rendered as a hint, not data. */
  muted?: boolean;
}) {
  return (
    <div className="px-3 py-2 text-left">
      <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400 leading-none mb-1">
        {label}
      </p>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[13px] leading-snug break-words ${
            muted
              ? "text-gray-400 italic"
              : strong
                ? "font-bold text-gray-900"
                : "text-gray-800"
          }`}
        >
          {value}
        </p>
        {copy && <CopyButton value={copy} label={label} />}
      </div>
    </div>
  );
}

/** The recipient half of an uplatnica — everything a teller needs when the
 *  client pays in cash at a counter instead of scanning the IPS QR. */
export function PaymentSlip({
  total,
  receiptNo,
  bankAccountIdx = 0,
}: {
  total: number;
  receiptNo: string;
  bankAccountIdx?: number;
}) {
  const account = BANK_ACCOUNTS[bankAccountIdx] ?? BANK_ACCOUNTS[0];
  const ref = receiptNo.replace("-", "");

  return (
    <div className="border-2 border-gray-800 bg-white text-left">
      <p className="bg-gray-800 text-white text-[10px] tracking-[0.18em] uppercase px-3 py-1.5">
        Nalog za uplatu
      </p>

      <div className="divide-y divide-gray-200">
        <SlipRow label="Uplatilac" value="vaše ime, prezime i adresa" muted />
        <SlipRow label="Svrha uplate" value={PAYMENT_PURPOSE} />
        <SlipRow
          label="Primalac"
          value={`${RECIPIENT.name}, ${RECIPIENT.place}`}
        />
        <SlipRow
          label="Račun primaoca"
          value={account.display}
          copy={account.raw}
          strong
        />
        <div className="grid grid-cols-[4.5rem_1fr] divide-x divide-gray-200">
          <SlipRow label="Model" value="—" muted />
          <SlipRow label="Poziv na broj" value={ref} copy={ref} strong />
        </div>
        <div className="grid grid-cols-[4.5rem_1fr] divide-x divide-gray-200">
          <SlipRow label="Šifra" value={RECIPIENT.paymentCodeCash} />
          <SlipRow
            label="Iznos"
            value={`${formatSlipAmount(total)} RSD`}
            strong
          />
        </div>
      </div>
    </div>
  );
}

export function NbsQrCode({
  total,
  receiptNo,
  bankAccountIdx = 0,
  hideTopDivider = false,
  showPaymentSlip = false,
}: {
  total: number;
  receiptNo: string;
  bankAccountIdx?: number;
  /** Suppress the leading dashed divider (e.g. when an accordion already draws one). */
  hideTopDivider?: boolean;
  /** Replace the plain account/reference lines with a button that opens the
   *  full uplatnica data (for paying at a counter instead of by phone). */
  showPaymentSlip?: boolean;
}) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [slipOpen, setSlipOpen] = useState(false);

  const account = BANK_ACCOUNTS[bankAccountIdx] ?? BANK_ACCOUNTS[0];

  useEffect(() => {
    if (total <= 0) return;

    // receiptNo format: 20260320-1059 → strip dash for numeric RO
    const ro = receiptNo.replace("-", "");
    const body = buildIpsPayload({
      accountRaw: account.raw,
      amountRsd: total,
      purpose: PAYMENT_PURPOSE,
      ref: ro,
    });

    fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data.s?.code === 0 && data.i) {
          setQrSrc(`data:image/png;base64,${data.i}`);
        } else {
          console.error("NBS QR error:", data);
          setError(true);
        }
      })
      .catch((err) => {
        console.error("QR fetch error:", err);
        setError(true);
      });
  }, [total, account.raw, receiptNo]);

  if (total <= 0) return null;

  return (
    <div className="text-center mb-2">
      {!hideTopDivider && (
        <div className="border-t-2 border-dashed border-gray-300 mb-5" />
      )}
      {/* Napisano velikim slovima u samom tekstu, a ne preko `uppercase` — CSS bi
          od "mBanking" napravio "MBANKING". */}
      <p className="text-[10px] text-gray-400 tracking-[0.15em] mb-[-2px]">
        PLATITE SKENIRANJEM IZ mBANKING
      </p>
      {qrSrc ? (
        <div className="flex flex-col items-center gap-1">
          {/* Base64 data-URI QR — next/image can't optimize a data URI, so a
              plain <img> is correct here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="NBS IPS QR kod za plaćanje"
            className="w-44 h-44"
          />
          {!showPaymentSlip && (
            <>
              <p className="text-[12px] text-gray-400">
                ili na račun: {account.display}
              </p>
              <p className="text-[12px] text-gray-400">
                poziv na br. {receiptNo.replace("-", "")}
              </p>
            </>
          )}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-1 py-2">
          <p className="text-[10px] text-gray-400">
            QR kod trenutno nije dostupan
          </p>
          {!showPaymentSlip && (
            <>
              <p className="text-[12px] text-gray-400">
                Račun: {account.display}
              </p>
              <p className="text-[12px] text-gray-400">
                Poziv na br. {receiptNo.replace("-", "")}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {showPaymentSlip && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setSlipOpen((v) => !v)}
            aria-expanded={slipOpen}
            className="w-full flex items-center justify-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg py-3 px-3 text-[13px] font-bold tracking-wide transition-colors"
          >
            {slipOpen ? "Sakrij podatke za uplatu" : "Prikaži podatke za uplatu"}
            <ChevronDown
              size={16}
              className={`transition-transform ${slipOpen ? "rotate-180" : ""}`}
            />
          </button>

          {slipOpen ? (
            <div className="mt-3">
              <PaymentSlip
                total={total}
                receiptNo={receiptNo}
                bankAccountIdx={bankAccountIdx}
              />
              <p className="text-[10px] text-gray-400 leading-relaxed mt-2 text-left">
                Ovako se popunjava uplatnica na šalteru (pošta, banka,
                menjačnica). Polje <strong>model</strong> ostaje prazno. Ako
                plaćate iz aplikacije umesto na šalteru, šifra plaćanja je{" "}
                <strong>289</strong>.
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 mt-2">
              za uplatu na šalteru — pošta, banka, menjačnica
            </p>
          )}
        </div>
      )}
    </div>
  );
}
