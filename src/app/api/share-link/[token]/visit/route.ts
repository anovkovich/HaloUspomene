import { NextRequest, NextResponse } from "next/server";
import { recordShareLinkVisit } from "@/lib/share-links";

/** Public, fire-and-forget visit ping from the share page. We accept any
 *  10-char alphanumeric token shape; recordShareLinkVisit silently no-ops
 *  for unknown tokens, so there's no information leak. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[A-Za-z0-9]{1,32}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await recordShareLinkVisit(token);
  } catch {
    // Don't surface DB errors to the client — this is fire-and-forget.
  }
  return NextResponse.json({ ok: true });
}
