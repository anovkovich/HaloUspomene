import { NextResponse } from "next/server";
import { getWeddingData } from "@/data/pozivnice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json({
    valid: data.receipt_valid ?? false,
    created: data.receipt_created ?? null,
    customDiscount: data.custom_discount ?? 0,
    paidForRaspored: data.paid_for_raspored ?? false,
    paidForAudio: data.paid_for_audio ?? false,
    paidForAudioUSB: data.paid_for_audio_USB ?? "",
    paidForImages: data.paid_for_images ?? false,
    customColors: !!(data.custom_primary_color || data.custom_background_color),
    couple: data.couple_names.full_display,
    eventDate: data.event_date,
  });
}
