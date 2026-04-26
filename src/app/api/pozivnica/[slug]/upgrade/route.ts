import { NextRequest, NextResponse } from "next/server";
import { getWeddingData, patchCouple } from "@/lib/couples";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const now = Date.now();
    const entry = ipMap.get(ip);
    if (entry && now < entry.resetAt && entry.count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 },
      );
    }
    if (!entry || now >= entry.resetAt) {
      ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    } else {
      entry.count++;
    }

    const { slug } = await params;
    const existing = await getWeddingData(slug);

    if (!existing) {
      return NextResponse.json(
        { error: "Pozivnica nije pronađena" },
        { status: 404 },
      );
    }
    if (existing.draft !== true) {
      return NextResponse.json(
        { error: "Pozivnica je već aktivirana — kontaktirajte podršku" },
        { status: 409 },
      );
    }
    if (existing.premium_paid === true) {
      return NextResponse.json(
        { error: "Premium pozivnica je već naplaćena" },
        { status: 409 },
      );
    }
    if ((existing.locations ?? []).length > 0) {
      return NextResponse.json(
        { error: "Nadogradnja je već poslata, čekamo kontakt admina" },
        { status: 409 },
      );
    }

    const body = await request.json();
    const { bride, groom } = body;
    if (!bride?.trim() || !groom?.trim()) {
      return NextResponse.json(
        { error: "Bride and groom names are required" },
        { status: 400 },
      );
    }

    const locations = (body.locations || []).map(
      (loc: { name?: string; address?: string; map_url?: string; type?: string }) => {
        if (!loc.map_url && loc.address) {
          const query = [loc.name, loc.address].filter(Boolean).join(", ");
          return {
            ...loc,
            map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
          };
        }
        return loc;
      },
    );

    const updates: Partial<WeddingData> & {
      contact_phone?: string;
    } = {
      theme: body.theme || "classic_rose",
      scriptFont: body.scriptFont || "great-vibes",
      useCyrillic: body.useCyrillic ?? false,
      couple_names: {
        bride: bride.trim(),
        groom: groom.trim(),
        full_display:
          body.full_display || `${bride.trim()} & ${groom.trim()}`,
      },
      event_date: body.event_date || "",
      submit_until: body.submit_until_date || "",
      tagline: body.tagline || "",
      thankYouFooter: body.thankYouFooter || "",
      locations,
      timeline: body.timeline || [],
      countdown_enabled: body.countdown_enabled ?? true,
      map_enabled: body.map_enabled ?? true,
      paid_for_raspored: body.paid_for_raspored ?? false,
      paid_for_audio: body.paid_for_audio ?? false,
      paid_for_audio_USB: body.paid_for_audio_USB || "",
      paid_for_pdf: false,
      // Stay in draft — admin manually flips it after billing.
      draft: true,
      // Defensive clear of premium fields in case of misuse.
      premium: false,
    };

    if (body.custom_primary_color) {
      updates.custom_primary_color = body.custom_primary_color;
    }
    if (body.custom_background_color) {
      updates.custom_background_color = body.custom_background_color;
    }

    // Only overwrite contact_phone if the form sent a non-empty one;
    // otherwise preserve quick-register value.
    if (body.contact_phone?.trim()) {
      const digits = String(body.contact_phone).trim().replace(/^\+?381/, "");
      updates.contact_phone = `+381${digits}`;
    }

    await patchCouple(slug, updates as Partial<WeddingData>);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Classic invitation upgrade error:", err);
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
