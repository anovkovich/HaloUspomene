import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { getPhoneUnits, setPhoneUnits } from "@/lib/phone-rentals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** How many retro phones we can hand out. Admin-editable because it is the only
 *  escape hatch left once the "Dodaj" button hard-blocks a full weekend: borrow
 *  a third phone, raise it to 3, book, lower it back. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ units: await getPhoneUnits() });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { units?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  try {
    await setPhoneUnits(Number(body.units));
  } catch {
    return NextResponse.json(
      { error: "Broj uređaja mora biti ceo broj između 1 i 20." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, units: await getPhoneUnits() });
}
