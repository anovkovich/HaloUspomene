import { google } from "googleapis";

export interface RSVPEntry {
  timestamp: string;
  name: string;
  attending: string; // "Da" or "Ne"
  plusOnes: string;
  details: string;
}

export async function getRSVPResponses(
  spreadsheetId: string,
): Promise<RSVPEntry[]> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Google service account credentials not configured");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:E",
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];

  // Row 0 is the header (Timestamp, then question texts)
  // Rows 1+ are the actual responses
  return rows
    .slice(1)
    .map((row) => ({
      timestamp: row[0] || "",
      name: row[1] || "",
      attending: row[2] || "",
      plusOnes: row[3] || "1",
      details: row[4] || "",
    }))
    .filter((entry) => entry.name.trim() !== "");
}
