import type { PaymentRefKind } from "./payment-refs";

/**
 * Zavodi poziv na broj u `payment_refs` u trenutku kad admin generiše link
 * računa, i vraća `t` koje link SME da koristi.
 *
 * Zašto vraća `t`: poziv na broj je `YYYYMMDDHHmm`, pa dva računa u istoj
 * minuti daju isti broj. Server tada pomeri minut unapred i vrati pomereni `t`
 * — link mora da se gradi njime, inače bi zapis i link imali različit broj.
 *
 * Ako upis padne (mreža, istekla sesija), vraća se prosleđeno `t` i link se
 * pravi kao i dosad. Generisanje računa je posao koji ne sme da stane zato što
 * lookup tabela nije uspela da primi red — samo taj račun ostane nepretraživ.
 */
export async function issueReceiptRef(input: {
  kind: PaymentRefKind;
  slug: string;
  displayName: string;
  amountRsd: number;
  items: Array<{ l: string; p: number }>;
  bankAccountIdx: number;
  t: number;
}): Promise<number> {
  try {
    const r = await fetch("/api/admin/payment-refs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!r.ok) return input.t;
    const d = await r.json();
    return typeof d.t === "number" ? d.t : input.t;
  } catch {
    return input.t;
  }
}
