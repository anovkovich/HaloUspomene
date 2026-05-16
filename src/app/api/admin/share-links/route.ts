import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createOrGetShareLink,
  getShareLinksForProducts,
  type ProductKind,
} from "@/lib/share-links";
import { getAllCouples } from "@/lib/couples";
import { getAllBirthdays } from "@/lib/birthday";
import { listStandaloneSeatings } from "@/lib/standalone-seating";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret",
);

async function isAdmin(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

const VALID_KINDS: ReadonlySet<ProductKind> = new Set([
  "couple",
  "birthday",
  "seating",
]);

function parseKind(v: unknown): ProductKind | null {
  return typeof v === "string" && VALID_KINDS.has(v as ProductKind)
    ? (v as ProductKind)
    : null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const kind = parseKind(body?.product_kind);
  const slug =
    typeof body?.slug === "string" && body.slug.trim().length > 0
      ? body.slug.trim()
      : null;

  if (!kind || !slug)
    return NextResponse.json(
      { error: "Missing product_kind or slug" },
      { status: 400 },
    );

  const link = await createOrGetShareLink(kind, slug);
  return NextResponse.json(link);
}

/** Bulk visit-stats lookup for one product kind. Returns the share link
 *  record (token + visit_count + last_visited_at) keyed by slug, so admin
 *  list views can display "Otvoreno X puta" without N+1 queries. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = parseKind(req.nextUrl.searchParams.get("kind"));
  if (!kind)
    return NextResponse.json(
      { error: "Missing or invalid kind" },
      { status: 400 },
    );

  let slugs: string[] = [];
  if (kind === "couple") {
    slugs = (await getAllCouples()).map((c) => c.slug);
  } else if (kind === "birthday") {
    slugs = (await getAllBirthdays()).map((b) => b.slug);
  } else if (kind === "seating") {
    slugs = (await listStandaloneSeatings()).map((s) => s.slug);
  }

  const map = await getShareLinksForProducts(kind, slugs);
  return NextResponse.json(map);
}
