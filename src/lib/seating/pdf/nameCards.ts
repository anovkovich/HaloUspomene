// A4 name-card export for the seating editor.
//
// Collects the individual guest names from the SELECTED tables and lays them out
// as horizontal name cards, grouped by table. Names flow LEFT TO RIGHT across
// the full page width (unlike the seating PDF's tall columns), each name's cell
// sized from its measured text width so nothing overlaps. After the last name
// of a table, a full-width rule separates it from the next table, which starts
// on a fresh row below it. The couple prints it and cuts it into slips.
//
// Mirrors the font/`jsPDF` pattern of `generatePDF.ts`: native vector text with
// the Serif font, which covers Serbian Latin diacritics AND Cyrillic, so a
// guest name in either script renders correctly while the file stays tiny.

import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData } from "../types";
import { buildTableGuestLists } from "./guestList";

async function loadFont(path: string): Promise<string> {
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

interface NameGroup {
  label: string;
  names: string[];
}

function expandNames(tables: TableData[], attending: RSVPEntry[]): NameGroup[] {
  // buildTableGuestLists groups names per-table into parties; each party yields
  // either its named members (when the couple entered them) or the party
  // holder's name. The table label is carried along so we can section the PDF.
  const groups: NameGroup[] = [];
  for (const t of buildTableGuestLists(tables, attending)) {
    const names: string[] = [];
    for (const g of t.guests) {
      if (g.members.length > 0) {
        for (const m of g.members) names.push(m.name);
      } else {
        names.push(g.name);
      }
    }
    if (names.length > 0) groups.push({ label: t.label, names });
  }
  return groups;
}

export async function generateNameCardsPDF(
  tables: TableData[],
  attending: RSVPEntry[],
  coupleNames: string,
) {
  const groups = expandNames(tables, attending);
  if (groups.length === 0) return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  const serifB64 = await loadFont(
    "/fonts/invitation/CormorantGaramond-Regular.ttf",
  );
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.setFont("Serif");

  const PW = 210,
    PAGE_H = 297;
  const MARGIN = 9;
  const RIGHT = PW - MARGIN;
  const BOTTOM = PAGE_H - MARGIN;

  const LABEL_PT = 11; // "STO 1" section heading
  const LABEL_H = 8; // mm high block for the heading
  const NAME_PT = 20;
  const NAME_H = 13; // mm per row of names
  const PAD_X = 7; // mm left padding inside each name cell

  let x = MARGIN;
  let y = MARGIN;

  const heading = (label: string) => {
    if (y + LABEL_H > BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFontSize(LABEL_PT);
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), x, y + LABEL_H - 1);
    y += LABEL_H;
  };

  const divider = () => {
    // Advance a FULL row past the last name so the rule never cuts through the
    // descenders of the final row's glyphs.
    y += NAME_H + 1;
    if (y + 3 > BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, RIGHT, y);
    y += 3;
  };

  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    heading(g.label);
    x = MARGIN;
    for (const name of g.names) {
      doc.setFontSize(NAME_PT);
      const tw = doc.getTextWidth(name);
      const cellW = tw + PAD_X;
      if (x + cellW > RIGHT) {
        x = MARGIN;
        y += NAME_H;
        if (y + NAME_H > BOTTOM) {
          doc.addPage();
          y = MARGIN;
        }
      }
      doc.setTextColor(35, 35, 35);
      doc.text(name, x, y + NAME_H * 0.72);
      x += cellW;
    }
    // Close the table's block: full-width rule, then room before the next one.
    if (gi < groups.length - 1) {
      divider();
      x = MARGIN;
    }
  }

  doc.save(`imena-stolovi-${coupleNames}.pdf`.replace(/\s+/g, "-"));
}
