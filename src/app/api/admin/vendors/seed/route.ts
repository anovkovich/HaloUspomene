import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getExistingIds, insertNewVendors, upsertVendor } from "@/lib/vendors";

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

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const vendors = body.vendors;
    const mode = body.mode as string | undefined; // "check" | "insert" | "update"

    if (!Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        { error: "vendors array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Validate required fields
    const errors: string[] = [];
    vendors.forEach((v: Record<string, unknown>, i: number) => {
      if (!v.id || !v.name || !v.category || !v.city) {
        errors.push(
          `[${i}] Missing: ${[!v.id && "id", !v.name && "name", !v.category && "category", !v.city && "city"].filter(Boolean).join(", ")}`,
        );
      }
    });
    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Validation failed:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n+${errors.length - 5} more` : ""}` },
        { status: 400 },
      );
    }

    const ids = vendors.map((v: Record<string, unknown>) => v.id as string);
    const existingIds = await getExistingIds(ids);
    const existingSet = new Set(existingIds);

    const newVendors = vendors.filter((v: Record<string, unknown>) => !existingSet.has(v.id as string));
    const duplicates = vendors.filter((v: Record<string, unknown>) => existingSet.has(v.id as string));

    // Default mode: check — return what's new and what's duplicate
    if (!mode || mode === "check") {
      return NextResponse.json({
        ok: true,
        newCount: newVendors.length,
        duplicateCount: duplicates.length,
        duplicateIds: duplicates.map((v: Record<string, unknown>) => v.id),
        duplicateNames: duplicates.map((v: Record<string, unknown>) => `${v.id} (${v.name})`),
      });
    }

    // mode: "insert" — only insert new ones, skip duplicates
    if (mode === "insert") {
      const inserted = await insertNewVendors(newVendors);
      return NextResponse.json({
        ok: true,
        inserted,
        skipped: duplicates.length,
      });
    }

    // mode: "update" — insert new + update existing
    if (mode === "update") {
      const inserted = await insertNewVendors(newVendors);
      let updated = 0;
      for (const v of duplicates) {
        await upsertVendor(v.id as string, v as Parameters<typeof upsertVendor>[1]);
        updated++;
      }
      return NextResponse.json({
        ok: true,
        inserted,
        updated,
      });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` },
      { status: 400 },
    );
  }
}
