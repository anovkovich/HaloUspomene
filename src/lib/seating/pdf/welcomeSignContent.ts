import type { WelcomeSignHero } from "./welcomeSign";
// Relative, not "@/lib/...": scripts/preview-welcome-sign.mjs compiles this
// file with a bare tsc that has no path aliases configured.
import { latinToCyrillic } from "../../serbian-script";

/**
 * Copy for the QR pano dobrodošlice, in one place so the three products and
 * the preview script can never drift apart.
 *
 * House rules that shaped it: a poster instructs rather than pleads (no
 * "Molimo Vas"), guests look for a table rather than a "mesto sedenja", and
 * the hook is the guest's own question — which is also the product's route,
 * /gde-sedim.
 */

export interface WelcomeSignContent {
  eyebrow: string;
  hero: WelcomeSignHero;
  hook: string;
  instruction: string;
}

const HOOK = "Udobno se smestite";
const HOOK_CYR = "Удобно се сместите";

const INSTRUCTION = "Skenirajte kod i pronađite svoje mesto";
const INSTRUCTION_CYR = "Скенирајте код и пронађите своје место";

export interface PanoNameOverrides {
  /** Bride and groom exactly as stored on the couple, in the invitation's script. */
  bride?: string;
  groom?: string;
  /** WeddingData.pano_bride_name / pano_groom_name — either, both, or neither. */
  panoBride?: string;
  panoGroom?: string;
}

const fold = (v: string) => v.trim().toLocaleLowerCase("sr");

/**
 * The names to print when the sign runs in Cyrillic but the couple's record is
 * Latin: each half of `coupleDisplay` gets its explicit override if one is set,
 * and is transliterated otherwise.
 *
 * Substitutes into the existing halves rather than rebuilding "bride & groom",
 * because `full_display` is free text — the create routes only DEFAULT it to
 * bride-first, and a couple who typed their own would otherwise get their names
 * silently swapped on a printed board.
 */
export function panoWeddingNames(
  coupleDisplay: string,
  o: PanoNameOverrides,
  transliterate: boolean,
): string {
  const pairs: [string | undefined, string | undefined][] = [
    [o.bride, o.panoBride],
    [o.groom, o.panoGroom],
  ];

  return coupleDisplay
    .split(/\s*&\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      for (const [stored, override] of pairs) {
        if (override?.trim() && stored?.trim() && fold(stored) === fold(part)) {
          return override.trim();
        }
      }
      return transliterate ? latinToCyrillic(part) : part;
    })
    .join(" & ");
}

/** Wedding — "Marija & Petar" splits into two name lines around the "&". */
export function weddingSignContent(
  coupleDisplay: string,
  cyrillic = false,
): WelcomeSignContent {
  const parts = coupleDisplay
    .split(/\s*&\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  const hero: WelcomeSignHero =
    parts.length >= 2
      ? {
          primary: parts[0],
          middle: "&",
          secondary: parts.slice(1).join(" & "),
          ghost: "&",
        }
      : { primary: coupleDisplay.trim() };

  return {
    eyebrow: cyrillic ? "ДОБРОДОШЛИ НА ВЕНЧАЊЕ" : "DOBRODOŠLI NA VENČANJE",
    hero,
    hook: cyrillic ? HOOK_CYR : HOOK,
    instruction: cyrillic ? INSTRUCTION_CYR : INSTRUCTION,
  };
}

/** Standalone event — one name, no partner, brand burgundy as the accent. */
export function eventSignContent(eventName: string): WelcomeSignContent {
  return {
    eyebrow: "DOBRODOŠLI",
    hero: { primary: eventName.trim(), primaryAccent: true },
    hook: HOOK,
    instruction: INSTRUCTION,
  };
}

/** Birthday and punoletstvo — the age numeral becomes the ghost glyph. */
export function birthdaySignContent(
  honoreeName: string,
  age: number,
  type: "child" | "eighteenth",
): WelcomeSignContent {
  return {
    eyebrow: "DOBRODOŠLI",
    hero: {
      primary: honoreeName.trim(),
      middle:
        type === "eighteenth"
          ? "proslavlja punoletstvo"
          : `slavi ${age}. rođendan`,
      ghost: type === "eighteenth" ? "18" : String(age),
      primaryAccent: true,
    },
    hook: HOOK,
    instruction: INSTRUCTION,
  };
}
