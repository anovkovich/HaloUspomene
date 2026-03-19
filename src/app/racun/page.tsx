"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { pricing, formatPrice } from "@/data/pricing";

function ReceiptContent() {
  const params = useSearchParams();

  let couple = "—", datum = "", raspored = false, audio = false, usbKaseta = false, usbBocica = false;
  try {
    const raw = params.get("d");
    if (raw) {
      const data = JSON.parse(atob(raw));
      couple = data.par || "—";
      datum = data.datum || "";
      raspored = data.r === 1;
      audio = data.a === 1;
      usbKaseta = data.uk === 1;
      usbBocica = data.ub === 1;
    }
  } catch { /* invalid data */ }

  const items: { label: string; amount: number; free?: boolean }[] = [
    { label: "Website pozivnica", amount: pricing.pozivnica.website.price },
    { label: "PDF pozivnica za štampu", amount: 0, free: true },
  ];

  if (raspored) items.push({ label: "Raspored sedenja", amount: pricing.pozivnica.raspored.price });
  if (audio) items.push({ label: "Audio knjiga utisaka", amount: pricing.pozivnica.audio.price });
  if (usbKaseta) items.push({ label: "USB retro kaseta", amount: pricing.addons.find((a) => a.id === "usb_kaseta")!.price });
  if (usbBocica) items.push({ label: "USB u bočici", amount: pricing.addons.find((a) => a.id === "usb_bocica")!.price });

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const isBundle = raspored && audio;
  const discount = isBundle ? pricing.pozivnica.bundleFullPrice - pricing.pozivnica.bundlePrice : 0;
  const total = subtotal - discount;

  const now = new Date();
  const receiptNo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[360px]">
        {/* Receipt paper */}
        <div
          className="bg-white relative"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {/* Torn top edge */}
          <div
            className="h-4 w-full"
            style={{
              background: "linear-gradient(135deg, #f5f5f0 33.33%, transparent 33.33%) 0 0, linear-gradient(225deg, #f5f5f0 33.33%, transparent 33.33%) 0 0",
              backgroundSize: "12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div className="px-8 pt-6 pb-2">
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-[11px] tracking-[0.4em] text-gray-400 mb-2">— — — — — — — — — — —</p>
              <h1 className="text-lg font-bold tracking-[0.3em] text-gray-800 mb-1">HALO USPOMENE</h1>
              <p className="text-[10px] tracking-[0.15em] text-gray-400">halouspomene.rs</p>
              <p className="text-[11px] tracking-[0.4em] text-gray-400 mt-2">— — — — — — — — — — —</p>
            </div>

            {/* Couple & date */}
            <div className="text-center mb-5">
              <p className="text-sm font-bold text-gray-800">{couple}</p>
              {datum && <p className="text-[11px] text-gray-500 mt-0.5">{datum}</p>}
            </div>

            {/* Receipt number */}
            <div className="flex justify-between text-[10px] text-gray-400 mb-4">
              <span>Uspomena #{receiptNo}</span>
              <span>{now.toLocaleDateString("sr-Latn-RS")}</span>
            </div>

            {/* Dashed separator */}
            <div className="border-t-2 border-dashed border-gray-300 mb-4" />

            {/* Items */}
            <div className="space-y-2 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-800 font-medium">
                    {item.free ? "GRATIS" : formatPrice(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount */}
            {isBundle && (
              <>
                <div className="border-t border-dotted border-gray-200 my-3" />
                <div className="flex justify-between text-[12px]">
                  <span className="text-green-700">Popust (kompletni paket)</span>
                  <span className="text-green-700 font-bold">-{formatPrice(discount)}</span>
                </div>
              </>
            )}

            {/* Total separator */}
            <div className="border-t-2 border-dashed border-gray-300 my-4" />

            {/* Subtotal if discount */}
            {isBundle && (
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Bez popusta</span>
                <span className="line-through">{formatPrice(subtotal)}</span>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm font-bold text-gray-800 tracking-wider">UKUPNO</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>

            {/* Dashed separator */}
            <div className="border-t-2 border-dashed border-gray-300 mb-5" />

            {/* Footer */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-[10px] text-gray-400">Hvala Vam na poverenju!</p>
              <p className="text-[12px] text-gray-500 mt-2">Vaša ljubavna priča zaslužuje</p>
              <p className="text-[12px] text-gray-500">samo najbolje uspomene ♥</p>
            </div>

            {/* Barcode-style decoration */}
            <div className="flex justify-center gap-[2px] mb-4">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="bg-gray-800"
                  style={{
                    width: i % 3 === 0 ? 2 : 1,
                    height: 30,
                    opacity: i % 5 === 0 ? 0.9 : 0.5,
                  }}
                />
              ))}
            </div>

            <p className="text-center text-[9px] text-gray-300 mb-2 tracking-widest">{receiptNo}</p>
          </div>

          {/* Torn bottom edge */}
          <div
            className="h-4 w-full"
            style={{
              background: "linear-gradient(315deg, #f5f5f0 33.33%, transparent 33.33%) 0 0, linear-gradient(45deg, #f5f5f0 33.33%, transparent 33.33%) 0 0",
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">Učitavanje računa...</p>
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}
