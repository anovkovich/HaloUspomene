import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createVendorPromo,
  createFriendPromo,
  listVendorPromos,
} from "@/lib/vendor-promos";

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
  const promos = await listVendorPromos();
  return NextResponse.json({ promos });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    type?: string;
    code?: string;
    vendorName?: string;
    contact?: string;
    note?: string;
    percent?: number;
    commissionRsd?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  // Friend codes are auto-generated (random single-use PRIJATELJ####); only the
  // tier percent (50 or 75) is taken from the client, validated in the facade.
  if (body.type === "friend") {
    const r = await createFriendPromo(Number(body.percent));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, code: r.code });
  }

  const result = await createVendorPromo({
    code: body.code ?? "",
    vendorName: body.vendorName ?? "",
    contact: body.contact,
    note: body.note,
    percent: Number(body.percent),
    commissionRsd: Number(body.commissionRsd),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
