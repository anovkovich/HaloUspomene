import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllCouples, upsertCouple } from "@/lib/couples";
import { SLUG_FORMAT } from "@/lib/slug";

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
  try {
    const couples = await getAllCouples();
    return NextResponse.json(couples);
  } catch (e) {
    console.error("getAllCouples failed:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
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
  if (!SLUG_FORMAT.test(slug)) {
    return NextResponse.json(
      {
        error:
          "Slug mora biti u formatu mlada-mladozenja (samo mala slova, cifre i crtice, npr. ana-dejan).",
      },
      { status: 400 }
    );
  }

  try {
    await upsertCouple(slug, data);
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error("upsertCouple failed:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
