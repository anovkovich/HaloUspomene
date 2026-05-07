import { NextRequest, NextResponse } from "next/server";
import { upsertCouple } from "@/lib/couples";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

// Simple IP-based rate limiting
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max 5 creations per IP per hour
const RATE_WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
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

    const body = await request.json();

    // Validate required fields
    const { bride, groom, event_date, submit_until_date, premium_theme } = body;
    if (!bride?.trim() || !groom?.trim()) {
      return NextResponse.json(
        { error: "Bride and groom names are required" },
        { status: 400 },
      );
    }

    // Generate unique slug
    let slug: string;
    try {
      slug = await generateUniqueSlug(bride, groom);
    } catch (err) {
      if (err instanceof InvalidSlugInputError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // Auto-generate password: GroomName + 4 random digits
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const autoPassword = `${groom}${digits}`;

    // Build WeddingData
    const weddingData: WeddingData = {
      // Premium pozivnice uvek koriste "luxury_gold" klasičnu temu — gold
      // paleta se povlači u svaki downstream PDF/QR/raspored generator koji
      // čita `theme` polje. Premium vizuelni stil živi odvojeno u
      // `premium_theme` (watercolor / line_art).
      theme: "luxury_gold",
      scriptFont: body.scriptFont || "great-vibes",
      useCyrillic: body.useCyrillic ?? false,
      potvrde_password: autoPassword,
      couple_names: {
        bride: bride.trim(),
        groom: groom.trim(),
        full_display: body.full_display || `${bride.trim()} & ${groom.trim()}`,
      },
      event_date: event_date || "",
      submit_until: submit_until_date || "",
      tagline: body.tagline || "",
      thankYouFooter: body.thankYouFooter || "",
      locations: (body.locations || []).map((loc: { name?: string; address?: string; time?: string; enabled?: boolean; map_url?: string }) => {
        if (!loc.map_url && loc.address) {
          const query = [loc.name, loc.address].filter(Boolean).join(", ");
          return { ...loc, map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed` };
        }
        return loc;
      }),
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
      draft: true,
    };

    // Save to MongoDB
    await upsertCouple(slug, weddingData);

    return NextResponse.json({
      slug,
      preview_url: `/premium-pozivnica/${slug}`,
    });
  } catch (err) {
    console.error("Premium creation error:", err);
    return NextResponse.json(
      { error: "Creation failed" },
      { status: 500 },
    );
  }
}
