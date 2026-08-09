import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import {
  getOrder,
  transitionOrder,
  deleteOrder,
  type PaymentKind,
} from "@/lib/orders";
import { KINDS } from "@/lib/payments/kinds";
import { productUrl } from "@/lib/payments/product-urls";
import { recordRedemption } from "@/lib/promo-redemptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



// Drop the ISR cache for the unlocked entity so the flip (draft:false, paid_*,
// active) is visible immediately instead of after the revalidate window.
function revalidateEntity(kind: PaymentKind, slug: string) {
  if (kind === "galerija") {
    // productUrl za galeriju pokazuje na portal; flag paid_for_gallery
    // živi na couple recordu → revalidiraj stranice pozivnice.
    revalidatePath(`/pozivnica/${slug}`);
    revalidatePath(`/premium-pozivnica/${slug}`);
    return;
  }
  const url = productUrl(kind, slug).replace(/\/$/, "");
  revalidatePath(url);
  if (kind === "pozivnica") {
    revalidatePath(`/premium-pozivnica/${slug}`);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  let body: { action?: string; adminNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order)
    return NextResponse.json({ error: "Nije pronađeno." }, { status: 404 });

  if (body.action === "approve") {
    // review OR pending → unlocked. `pending` is allowed so the founder can
    // approve a bank transfer that arrived without the buyer clicking notify.
    const ok = await transitionOrder(
      orderId,
      ["review", "pending"],
      "unlocked",
      { approvedBy: "admin", unlockedAt: new Date() },
    );
    if (ok) {
      try {
        await KINDS[order.kind].unlock(order.slug, order);
        revalidateEntity(order.kind, order.slug);
      } catch (err) {
        console.error("[orders] unlock failed after approve:", orderId, err);
        return NextResponse.json(
          { error: "Otključavanje nije uspelo — proverite entitet." },
          { status: 500 },
        );
      }
      if (order.promo) {
        await recordRedemption({
          code: order.promo.code,
          orderId,
          slug: order.slug,
          kind: order.kind,
        }).catch((e) =>
          console.error("[orders] recordRedemption failed:", orderId, e),
        );
      }
    }
    return NextResponse.json({ ok: true, status: "unlocked" });
  }

  if (body.action === "reject") {
    // `pending` is allowed for the same reason as in approve: the admin sees an
    // X on pending rows too, and rejecting one used to silently no-op while the
    // response still claimed success.
    const ok = await transitionOrder(orderId, ["review", "pending"], "canceled", {
      adminNote: body.adminNote?.slice(0, 200),
    });
    if (!ok)
      return NextResponse.json(
        { error: "Uplata je u međuvremenu promenila status. Osveži listu." },
        { status: 409 },
      );
    return NextResponse.json({ ok: true, status: "canceled" });
  }

  return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
}

/** Removes an order that never saw money. A paid/unlocked/refunded/revoked row
 *  is the money audit trail and is refused — those are reversed with a refund
 *  or a revoke, never deleted. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const res = await deleteOrder(orderId);
  if (res.ok) return NextResponse.json({ ok: true });
  if (res.reason === "not_found")
    return NextResponse.json({ error: "Nije pronađeno." }, { status: 404 });
  return NextResponse.json(
    { error: "Plaćena uplata se ne briše — koristi refundaciju ili povlačenje." },
    { status: 409 },
  );
}
