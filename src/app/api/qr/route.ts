import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("[QR Proxy] Body:", body);

    const res = await fetch("https://nbs.rs/QRcode/api/qr/v1/generate/300", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body,
    });

    const text = await res.text();
    console.log("[QR Proxy] NBS response:", text.slice(0, 200));

    if (!res.ok) {
      return NextResponse.json({ s: { code: 500, desc: "NBS API error" } }, { status: 500 });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ s: { code: 500, desc: "Proxy error" } }, { status: 500 });
  }
}
