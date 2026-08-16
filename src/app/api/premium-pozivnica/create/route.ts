import { NextRequest, NextResponse } from "next/server";
import { upsertCouple } from "@/lib/couples";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import {
  resolvePhoneAuthorization,
  PhoneAuthError,
} from "@/lib/phone-verification";

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

    // Phone authorization — the SAME gate the classic create endpoint uses, and
    // it subsumes the foreign-customer bypass token this route used to handle on
    // its own. Until 2026-08-16 only the wizard enforced a verified phone here,
    // so a direct POST could create a premium couple with `contact_phone: ""` —
    // a record invisible to every SMS flow we run (seating offer, gallery purge
    // warnings). Client-side validation is not a gate.
    let phoneAuth;
    try {
      phoneAuth = await resolvePhoneAuthorization({
        rawPhone: body.contact_phone,
        bypassToken: body.bypass_token,
        phoneTrustToken: body.phone_trust_token,
      });
    } catch (err) {
      if (err instanceof PhoneAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
    const { phoneCountry, phoneVerified, bypassTokenId } = phoneAuth;

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
        if (loc.map_url) return loc;
        const query = [loc.name, loc.address].filter(Boolean).join(", ");
        if (!query) return loc;
        return { ...loc, map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed` };
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
      premium_custom_bg_note:
        typeof body.premium_custom_bg_note === "string"
          ? body.premium_custom_bg_note.trim().slice(0, 400) || undefined
          : undefined,
      // Fountain needs no manual asset → delivered at create; watercolor +
      // line_art need a hand-crafted background / illustration → in production.
      premium_status: premium_theme === "fountain" ? "isporuceno" : "u_izradi",
      // Fountain theme bundles a 2-photo gallery into the premium price; the
      // form sets paid_for_images: true whenever the user has queued any files
      // on the Fountain step. Other premium themes never set this.
      paid_for_images: body.paid_for_images ?? false,
      images: [],
      // Premium add-ons are billed at the standard price (no premium discount).
      // The Premium package (invitation + raspored + audio + galerija) is
      // delivered by the builder pre-selecting all add-ons — each flag comes
      // straight from the form, same as the classic flow.
      paid_for_raspored: body.paid_for_raspored ?? false,
      paid_for_gallery: body.paid_for_gallery ?? false,
      paid_for_audio: body.paid_for_audio ?? false,
      // Background music is a flat 1000 din add-on across both tiers.
      paid_for_music: body.paid_for_music ?? false,
      // USB souvenir was dropped on the premium path (present on classic) — it's
      // the only COD (pouzeće) signal the admin gets, so persist it here too.
      paid_for_audio_USB: body.paid_for_audio_USB || "",
      builder_extras: {
        premium: true,
        raspored: body.paid_for_raspored ?? false,
        audio: body.paid_for_audio ?? false,
        galerija: body.paid_for_gallery ?? false,
        music: body.paid_for_music ?? false,
        usb: (body.paid_for_audio_USB || "") as "" | "kaseta" | "bocica",
        images: body.paid_for_images ?? false,
        customColor: !!(
          body.custom_primary_color || body.custom_background_color
        ),
      },
      draft: true,
      phone_country: phoneCountry,
      phone_verified: phoneVerified,
      ...(bypassTokenId ? { bypass_token_id: bypassTokenId } : {}),
    };

    // Persist the contact_phone the couple submitted (comma-separated E.164).
    // Stored as plain string so the admin can later toggle show_numbers per
    // entry. Skipped when blank so we don't bloat optional fields.
    if (body.contact_phone?.trim()) {
      (weddingData as WeddingData & { contact_phone?: string }).contact_phone =
        String(body.contact_phone).trim();
    }
    // Per-number toggle + label arrays, parallel to the comma-split
    // contact_phone. Only persisted when the user opted in (typed a label).
    if (Array.isArray(body.show_numbers)) {
      (weddingData as WeddingData).show_numbers = body.show_numbers;
    }
    if (Array.isArray(body.number_names)) {
      (weddingData as WeddingData).number_names = body.number_names;
    }

    // Save to MongoDB
    await upsertCouple(slug, weddingData);

    return NextResponse.json({
      slug,
      preview_url: `/premium-pozivnica/${slug}`,
      // Portal password revealed once on the self-serve success screen.
      password: autoPassword,
    });
  } catch (err) {
    console.error("Premium creation error:", err);
    return NextResponse.json(
      { error: "Creation failed" },
      { status: 500 },
    );
  }
}
