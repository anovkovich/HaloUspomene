import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import {
  createOrGetUploadLink,
  type UploadProductKind,
} from "@/lib/upload-links";

const VALID_KINDS: ReadonlySet<UploadProductKind> = new Set([
  "couple",
  "birthday",
]);

/** Mints (or returns) the client-facing photo-upload link for one product. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const kind =
    typeof body?.product_kind === "string" &&
    VALID_KINDS.has(body.product_kind as UploadProductKind)
      ? (body.product_kind as UploadProductKind)
      : null;
  const slug =
    typeof body?.slug === "string" && body.slug.trim().length > 0
      ? body.slug.trim()
      : null;

  if (!kind || !slug)
    return NextResponse.json(
      { error: "Missing product_kind or slug" },
      { status: 400 },
    );

  const link = await createOrGetUploadLink(kind, slug);
  return NextResponse.json(link);
}
