import type { RSVPEntry } from "@/lib/rsvp";
import type { Invitee } from "./types";
import { addManualGuestAction, updateGuestCategoryAction } from "./actions";

/**
 * Ručni odgovor zvanice — jedno mesto na kom se piše.
 *
 * Par najčešće dobije odgovor usmeno (telefon), pa ga upisuje umesto gosta.
 * Upis mora da izgleda ISTO kao da je gost sam popunio formu: pravi red u
 * `rsvp_responses` + veza sa zvanicom (`linkedRsvpId`, `manualPotvrda`).
 *
 * Poziva se sa dva mesta — iz „Liste zvanica" (`GuestsCard`) i iz prečice na
 * Pregledu (`QuickAnswerModal`) — zato živi ovde: dve kopije ovog upisa bi pre
 * ili kasnije razišle status zvanice i njenu potvrdu.
 *
 * Namerne asimetrije kod otkazivanja (ne „ujednačavati"): otkazivanje nosi
 * `guestCount: 1` kao i gostov „Ne", ne dira planirani `count` zvanice i ne
 * prenosi kategoriju.
 *
 * Funkcija radi SAMO serverski upis i vraća šta je nastalo; lokalno stanje
 * (lista potvrda, lista zvanica) ažurira svaki pozivalac za sebe, jer ga drži
 * na različite načine.
 */
export type ManualAnswerResult =
  | { ok: false; error: string }
  | {
      ok: true;
      /** Novi red u „Potvrde gostiju", već sa kategorijom. */
      entry: RSVPEntry;
      /** Kategorija preneta sa zvanice ("" kad se ne prenosi). */
      category: string;
      /** Izmene koje treba primeniti na samu zvanicu. */
      patch: Pick<
        Invitee,
        "linkedRsvpId" | "status" | "count" | "manualPotvrda"
      >;
    };

export async function createManualAnswer({
  invitee,
  name,
  count,
  attends,
}: {
  invitee: Invitee | undefined;
  name: string;
  count: number;
  attends: "Da" | "Ne";
}): Promise<ManualAnswerResult> {
  const coming = attends === "Da";
  const category = coming ? invitee?.category ?? "" : "";
  const cleanName = name.trim() || invitee?.name || "Gost";
  const cleanCount = coming ? Math.max(1, count) : 1;

  const result = await addManualGuestAction(cleanName, cleanCount, attends);
  if (!result.success || !result.id) {
    return { ok: false, error: result.error ?? "Greška pri kreiranju potvrde" };
  }

  if (category) await updateGuestCategoryAction(result.id, category);

  return {
    ok: true,
    entry: {
      id: result.id,
      timestamp: new Date().toISOString(),
      name: cleanName,
      attending: attends,
      guestCount: String(cleanCount),
      details: "",
      category,
    } as RSVPEntry,
    category,
    patch: {
      linkedRsvpId: result.id,
      status: coming ? "confirmed" : "declined",
      // Otkazana zvanica zadržava broj osoba sa kojim je planirana.
      count: coming ? cleanCount : invitee?.count ?? cleanCount,
      manualPotvrda: true,
    },
  };
}
