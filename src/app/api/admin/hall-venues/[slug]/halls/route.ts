import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { addHall } from "@/lib/hall-venues";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    // Role claim required, not just a valid signature: every token we issue
    // (couple sessions, phone-verification trust tokens) is signed with the
    // same key and must not reach admin data.
    const { payload } = await jwtVerify(cookie.value, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = (await req.json()) as { name?: string };
  const name = (body.name ?? "").trim();
  if (name.length < 2)
    return NextResponse.json(
      { error: "Naziv sale je obavezan (min 2 karaktera)" },
      { status: 400 },
    );

  const hall = await addHall(slug, name);
  if (!hall) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hall);
}
