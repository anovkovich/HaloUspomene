import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { getOrder, transitionOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IPS "Obavesti nas o uplati" — the buyer tells us they've paid via bank
// transfer. This is authoritative for the admin review queue (it transitions
// the order pending → review server-side). The admin-notification EMAIL is
// fired from the client afterwards (Cloudflare blocks server-side Web3Forms
// from Vercel), and email delivery is NOT required — the queue is the truth,
// the email is only a doorbell.

const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max 5 notifies per IP per hour
const RATE_WINDOW = 60 * 60 * 1000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  let body: {
    orderId?: string;
    payerName?: string;
    recaptcha_token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const ip = clientIp(req);
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (entry && now < entry.resetAt && entry.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Previše zahteva. Pokušajte kasnije." },
      { status: 429 },
    );
  }
  if (!entry || now >= entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  } else {
    entry.count++;
  }

  try {
    await verifyRecaptcha(body.recaptcha_token, "payment_notify", {
      remoteIp: ip,
    });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      return NextResponse.json(
        { error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo." },
        { status: 403 },
      );
    }
    throw err;
  }

  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "Nedostaje porudžbina." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { error: "Porudžbina nije pronađena." },
      { status: 404 },
    );
  }

  const payerName = String(body.payerName ?? "").trim().slice(0, 60);

  // pending → review. Replays / double-clicks / an already-approved order match
  // 0 docs and no-op to a 200 (idempotent by construction).
  await transitionOrder(orderId, ["pending"], "review", {
    rail: "ips",
    notify: { at: new Date(), payerName, ip },
  });

  return NextResponse.json({ ok: true });
}
