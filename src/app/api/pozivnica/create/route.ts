import { NextRequest, NextResponse } from "next/server";
import { upsertCouple } from "@/lib/couples";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { ensurePhoneVerified, normalizePhone } from "@/lib/phone-verification";
import { verifyBypassToken } from "@/lib/bypass-token";

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
    // Two authorization paths:
    //   1. SMS trust token (default, Serbian numbers) — must match the primary
    //      number on the submission.
    //   2. Bypass token (foreign-customer link issued by admin) — skips SMS
    //      verification entirely; we trust the signed token to attest the
    //      country and accept whatever phone the user typed.
    const primaryRaw = String(body.contact_phone || "").split(",")[0]?.trim();
    let bypassCountry: "RS" | "BA" | "HR" | "ME" | null = null;
    let bypassTokenId: string | null = null;

    if (body.bypass_token) {
      try {
        const payload = await verifyBypassToken(body.bypass_token);
        bypassCountry = payload.country;
        bypassTokenId = payload.tokenId;
      } catch {
        return NextResponse.json(
          { error: "Bypass link nije važeći ili je istekao." },
          { status: 403 },
        );
      }
    }

    let phoneE164 = normalizePhone(primaryRaw, bypassCountry || "RS");
    // Bypass mode: admin pre-authorized the submission, so don't gate on the
    // strict country-aware length check libphonenumber-js applies. Accept the
    // typed value with a soft "at least 6 digits" sanity check; admin can fix
    // the number manually if it looks off.
    if (!phoneE164 && bypassTokenId && primaryRaw) {
      const digits = primaryRaw.replace(/\D/g, "");
      if (digits.length >= 6) {
        phoneE164 = primaryRaw.startsWith("+") ? primaryRaw : `+${digits}`;
      }
    }
    if (!phoneE164) {
      return NextResponse.json(
        { error: "Unesite važeći kontakt telefon." },
        { status: 400 },
      );
    }

    if (!bypassTokenId) {
      try {
        await ensurePhoneVerified(body.phone_trust_token, phoneE164);
      } catch {
        return NextResponse.json(
          { error: "Verifikujte broj telefona pre slanja." },
          { status: 403 },
        );
      }
    }

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
      paid_for_images: body.paid_for_images ?? false,
      images: [],
      paid_for_music: body.paid_for_music ?? false,
      ...(body.custom_primary_color
        ? { custom_primary_color: body.custom_primary_color }
        : {}),
      ...(body.custom_background_color
        ? { custom_background_color: body.custom_background_color }
        : {}),
      draft: true,
    };

    const weddingDataWithContact: WeddingData = {
      ...weddingData,
      contact_phone: String(body.contact_phone || ""),
      phone_country: bypassCountry || "RS",
      phone_verified: !bypassTokenId,
      ...(bypassTokenId ? { bypass_token_id: bypassTokenId } : {}),
      // Per-number toggle + label, parallel to the comma-split contact_phone.
      // Only persisted when the user opted in (they typed a label) — admin
      // can always flip later via the panel.
      ...(Array.isArray(body.show_numbers) ? { show_numbers: body.show_numbers } : {}),
      ...(Array.isArray(body.number_names) ? { number_names: body.number_names } : {}),
    };

    await upsertCouple(slug, weddingDataWithContact);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Classic invitation creation error:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
