import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jwtVerify } from "jose";
import { getOrder, transitionOrder, type PaymentKind } from "@/lib/orders";
import { KINDS } from "@/lib/payments/kinds";
import { productUrl } from "@/lib/payments/product-urls";

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

// Drop the ISR cache for the unlocked entity so the flip (draft:false, paid_*,
// active) is visible immediately instead of after the revalidate window.
function revalidateEntity(kind: PaymentKind, slug: string) {
  const url = productUrl(kind, slug).replace(/\/$/, "");
  revalidatePath(url);
  if (kind === "pozivnica" || kind === "galerija") {
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
    }
    return NextResponse.json({ ok: true, status: "unlocked" });
  }

  if (body.action === "reject") {
    await transitionOrder(orderId, ["review"], "canceled", {
      adminNote: body.adminNote?.slice(0, 200),
    });
    return NextResponse.json({ ok: true, status: "canceled" });
  }

  return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
}
