import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting (Keep as is)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function getRateLimitInfo(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime)
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  if (record.count >= RATE_LIMIT) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: RATE_LIMIT - record.count - 1 };
}

function incrementRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime)
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  else record.count++;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // 1. Rate Limit Check
    const rateLimit = getRateLimitInfo(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Previše zahteva. Pokušajte ponovo za sat vremena." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      date,
      location,
      package: packageType,
      honeypot,
      formLoadTime,
    } = body;

    // 2. Honeypot & Timer Check
    if (honeypot) return NextResponse.json({ success: true });

    const submitTime = Date.now();
    if (formLoadTime && submitTime - formLoadTime < 3000) {
      return NextResponse.json(
        { error: "Molimo sačekajte pre slanja." },
        { status: 400 },
      );
    }

    // 3. Validation
    if (!name || !email || !date || !location) {
      return NextResponse.json(
        { error: "Sva polja su obavezna." },
        { status: 400 },
      );
    }

    const formattedDate = new Date(date).toLocaleDateString("sr-RS", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 4. Send Email via Resend
    const { data, error } = await resend.emails.send({
      // IMPORTANT: If you haven't verified your domain on Resend yet,
      // you MUST use 'onboarding@resend.dev' as the 'from' address.
      // Once verified, change this to: "Halo Uspomene <rezervacije@vas-domen.rs>"
      from: "Halo Uspomene <onboarding@resend.dev>",

      // Where to send the notification (you)
      to: [process.env.CONTACT_EMAIL || "test@gmail.com"],

      // IMPORTANT: This allows you to hit "Reply" in your inbox and reply to the customer
      replyTo: email,

      subject: `Nova rezervacija - ${name} - ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AE343F; border-bottom: 2px solid #AE343F; padding-bottom: 10px;">
            Nova Rezervacija - HALO Uspomene
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>Ime:</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>Email:</strong></td><td style="padding:10px; border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>Datum:</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${formattedDate}</td></tr>
            <tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>Lokacija:</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${location}</td></tr>
            <tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>Paket:</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${packageType}</td></tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { error: "Greška pri slanju emaila." },
        { status: 500 },
      );
    }

    // Success
    incrementRateLimit(ip);

    return NextResponse.json({
      success: true,
      message: "Vaša poruka je uspešno poslata!",
      id: data?.id,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 },
    );
  }
}
