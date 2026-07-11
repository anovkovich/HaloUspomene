import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { listOrders, type OrderStatus } from "@/lib/orders";

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
