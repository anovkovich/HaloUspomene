import { google } from "googleapis";

export interface RSVPEntry {
  rowIndex: number; // 1-based sheet row (row 1 = header, data starts at row 2)
  timestamp: string;
  name: string;
  attending: string; // "Da" or "Ne"
  plusOnes: string;
  details: string;
  category: string; // "Mladini" | "Mladozenjini" | "Zajednicki" | ""
}

function getAuth(readonly = true) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Google service account credentials not configured");
  }

  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [
      readonly
        ? "https://www.googleapis.com/auth/spreadsheets.readonly"
        : "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

export async function getRSVPResponses(
  spreadsheetId: string,
): Promise<RSVPEntry[]> {
  const auth = getAuth(true);
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:F",
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];

  // Row 0 = header, data rows start at sheet row 2
  return rows
    .slice(1)
    .map((row, i) => ({
      rowIndex: i + 2, // sheet row number (2-based)
      timestamp: row[0] || "",
      name: row[1] || "",
      attending: row[2] || "",
      plusOnes: row[3] || "1",
      details: row[4] || "",
      category: row[5] || "",
    }))
    .filter((entry) => entry.name.trim() !== "");
}

export async function saveRasporedSedenja(
  spreadsheetId: string,
  json: string,
): Promise<void> {
  const auth = getAuth(false);
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "H1",
    valueInputOption: "RAW",
    requestBody: { values: [[json]] },
  });
}

export async function loadRasporedSedenja(
  spreadsheetId: string,
): Promise<string | null> {
  const auth = getAuth(true);
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "H1",
  });

  return response.data.values?.[0]?.[0] ?? null;
}

export async function setEntryCategory(
  spreadsheetId: string,
  rowIndex: number,
  category: string,
): Promise<void> {
  const auth = getAuth(false);
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `F${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[category]] },
  });
}
