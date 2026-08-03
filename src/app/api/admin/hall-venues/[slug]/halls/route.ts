import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { addHall } from "@/lib/hall-venues";



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
