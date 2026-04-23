import { NextRequest, NextResponse } from "next/server";
import { upsertBirthday } from "@/lib/birthday";
import { generateUniqueBirthdaySlug } from "@/lib/slug";
import type {
  BirthdayData,
  BirthdayGender,
  BirthdayThemeType,
  BirthdayFontType,
} from "@/app/deciji-rodjendan/[slug]/types";

// IP-based rate limiting — same shape as /api/pozivnica/create
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
    const childName: string = (body.child_name || "").trim();
    if (!childName) {
      return NextResponse.json(
        { error: "child_name is required" },
        { status: 400 },
      );
    }

    const slug = await generateUniqueBirthdaySlug(childName);
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const autoPassword = `${childName.split(" ")[0]}${digits}`;

    const data: BirthdayData = {
      type: "child",
      theme: (body.theme || "boy_animals") as BirthdayThemeType,
      gender: (body.gender || "boy") as BirthdayGender,
      displayFont: (body.displayFont || "fredoka") as BirthdayFontType,
      child_name: childName,
      parent_names: (body.parent_names || "").trim(),
      age: Number.isFinite(body.age) ? Number(body.age) : 1,
      event_date: body.event_date || "",
      submit_until: body.submit_until || "",
      tagline: body.tagline || "",
      location: {
        name: body.location?.name || "",
        address: body.location?.address || "",
        map_url: body.location?.map_url || "",
      },
      countdown_enabled: body.countdown_enabled ?? true,
      map_enabled: body.map_enabled ?? true,
      admin_password: autoPassword,
      draft: true,
    };

    await upsertBirthday(slug, data);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Birthday creation error:", err);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
