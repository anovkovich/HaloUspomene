import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { getAllCouples, upsertCouple } from "@/lib/couples";
import { SLUG_FORMAT } from "@/lib/slug";



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
