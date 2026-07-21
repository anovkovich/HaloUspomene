import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createManualUnlockedOrder,
  listOrders,
  type OrderStatus,
  type PaymentKind,
} from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get("status");
  const status = statusParam
    ? (statusParam.split(",").map((s) => s.trim()) as OrderStatus[])
    : undefined;

  const orders = await listOrders({ status, limit: 300 });

  // Flag any `review`/`pending` order whose (kind, slug, tier) tuple ALSO has an
  // already-`unlocked` order — a double-payment across rails the founder must
  // eyeball before approving (would otherwise unlock/refund twice).
  const unlockedTuples = new Set(
    orders
      .filter((o) => o.status === "unlocked")
      .map((o) => `${o.kind}|${o.slug}|${o.tier}`),
  );

  const rows = orders.map((o) => ({
    orderId: o.orderId,
    kind: o.kind,
    slug: o.slug,
    tier: o.tier,
    rail: o.rail,
    status: o.status,
    amountRsd: o.amountRsd,
    amountEur: o.amountEur,
    ipsRef: o.ipsRef,
    payerName: o.notify?.payerName ?? null,
    approvedBy: o.approvedBy ?? null,
    adminNote: o.adminNote ?? null,
    createdAt: o.createdAt,
    notifiedAt: o.notify?.at ?? null,
    dupWarning:
      (o.status === "review" || o.status === "pending") &&
      unlockedTuples.has(`${o.kind}|${o.slug}|${o.tier}`),
  }));

  return NextResponse.json({ orders: rows });
}

const VALID_KINDS: ReadonlySet<string> = new Set([
  "pozivnica",
  "rodjendan",
  "punoletstvo",
  "raspored",
  "galerija",
]);

/** Manual ledger entry: admin records a bank-transfer/cash payment that has no
 *  self-serve order to link with (e.g. a custom receipt). Created directly as
 *  `unlocked` — evidence only, entity flags are NOT touched. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    kind?: string;
    slug?: string;
    tier?: string;
    amountRsd?: number;
    label?: string;
    adminNote?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const kind = body.kind ?? "pozivnica";
  if (!VALID_KINDS.has(kind))
    return NextResponse.json({ error: "Nepoznat proizvod." }, { status: 400 });

  const slug = (body.slug ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug))
    return NextResponse.json(
      { error: "Slug: samo mala slova, brojevi i crtice." },
      { status: 400 },
    );

  const amountRsd = Math.round(Number(body.amountRsd));
  if (!Number.isFinite(amountRsd) || amountRsd <= 0 || amountRsd > 1_000_000)
    return NextResponse.json({ error: "Neispravan iznos." }, { status: 400 });

  const label = (body.label ?? "").trim().slice(0, 120) || "Ručna evidencija uplate";
  const tier = (body.tier ?? "custom").trim().slice(0, 30) || "custom";

  const order = await createManualUnlockedOrder({
    kind: kind as PaymentKind,
    slug,
    tier,
    amountRsd,
    lines: [{ l: label, rsd: amountRsd, eur: 0 }],
    adminNote: body.adminNote?.slice(0, 200),
  });

  return NextResponse.json({ ok: true, orderId: order.orderId });
}
