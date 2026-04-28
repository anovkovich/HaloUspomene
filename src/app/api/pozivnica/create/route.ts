import { NextRequest, NextResponse } from "next/server";
import { upsertCouple } from "@/lib/couples";
import { generateUniqueSlug } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { ensurePhoneVerified, normalizePhone } from "@/lib/phone-verification";

// Simple IP-based rate limiting (5 per IP per hour)
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { bride, groom, event_date, submit_until_date } = body;

    if (!bride?.trim() || !groom?.trim()) {
      return NextResponse.json(
        { error: "Bride and groom names are required" },
        { status: 400 },
      );
    }

    try {
      await verifyRecaptcha(body.recaptcha_token, "create_invitation", {
        remoteIp: ip,
      });
    } catch (err) {
      if (err instanceof RecaptchaError) {
        return NextResponse.json(
          { error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo." },
          { status: 403 },
        );
      }
      throw err;
    }

    // Phone verification: contact_phone arrives as comma-separated E.164 strings.
    // We require the trust token to match the FIRST (primary) number only.
    const primaryRaw = String(body.contact_phone || "").split(",")[0]?.trim();
    const phoneE164 = normalizePhone(primaryRaw);
    if (!phoneE164) {
      return NextResponse.json(
        { error: "Unesite važeći kontakt telefon." },
        { status: 400 },
      );
    }
    try {
      await ensurePhoneVerified(body.phone_trust_token, phoneE164);
    } catch {
      return NextResponse.json(
        { error: "Verifikujte broj telefona pre slanja." },
        { status: 403 },
      );
    }

    const slug = await generateUniqueSlug(bride, groom);

    // Auto-generate password: GroomName + 4 random digits
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const autoPassword = `${groom}${digits}`;

    const weddingData: WeddingData = {
      theme: body.theme || "classic_rose",
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
      locations: (body.locations || []).map(
        (loc: { name?: string; address?: string; map_url?: string }) => {
          if (!loc.map_url && loc.address) {
            const query = [loc.name, loc.address].filter(Boolean).join(", ");
            return {
              ...loc,
              map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
            };
          }
          return loc;
        },
      ),
      timeline: body.timeline || [],
      countdown_enabled: body.countdown_enabled ?? true,
      map_enabled: body.map_enabled ?? true,
      paid_for_raspored: body.paid_for_raspored ?? false,
      paid_for_audio: body.paid_for_audio ?? false,
      paid_for_audio_USB: body.paid_for_audio_USB || "",
      paid_for_pdf: false,
      ...(body.custom_primary_color
        ? { custom_primary_color: body.custom_primary_color }
        : {}),
      ...(body.custom_background_color
        ? { custom_background_color: body.custom_background_color }
        : {}),
      draft: true,
    };

    const weddingDataWithContact = {
      ...weddingData,
      contact_phone: String(body.contact_phone || ""),
    } as WeddingData;

    await upsertCouple(slug, weddingDataWithContact);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Classic invitation creation error:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
