/**
 * Kada paru ponuditi raspored sedenja u tabu Gosti.
 *
 * Okidač NAMERNO ne gleda procenat liste zvanica: ta lista je opciona, pa bi
 * parovi koji je nikad ne popune — a to su baš oni kojima alat najviše treba —
 * ostali bez ponude. Broje se potvrđene OSOBE, ne odgovori: deset odgovora sa
 * po tri osobe nije deset gostiju.
 *
 * Čista funkcija bez I/O — sve što joj treba stiže kroz ulaz, pa je moguće
 * proveriti je bez baze.
 */

export type NudgeStage = "soft" | "strong";

/** Šta se paru nudi: kupovina alata ili ulazak u alat koji već ima. */
export type NudgeState = "unpaid" | "paid_empty";

export interface SeatingNudgeDismiss {
  count: number;
  /** ISO datum do kog je traka utišana. */
  snoozedUntil?: string;
  lastStage?: NudgeStage;
  /** Stanje u kom je dismiss zabeležen — plafon se broji po stanju. */
  state?: NudgeState;
}

export interface SeatingNudgeInput {
  /** Zbir osoba iz potvrda „dolazi". */
  attendingPeople: number;
  /** `event_date` sa pozivnice (ISO). */
  eventDate: string;
  /** `submit_until` sa pozivnice (ISO), ako je rok postavljen. */
  submitUntil?: string;
  paidForRaspored: boolean;
  /** Koliko je gostiju već dobilo mesto za stolom. */
  seated: number;
  draft: boolean;
  dismiss?: SeatingNudgeDismiss;
  /** Ubrizgava se u testovima; podrazumevano „sada". */
  now?: Date;
}

export type SeatingNudgeResult =
  | { show: false }
  | { show: true; state: NudgeState; stage: NudgeStage };

/** Puni dani od `now` do ponoći ciljnog datuma. Negativno = datum je prošao. */
function daysUntil(iso: string, now: Date): number | null {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((b - a) / 86_400_000);
}

/** Plafon prikaza po stanju — posle dva zatvaranja traka ćuti zauvek. */
const MAX_DISMISSALS = 2;
/** Koliko dana traje tišina posle prvog zatvaranja. */
export const SNOOZE_DAYS = 14;

export function evaluateSeatingNudge(
  input: SeatingNudgeInput,
): SeatingNudgeResult {
  const {
    attendingPeople,
    eventDate,
    submitUntil,
    paidForRaspored,
    seated,
    draft,
    dismiss,
    now = new Date(),
  } = input;

  // Probna pozivnica nema stvarne goste — nema šta da se raspoređuje.
  if (draft) return { show: false };

  // Par koji je već krenuo ne dira se: njemu je svaka ponuda šum.
  if (paidForRaspored && seated > 0) return { show: false };

  const days = daysUntil(eventDate, now);
  if (days === null || days < 0) return { show: false };

  const daysToDeadline =
    submitUntil && submitUntil.trim() ? daysUntil(submitUntil, now) : null;

  const soft = attendingPeople >= 30 && days <= 45;
  const strong =
    (daysToDeadline !== null && daysToDeadline <= 7) ||
    (days <= 21 && attendingPeople >= 15);

  if (!soft && !strong) return { show: false };

  const stage: NudgeStage = strong ? "strong" : "soft";
  const state: NudgeState = paidForRaspored ? "paid_empty" : "unpaid";

  // Dismiss se broji po stanju: par koji je zatvorio ponudu za kupovinu, pa
  // kasnije kupio raspored, ima pravo na svež poziv da uđe u alat.
  const relevant = dismiss && (dismiss.state ?? "unpaid") === state ? dismiss : undefined;

  if (relevant) {
    if (relevant.count >= MAX_DISMISSALS) return { show: false };

    // Jaki okidač probija tišinu — ali samo ako je zatvorena bila meka ponuda.
    const breaksSnooze = stage === "strong" && relevant.lastStage !== "strong";
    if (!breaksSnooze && relevant.snoozedUntil) {
      const until = new Date(relevant.snoozedUntil);
      if (!Number.isNaN(until.getTime()) && until.getTime() > now.getTime()) {
        return { show: false };
      }
    }
  }

  return { show: true, state, stage };
}

/** Datum do kog traka ćuti posle zatvaranja. */
export function snoozeUntil(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + SNOOZE_DAYS);
  return d.toISOString();
}
