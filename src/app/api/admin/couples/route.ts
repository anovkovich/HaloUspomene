import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllCouples, upsertCouple } from "@/lib/couples";

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
  const couples = await getAllCouples();
  return NextResponse.json(couples);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, ...data } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  await upsertCouple(slug, data);
  return NextResponse.json({ ok: true, slug });
}
