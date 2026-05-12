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
    const { bride, groom, premium_theme } = body;
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
      // Premium always uses luxury_gold for downstream PDF/QR/raspored generators.
      theme: "luxury_gold",
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
      // Premium fields
      premium: true,
      premium_theme: premium_theme || undefined,
      ai_couple_image_url: body.ai_couple_image_url || undefined,
      envelope_items: body.envelope_items || undefined,
      envelope_style: body.envelope_style || "classic",
      envelope_rose_petals: body.envelope_rose_petals || false,
      premium_city: body.premium_city || undefined,
      premium_car: body.premium_car || undefined,
      couple_description: body.couple_description || undefined,
      // Stay in draft — admin manually flips it (and sets premium_paid) after billing.
      draft: true,
    };

    // Preserve the comma-separated E.164 string from the form (primary,
    // optional secondary) so both numbers can be toggled via show_numbers.
    if (body.contact_phone?.trim()) {
      updates.contact_phone = String(body.contact_phone).trim();
    }

    await patchCouple(slug, updates as Partial<WeddingData>);

    return NextResponse.json({
      slug,
      preview_url: `/premium-pozivnica/${slug}`,
    });
  } catch (err) {
    console.error("Premium invitation upgrade error:", err);
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
