"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { pricing, formatPrice } from "@/data/pricing";

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
function toLatin(text: string): string {
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
function toAscii(text: string): string {
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

function NbsQrCode({
  total,
  couple,
  receiptNo,
}: {
  total: number;
  couple: string;
  receiptNo: string;
}) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (total <= 0) return;

    const safeName = toAscii(couple)
      .replace(/\|/g, "")
      .replace(/\n/g, " ")
      .slice(0, 50);
    // receiptNo format: 20260320-1059 → strip dash for numeric RO
    const ro = receiptNo.replace("-", "");
    const body = `K:PR|V:01|C:1|R:340000003258405791|N:HALO USPOMENE\nNOVI SAD|I:RSD${total},00|SF:189|S:Pozivnica - ${safeName}|RO:${ro}`;

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
  }, [total, couple]);

  if (total <= 0) return null;

  return (
    <div className="text-center mb-2">
      <div className="border-t-2 border-dashed border-gray-300 mb-5" />
      <p className="text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-[-2px]">
        Platite skeniranjem
      </p>
      {qrSrc ? (
        <div className="flex flex-col items-center gap-1">
          <img
            src={qrSrc}
            alt="NBS IPS QR kod za plaćanje"
            className="w-44 h-44"
          />
          <p className="text-[12px] text-gray-400">
            ili na račun: 340-0000032584057-91
          </p>
          <p className="text-[12px] text-gray-400">
            poziv na br. {receiptNo.replace("-", "")}
          </p>
        </div>
      ) : error ? (
        <p className="text-[10px] text-gray-400 py-2">
          QR kod trenutno nije dostupan
        </p>
      ) : (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

interface ReceiptPayload {
  s: string; // slug
  par: string; // couple display name
  datum: string; // event_date ISO
  r: number; // raspored
  a: number; // audio
  uk?: number; // usb kaseta
  ub?: number; // usb bocica
  d: number; // custom discount
  t: number; // timestamp
}

function ReceiptContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<{ payload: ReceiptPayload | null; ready: boolean }>({ payload: null, ready: false });

  useEffect(() => {
    const encoded = params.get("d");
    if (!encoded) { router.replace("/"); return; }

    let data: ReceiptPayload;
    try {
      data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      if (!data.s) { router.replace("/"); return; }
    } catch { router.replace("/"); return; }

    fetch(`/api/racun/${data.s}`)
      .then((res) => res.json())
      .then((apiData) => {
        if (!apiData.valid) { router.replace("/"); }
        else { setState({ payload: data, ready: true }); }
      })
      .catch(() => router.replace("/"));
  }, [params, router]);

  const payload = state.payload;
  if (!state.ready || !payload) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Build line items
  const items: { label: string; amount: number; free?: boolean }[] = [
    { label: "Website pozivnica", amount: pricing.pozivnica.website.price },
    { label: "PDF pozivnica za štampu", amount: 0, free: true },
  ];

  if (payload.r)
    items.push({
      label: "Raspored sedenja",
      amount: pricing.pozivnica.raspored.price,
    });
  if (payload.a)
    items.push({
      label: "Audio knjiga utisaka",
      amount: pricing.pozivnica.audio.price,
    });
  if (payload.uk)
    items.push({
      label: "USB retro kaseta",
      amount: pricing.addons.find((a) => a.id === "usb_kaseta")!.price,
    });
  if (payload.ub)
    items.push({
      label: "USB u bočici",
      amount: pricing.addons.find((a) => a.id === "usb_bocica")!.price,
    });

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const isBundle = !!payload.r && !!payload.a;
  const bundleDiscount = isBundle
    ? pricing.pozivnica.bundleFullPrice - pricing.pozivnica.bundlePrice
    : 0;
  const customDiscount = payload.d ?? 0;
  const totalDiscount = bundleDiscount + customDiscount;
  const total = subtotal - totalDiscount;

  const couple = payload.par || "—";
  const datum = payload.datum
    ? new Date(payload.datum).toLocaleDateString("sr-Latn-RS", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const created = new Date(payload.t);
  const receiptNo = `${created.getFullYear()}${String(created.getMonth() + 1).padStart(2, "0")}${String(created.getDate()).padStart(2, "0")}-${String(created.getHours()).padStart(2, "0")}${String(created.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[360px]">
        <div
          className="bg-white relative"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            fontFamily:
              "ui-monospace, 'Cascadia Code', 'Consolas', 'Courier New', monospace",
          }}
        >
          {/* Torn top edge */}
          <div
            className="h-4 w-full"
            style={{
              background:
                "linear-gradient(135deg, #f5f5f0 33.33%, transparent 33.33%) 0 0, linear-gradient(225deg, #f5f5f0 33.33%, transparent 33.33%) 0 0",
              backgroundSize: "12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div className="px-8 pt-6 pb-2">
            {/* Header */}
            <div className="text-center mb-2">
              <p className="text-[11px] tracking-[0.4em] text-gray-400 mb-2">
                — — — — — — — — — — —
              </p>
              <h1 className="text-md font-bold tracking-[0.3em] text-gray-800 mb-1">
                HaloUspomene.rs
              </h1>
              <p className="text-sm tracking-[0.15em] text-gray-400">
                Porudžbina #{receiptNo}
              </p>
            </div>

            {/* Couple & date */}
            <div className="text-center mt-4 mb-5">
              <p className="text-md font-bold text-gray-800">
                {toLatin(couple)}
              </p>
              {datum && <p className="text-xs text-gray-500 mt-0.5">{datum}</p>}
            </div>

            {/* Meta */}
            <div className="flex justify-between text-[10px] text-gray-400 mb-0">
              <span>Datum: {created.toLocaleDateString("sr-Latn-RS")}</span>
              <span>ovo nije fiskalni račun</span>
            </div>

            {/* Separator */}
            <div className="border-t-2 border-dashed border-gray-300 mb-4" />

            {/* Items */}
            <div className="space-y-2.5 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-800 font-medium">
                    {item.free ? "GRATIS" : formatPrice(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discounts */}
            {totalDiscount > 0 && (
              <>
                <div className="border-t border-dotted border-gray-200 my-3" />
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-green-700">
                      Popust (kompletni paket)
                    </span>
                    <span className="text-green-700 font-bold">
                      -{formatPrice(bundleDiscount)}
                    </span>
                  </div>
                )}
                {customDiscount > 0 && (
                  <div className="flex justify-between text-[12px] mt-1">
                    <span className="text-green-700">Dodatni popust</span>
                    <span className="text-green-700 font-bold">
                      -{formatPrice(customDiscount)}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Total separator */}
            <div className="border-t-2 border-dashed border-gray-300 my-4" />

            {/* Subtotal if discount */}
            {totalDiscount > 0 && (
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Bez popusta</span>
                <span className="line-through">{formatPrice(subtotal)}</span>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm font-bold text-gray-800 tracking-wider">
                UKUPNO
              </span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* NBS IPS QR */}
            <NbsQrCode total={total} couple={couple} receiptNo={receiptNo} />
          </div>

          {/* Torn bottom edge */}
          <div
            className="h-4 w-full"
            style={{
              background:
                "linear-gradient(315deg, #f5f5f0 33.33%, transparent 33.33%) 0 0, linear-gradient(45deg, #f5f5f0 33.33%, transparent 33.33%) 0 0",
              backgroundSize: "12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function RacunPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
          <p className="text-gray-400 font-mono text-sm">Učitavanje...</p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
