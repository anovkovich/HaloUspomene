import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import {
  getPaymentRef,
  normalizePaymentRef,
  recordReceiptRef,
  type PaymentRefKind,
} from "@/lib/payment-refs";
import { getOrderByIpsRef } from "@/lib/orders";
import { KINDS } from "@/lib/payments/kinds";

/** Jedinstven oblik rezultata, bez obzira iz kog izvora dolazi. */
interface RefHit {
  ref: string;
  source: "racun" | "placanje";
  kind: string;
  slug: string;
  displayName: string;
  amountRsd: number;
  issuedAt: string;
  status?: string;
  orderId?: string;
  tier?: string;
  settledAt?: string | null;
  items?: Array<{ l: string; p: number }>;
}

const VALID_KINDS: PaymentRefKind[] = [
  "pozivnica",
  "rodjendan",
  "punoletstvo",
  "raspored",
  "galerija",
  "dogadjaj",
  "telefon",
  "custom",
];

/** GET /api/admin/payment-refs?ref=… — pretraga po pozivu na broj.
 *  Gleda `payment_refs` (računi iz admina) i `orders.ipsRef` (self-serve). */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = req.nextUrl.searchParams.get("ref") ?? "";
  const ref = normalizePaymentRef(raw);
  if (!ref)
    return NextResponse.json(
      { error: "Poziv na broj nije prosleđen" },
      { status: 400 },
    );

  try {
    const [receipt, order] = await Promise.all([
      getPaymentRef(ref),
      getOrderByIpsRef(ref),
    ]);

    const hits: RefHit[] = [];
    if (receipt) {
      hits.push({
        ref: receipt.ref,
        source: "racun",
        kind: receipt.kind,
        slug: receipt.slug,
        displayName: receipt.displayName,
        amountRsd: receipt.amountRsd,
        issuedAt: receipt.issuedAt.toISOString(),
        settledAt: receipt.settledAt ? receipt.settledAt.toISOString() : null,
        items: receipt.items,
      });
    }
    if (order) {
      // Ime entiteta, ne slug — pretraga služi da prepoznaš čija je uplata.
      // Entitet je mogao u međuvremenu da nestane, pa slug ostaje kao fallback.
      let displayName = order.slug;
      try {
        const entity = await KINDS[order.kind]?.loadEntity(order.slug);
        if (entity?.displayName) displayName = entity.displayName;
      } catch {
        /* obrisan ili nedostupan entitet ne sme da obori pretragu */
      }

      hits.push({
        ref: order.ipsRef,
        source: "placanje",
        kind: order.kind,
        slug: order.slug,
        displayName,
        amountRsd: order.amountRsd,
        issuedAt: order.createdAt.toISOString(),
        status: order.status,
        orderId: order.orderId,
        tier: order.tier,
        items: order.lines.map((l) => ({ l: l.l, p: l.rsd })),
      });
    }

    return NextResponse.json({ ref, hits });
  } catch (e) {
    console.error("payment-refs GET:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

/** POST /api/admin/payment-refs — zapisuje poziv na broj u trenutku kad admin
 *  generiše link računa. Vraća i `t`, jer server pomeri minut ako je taj poziv
 *  na broj već zauzet; pozivalac linkom mora da koristi vraćeno `t`. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { kind, slug, displayName, amountRsd, items, bankAccountIdx, t } =
      body ?? {};

    if (!VALID_KINDS.includes(kind))
      return NextResponse.json({ error: "Nepoznat kind" }, { status: 400 });
    if (typeof slug !== "string" || !slug.trim())
      return NextResponse.json({ error: "Nedostaje slug" }, { status: 400 });
    if (typeof amountRsd !== "number" || !Number.isFinite(amountRsd))
      return NextResponse.json({ error: "Nedostaje iznos" }, { status: 400 });

    const result = await recordReceiptRef({
      kind,
      slug: slug.trim(),
      displayName:
        typeof displayName === "string" && displayName.trim()
          ? displayName.trim()
          : slug.trim(),
      amountRsd,
      items: Array.isArray(items) ? items : [],
      bankAccountIdx: typeof bankAccountIdx === "number" ? bankAccountIdx : 0,
      t: typeof t === "number" && Number.isFinite(t) ? t : Date.now(),
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("payment-refs POST:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
