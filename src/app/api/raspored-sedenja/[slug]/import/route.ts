import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import * as XLSX from "xlsx";
import { isStandaloneActive } from "@/lib/standalone-seating";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_ROWS = 1000;

interface ParsedRow {
  rowIndex: number;
  name: string;
  guestCount: number;
  category?: string;
  warnings: string[];
}

interface ParseResult {
  rows: ParsedRow[];
  totalRows: number;
  totalGuests: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Auth: require valid seating session cookie
  const cookie = request.cookies.get(`auth_seating_${slug}`);
  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await jwtVerify(cookie.value, secret);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await isStandaloneActive(slug);
  if (!active) {
    return NextResponse.json({ error: "Pristup nije aktivan" }, { status: 403 });
  }

  // Read multipart upload
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Neispravan upload (multipart/form-data očekivan)" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Fajl nije priložen" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fajl je prevelik (max 2MB)" },
      { status: 400 },
    );
  }

  // Parse — for CSV decode bytes as UTF-8 explicitly so č/ć/š/ž/đ aren't
  // mangled (SheetJS defaults to Latin1 for raw CSV buffers). For binary
  // formats (xlsx/xls) the file carries its own encoding so buffer is fine.
  const fileName = file.name.toLowerCase();
  const isCsv =
    fileName.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/csv";

  let workbook: XLSX.WorkBook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (isCsv) {
      const buf = new Uint8Array(arrayBuffer);
      // Strip UTF-8 BOM if present so it doesn't end up in the first cell.
      const start =
        buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf
          ? 3
          : 0;
      const text = new TextDecoder("utf-8").decode(buf.subarray(start));
      workbook = XLSX.read(text, { type: "string" });
    } else {
      workbook = XLSX.read(Buffer.from(arrayBuffer), { type: "buffer" });
    }
  } catch {
    return NextResponse.json(
      { error: "Ne mogu da pročitam fajl. Podržani formati: .xlsx, .xls, .csv." },
      { status: 400 },
    );
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return NextResponse.json(
      { error: "Fajl ne sadrži ni jedan sheet." },
      { status: 400 },
    );
  }
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  if (raw.length === 0) {
    return NextResponse.json(
      { error: "Fajl je prazan." },
      { status: 400 },
    );
  }
  if (raw.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Previše redova (${raw.length}). Maksimum je ${MAX_ROWS}.` },
      { status: 400 },
    );
  }

  // Detect header row — skip if first row is "Ime", "Broj", "Kategorija" labels.
  const firstRow = raw[0].map((c) => String(c ?? "").trim().toLowerCase());
  const looksLikeHeader =
    firstRow.some((c) =>
      ["ime", "name", "guest", "gost"].some((kw) => c.includes(kw)),
    ) ||
    firstRow.some((c) =>
      ["broj", "count", "guests", "osoba"].some((kw) => c.includes(kw)),
    );
  const dataRows = looksLikeHeader ? raw.slice(1) : raw;

  const rows: ParsedRow[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i];
    const name = String(cells?.[0] ?? "").trim();
    if (!name) continue; // skip empty rows silently

    const warnings: string[] = [];

    // Column B: guest count, optional → default 1
    const rawCount = cells?.[1];
    let guestCount = 1;
    if (rawCount !== undefined && rawCount !== null && String(rawCount).trim() !== "") {
      const n = Number(String(rawCount).replace(",", "."));
      if (Number.isFinite(n) && n >= 1) {
        guestCount = Math.floor(n);
      } else {
        warnings.push("Broj nije validan, postavljeno 1");
      }
    }

    // Column C: category, optional
    const rawCategory = cells?.[2];
    const category = rawCategory != null ? String(rawCategory).trim() : "";

    rows.push({
      rowIndex: looksLikeHeader ? i + 2 : i + 1,
      name,
      guestCount,
      category: category || undefined,
      warnings,
    });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Nema validnih redova u fajlu." },
      { status: 400 },
    );
  }

  const totalGuests = rows.reduce((s, r) => s + r.guestCount, 0);
  const result: ParseResult = {
    rows,
    totalRows: rows.length,
    totalGuests,
  };
  return NextResponse.json(result);
}
