import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { getBirthdayData, upsertBirthday, deleteBirthday, patchBirthday } from "@/lib/birthday";



// Drop ISR cache so admin edits show up immediately instead of waiting for
// the revalidate window + a visitor to trigger background regeneration.
function revalidateBirthdayPaths(slug: string) {
  revalidatePath(`/deciji-rodjendan/${slug}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await upsertBirthday(slug, body);
  revalidateBirthdayPaths(slug);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await patchBirthday(slug, body);
  revalidateBirthdayPaths(slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await getBirthdayData(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteBirthday(slug); // Cascades: birthday_events + birthday_rsvp
  revalidateBirthdayPaths(slug);
  return NextResponse.json({ ok: true });
}
