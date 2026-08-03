import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  deleteHall,
  getHallTemplate,
  renameHall,
  saveHallLayout,
} from "@/lib/hall-venues";
import type { TableData } from "@/lib/seating";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    // Role claim required, not just a valid signature: every token we issue
    // (couple sessions, phone-verification trust tokens) is signed with the
    // same key and must not reach admin data.
    const { payload } = await jwtVerify(cookie.value, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

const TABLE_TYPES = ["rectangular", "circle", "single-sided", "decoration"];

/** Structural check on the incoming layout. The facade strips assignments and
 *  recomputes the capacity figures, so this only has to reject malformed shapes. */
function isTableData(v: unknown): v is TableData {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.type === "string" &&
    TABLE_TYPES.includes(t.type) &&
    // Integer and bounded: `sanitizeTables` does `Array(seats).fill(null)`, so a
    // fractional value would throw RangeError and a huge one would allocate a
    // giant array.
    typeof t.seats === "number" &&
    Number.isInteger(t.seats) &&
    t.seats >= 0 &&
    t.seats <= 30 &&
    typeof t.x === "number" &&
    Number.isFinite(t.x) &&
    typeof t.y === "number" &&
    Number.isFinite(t.y) &&
    typeof t.label === "string"
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; hallId: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, hallId } = await params;
  const hall = await getHallTemplate(slug, hallId);
  if (!hall) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hall);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; hallId: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, hallId } = await params;
  const body = (await req.json()) as {
    name?: string;
    tables?: unknown;
  };

  if (body.name !== undefined) {
    if (body.name.trim().length < 2)
      return NextResponse.json(
        { error: "Naziv sale je obavezan (min 2 karaktera)" },
        { status: 400 },
      );
    const ok = await renameHall(slug, hallId, body.name);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.tables !== undefined) {
    if (!Array.isArray(body.tables) || !body.tables.every(isTableData))
      return NextResponse.json(
        { error: "Neispravan format rasporeda." },
        { status: 400 },
      );
    const ok = await saveHallLayout(slug, hallId, body.tables);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; hallId: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, hallId } = await params;
  const ok = await deleteHall(slug, hallId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
