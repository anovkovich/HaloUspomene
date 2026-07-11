"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { formatPrice } from "@/data/pricing";
import { decodeFromBase64 } from "@/lib/encoding";
import { buildReceiptItems, LEGACY_PRICE_TABLE } from "@/lib/receipt-items";
import { toLatin, NbsQrCode } from "@/lib/nbs-qr";

interface ReceiptPayload {
  s?: string; // slug (optional for standalone)
  kind?: "rodjendan" | "raspored"; // record type — when set, validate against the matching collection
  custom?: 1; // standalone receipt — validate against custom_receipts collection
  id?: string; // custom receipt DB id
  par: string; // couple/recipient display name
  datum?: string; // event_date ISO (optional for standalone)
  r?: number; // raspored
  a?: number; // audio
  uk?: number; // usb kaseta
  ub?: number; // usb bocica
  rp?: number; // retro phone
  pd?: number; // personalizovana dobrodoslica
  cc?: number; // custom colors
  ig?: number; // images
  g?: number; // qr photo gallery
  mu?: number; // background music
  p?: number; // premium invitation
  t18?: number; // punoletstvo (only meaningful when kind === "rodjendan")
  d?: number; // custom discount
  ba?: number; // bank account index (0, 1, 2)
  t: number; // timestamp
  ci?: Array<{l: string; p: number}>; // custom line items
  v?: 2; // payload version (2 = carries a frozen line-item snapshot)
  li?: Array<{ l: string; p: number; f?: 1 }>; // snapshotted line items (f:1 = GRATIS)
  bd?: number; // snapshotted bundle discount
}

function ReceiptContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<{
    payload: ReceiptPayload | null;
    ready: boolean;
  }>({ payload: null, ready: false });

  useEffect(() => {
    const encoded = params.get("d");
    if (!encoded) {
      router.replace("/");
      return;
    }

    let data: ReceiptPayload;
    try {
      data = decodeFromBase64<ReceiptPayload>(encoded);
      if (!data.par) {
        router.replace("/");
        return;
      }
    } catch {
      router.replace("/");
      return;
    }

    // Standalone custom receipt — validate against DB
    if (data.custom) {
      if (!data.id) { router.replace("/"); return; }
      fetch(`/api/racun/custom/${data.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.valid) router.replace("/");
          else setState({ payload: data, ready: true });
        })
        .catch(() => router.replace("/"));
      return;
    }

    if (!data.s) {
      router.replace("/");
      return;
    }

    const validateUrl = data.kind
      ? `/api/racun/${data.s}/?kind=${data.kind}`
      : `/api/racun/${data.s}/`;
    fetch(validateUrl)
      .then((res) => res.json())
      .then((apiData) => {
        if (!apiData.valid) {
          router.replace("/");
        } else {
          setState({ payload: data, ready: true });
        }
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

  // Line items + bundle discount. v2 receipts carry a frozen snapshot (li/bd)
  // taken at generation time, so /racun just renders it — editing pricing.json
  // or flipping a promo can never change an already-sent receipt (the IPS QR
  // amount stays put). Legacy receipts (no `v`) are priced with the frozen
  // LEGACY table so links already in customers' hands never move.
  const built =
    payload.v === 2 && payload.li
      ? { items: payload.li, bundleDiscount: payload.bd ?? 0 }
      : buildReceiptItems(payload, LEGACY_PRICE_TABLE);
  const items = built.items.map((x) => ({
    label: x.l,
    amount: x.p,
    free: x.f === 1,
  }));
  const bundleDiscount = built.bundleDiscount;

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
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
                      Popust na paket
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
            <NbsQrCode total={total} couple={couple} receiptNo={receiptNo} bankAccountIdx={payload.ba ?? 0} />
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
