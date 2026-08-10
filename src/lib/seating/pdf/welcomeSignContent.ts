import type { WelcomeSignHero } from "./welcomeSign";

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
