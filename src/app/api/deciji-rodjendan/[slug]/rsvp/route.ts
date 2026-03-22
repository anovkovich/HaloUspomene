import { NextRequest, NextResponse } from "next/server";
import { getBirthdayData } from "@/lib/birthday";
import { addBirthdayRSVP } from "@/lib/birthday-rsvp";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const data = await getBirthdayData(slug);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check deadline
  const deadline = new Date(data.submit_until);
  deadline.setHours(23, 59, 59, 999);
  if (new Date() > deadline) {
    return NextResponse.json(
      { error: "RSVP period has ended" },
      { status: 410 },
    );
  }

  let body: { name?: string; attending?: string; guestCount?: number; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const attending = body.attending === "Ne" ? "Ne" : "Da";
  const guestCount = Math.max(0, Math.floor(Number(body.guestCount) || 1));
  const message = body.message?.trim() || "";

  const id = await addBirthdayRSVP(slug, { name, attending, guestCount, message });

  return NextResponse.json({ success: true, id });
}
