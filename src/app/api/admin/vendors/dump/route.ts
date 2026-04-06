import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllVendors } from "@/lib/vendors";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendors = await getAllVendors();
  const lines = vendors.map(
    (v) => `${v.id}|${v.name}|${v.city}|${v.category}|${v.website ?? ""}|${v.phone ?? ""}|${v.instagram ?? ""}`,
  );

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
