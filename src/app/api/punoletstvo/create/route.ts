import { NextRequest, NextResponse } from "next/server";
import { upsertBirthday } from "@/lib/birthday";
import { generateUniqueBirthdaySlug } from "@/lib/slug";
import type {
  BirthdayData,
  BirthdayThemeType,
} from "@/app/deciji-rodjendan/[slug]/types";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  resolvePhoneAuthorization,
  PhoneAuthError,
} from "@/lib/phone-verification";

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
    const honoreeName: string = (body.honoree_name || "").trim();
    const honoreeSurname: string = (body.honoree_surname || "").trim();
    if (!honoreeName || !honoreeSurname) {
      return NextResponse.json(
        { error: "honoree_name and honoree_surname are required" },
        { status: 400 },
      );
    }

    try {
      await verifyRecaptcha(body.recaptcha_token, "create_punoletstvo", {
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

    // Keep the E.164 number: the QR gallery purges photos a few days after the
    // event and only warns by SMS, so a record without a phone can never
    // safely carry `paid_for_gallery`.
    let contactPhone = "";
    try {
      const auth = await resolvePhoneAuthorization({
        rawPhone: body.contact_phone,
        bypassToken: body.bypass_token,
        phoneTrustToken: body.phone_trust_token,
      });
      contactPhone = auth.phoneE164;
    } catch (err) {
      if (err instanceof PhoneAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const theme: BirthdayThemeType =
      body.theme === "white_gold_navy"
        ? "white_gold_navy"
        : "white_gold_burgundy";
    const displayName = `${honoreeName} ${honoreeSurname}`;

    const slug = await generateUniqueBirthdaySlug(honoreeName, honoreeSurname);
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const autoPassword = `${honoreeName}${digits}`;

    // Auto-generate the Google Maps embed URL so the preview shows the map
    // immediately (name OR address, whichever is present).
    const locName = (body.location?.name || "").trim();
    const locAddr = (body.location?.address || "").trim();
    const locQuery = [locName, locAddr].filter(Boolean).join(", ");
    const locMapUrl =
      body.location?.map_url ||
      (locQuery
        ? `https://maps.google.com/maps?q=${encodeURIComponent(locQuery)}&output=embed`
        : "");

    const data: BirthdayData = {
      type: "eighteenth",
      theme,
      // Incoming wizard gender is female|male; map to BirthdayGender domain.
      gender: body.gender === "male" ? "boy" : "girl",
      honoree_name: honoreeName,
      honoree_surname: honoreeSurname,
      // Mirror to legacy birthday fields so existing admin/list UI works.
      child_name: displayName,
      parent_names: "",
      age: 18,
      event_date: body.event_date || "",
      submit_until: body.submit_until || "",
      tagline: body.tagline || "",
      location: {
        name: locName,
        address: locAddr,
        map_url: locMapUrl,
      },
      countdown_enabled: body.countdown_enabled ?? true,
      map_enabled: body.map_enabled ?? true,
      admin_password: autoPassword,
      draft: true,
      ...(contactPhone ? { contact_phone: contactPhone } : {}),
    };

    // scriptFont is persisted alongside — readable by future punoletstvo
    // renderer. The BirthdayData type doesn't declare it yet, but MongoDB
    // accepts the extra field and the admin JSON editor will surface it.
    if (body.scriptFont) {
      (data as BirthdayData & { scriptFont?: string }).scriptFont =
        body.scriptFont;
    }

    await upsertBirthday(slug, data);

    return NextResponse.json({ slug, password: autoPassword });
  } catch (err) {
    console.error("Punoletstvo creation error:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
