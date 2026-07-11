"use client";

// Shared NBS IPS QR machinery, extracted verbatim from `src/app/racun/page.tsx`
// so both the receipt flow (/racun) and the self-serve payment flow (/placanje)
// render the exact same, proven QR payload. The payload format below is
// byte-for-byte identical to what /racun shipped before the extraction — do not
// change it without re-scanning a real receipt in an m-banking app.

import { useState, useEffect } from "react";

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

/** Builds the NBS IPS QR payload string. `ref` must already be the clean
 *  poziv-na-broj (digits only — callers strip any formatting first). The payer
 *  name is transliterated to ASCII, stripped of pipes/newlines (which would
 *  otherwise inject NBS fields), and clamped to the 35-char S-field limit.
 *  Output is byte-for-byte identical to the original inline /racun payload. */
export function buildIpsPayload({
  accountRaw,
  amountRsd,
  payerName,
  ref,
}: {
  accountRaw: string;
  amountRsd: number;
  payerName: string;
  ref: string;
}): string {
  const sField = toAscii(payerName)
    .replace(/\|/g, "")
    .replace(/\n/g, " ")
    .slice(0, 35);
  return `K:PR|V:01|C:1|R:${accountRaw}|N:HALO USPOMENE\nNOVI SAD|I:RSD${amountRsd},00|SF:189|S:${sField}|RO:${ref}`;
}

export function NbsQrCode({
  total,
  couple,
  receiptNo,
  bankAccountIdx = 0,
  hideTopDivider = false,
}: {
  total: number;
  couple: string;
  receiptNo: string;
  bankAccountIdx?: number;
  /** Suppress the leading dashed divider (e.g. when an accordion already draws one). */
  hideTopDivider?: boolean;
}) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const account = BANK_ACCOUNTS[bankAccountIdx] ?? BANK_ACCOUNTS[0];

  useEffect(() => {
    if (total <= 0) return;

    // receiptNo format: 20260320-1059 → strip dash for numeric RO
    const ro = receiptNo.replace("-", "");
    const body = buildIpsPayload({
      accountRaw: account.raw,
      amountRsd: total,
      payerName: couple,
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
  }, [total, couple, account.raw, receiptNo]);

  if (total <= 0) return null;

  return (
    <div className="text-center mb-2">
      {!hideTopDivider && (
        <div className="border-t-2 border-dashed border-gray-300 mb-5" />
      )}
      <p className="text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-[-2px]">
        Platite skeniranjem
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
          <p className="text-[12px] text-gray-400">
            ili na račun: {account.display}
          </p>
          <p className="text-[12px] text-gray-400">
            poziv na br. {receiptNo.replace("-", "")}
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-1 py-2">
          <p className="text-[10px] text-gray-400">
            QR kod trenutno nije dostupan
          </p>
          <p className="text-[12px] text-gray-400">
            Račun: {account.display}
          </p>
          <p className="text-[12px] text-gray-400">
            Poziv na br. {receiptNo.replace("-", "")}
          </p>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
