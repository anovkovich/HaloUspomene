"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { pricing, formatPrice } from "@/data/pricing";

function NbsQrCode({ total, couple }: { total: number; couple: string }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (total <= 0) return;

    const body = `K:PR|V:01|C:1|R:340000003258405791|N:HALO USPOMENE\nNOVI SAD|I:RSD${total},00|SF:189|S:Website pozivnica - ${couple}`;

    fetch("https://nbs.rs/QRcode/api/qr/v1/generate/300", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.s?.code === 0 && data.i) {
          setQrSrc(`data:image/png;base64,${data.i}`);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [total, couple]);

  if (error || total <= 0) return null;

  return (
    <div className="text-center mb-6">
      <div className="border-t-2 border-dashed border-gray-300 mb-5" />
      <p className="text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-0">
        Platite skeniranjem
      </p>
      {qrSrc ? (
        <div className="flex flex-col items-center gap-1">
          <img
            src={qrSrc}
            alt="NBS IPS QR kod za plaćanje"
            className="w-40 h-40"
          />
          <div className="flex items-center gap-1.5 mt-1">
            <img
              src="https://ips.nbs.rs/images/logo.png"
              alt="NBS IPS"
              className="h-4 opacity-50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-[9px] text-gray-400">NBS IPS QR</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-1">340-0000032584057-91</p>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function ReceiptContent() {
  const params = useSearchParams();

  let couple = "—",
    datum = "",
    raspored = false,
    audio = false,
    usbKaseta = false,
    usbBocica = false;
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
  } catch {
    /* invalid data */
  }

  const items: { label: string; amount: number; free?: boolean }[] = [
    { label: "Website pozivnica", amount: pricing.pozivnica.website.price },
    { label: "PDF pozivnica za štampu", amount: 0, free: true },
  ];

  if (raspored)
    items.push({
      label: "Raspored sedenja",
      amount: pricing.pozivnica.raspored.price,
    });
  if (audio)
    items.push({
      label: "Audio knjiga utisaka",
      amount: pricing.pozivnica.audio.price,
    });
  if (usbKaseta)
    items.push({
      label: "USB retro kaseta",
      amount: pricing.addons.find((a) => a.id === "usb_kaseta")!.price,
    });
  if (usbBocica)
    items.push({
      label: "USB u bočici",
      amount: pricing.addons.find((a) => a.id === "usb_bocica")!.price,
    });

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const isBundle = raspored && audio;
  const discount = isBundle
    ? pricing.pozivnica.bundleFullPrice - pricing.pozivnica.bundlePrice
    : 0;
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
              background:
                "linear-gradient(135deg, #f5f5f0 33.33%, transparent 33.33%) 0 0, linear-gradient(225deg, #f5f5f0 33.33%, transparent 33.33%) 0 0",
              backgroundSize: "12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div className="px-8 pt-6 pb-2">
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-[11px] tracking-[0.4em] text-gray-400 mb-2">
                — — — — — — — — — — —
              </p>
              <h1 className="text-lg font-bold tracking-[0.3em] text-gray-800 mb-1">
                HALO USPOMENE
              </h1>
              <p className="text-[10px] tracking-[0.15em] text-gray-400">
                halouspomene.rs
              </p>
              <p className="text-[11px] tracking-[0.4em] text-gray-400 mt-2">
                — — — — — — — — — — —
              </p>
            </div>

            {/* Couple & date */}
            <div className="text-center mb-5">
              <p className="text-sm font-bold text-gray-800">{couple}</p>
              {datum && (
                <p className="text-[11px] text-gray-500 mt-0.5">{datum}</p>
              )}
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
                  <span className="text-green-700">
                    Popust (kompletni paket)
                  </span>
                  <span className="text-green-700 font-bold">
                    -{formatPrice(discount)}
                  </span>
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
              <span className="text-sm font-bold text-gray-800 tracking-wider">
                UKUPNO
              </span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* Dashed separator */}
            <div className="border-t-2 border-dashed border-gray-300 mb-2" />

            {/* Footer */}
            <div className="text-center space-y-2 mb-2">
              <p className="text-[12px] text-gray-500">
                Hvala Vam na poverenju!
              </p>
              {/* <p className="text-[12px] text-gray-500 mt-2">Vaša ljubavna priča zaslužuje</p>
              <p className="text-[12px] text-gray-500">samo najbolje uspomene ♥</p> */}
            </div>

            {/* NBS IPS QR Payment */}
            <NbsQrCode total={total} couple={couple} />
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
          <p className="text-gray-400 font-mono text-sm">
            Učitavanje računa...
          </p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
