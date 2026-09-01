import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { getAllVendors } from "@/lib/vendors";



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
