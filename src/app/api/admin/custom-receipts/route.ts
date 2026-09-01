import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import clientPromise from "@/lib/mongodb";
import { recordReceiptRefExact } from "@/lib/payment-refs";



export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = await clientPromise;
    const docs = await client
      .db("halouspomene")
      .collection("custom_receipts")
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    return NextResponse.json(
      docs.map((d) => ({ ...d, id: d._id.toString(), _id: undefined }))
    );
  } catch (e) {
    console.error("custom_receipts GET:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { par, datum, items, ba } = await req.json();
    if (!par || !items?.length)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const client = await clientPromise;
    const created_at = new Date();
    const result = await client
      .db("halouspomene")
      .collection("custom_receipts")
      .insertOne({ par, datum: datum || null, items, ba: ba ?? 0, created_at });

    // Poziv na broj ovog računa se u adminu izvodi iz `created_at`, pa se ovde
    // zavodi tačno taj — bez pomeranja minuta, da zapis i link ostanu isti.
    // Neuspeh ne obara kreiranje računa; samo taj račun ostane nepretraživ.
    await recordReceiptRefExact({
      kind: "custom",
      slug: result.insertedId.toString(),
      displayName: par,
      amountRsd: (items as Array<{ p?: number }>).reduce(
        (s, i) => s + (i.p ?? 0),
        0,
      ),
      items: items as Array<{ l: string; p: number }>,
      bankAccountIdx: typeof ba === "number" ? ba : 0,
      t: created_at.getTime(),
    }).catch((e) => console.error("payment ref za custom racun:", e));

    return NextResponse.json({ id: result.insertedId.toString() });
  } catch (e) {
    console.error("custom_receipts POST:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
