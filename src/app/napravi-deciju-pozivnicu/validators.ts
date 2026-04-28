import {
  isBlank,
  isTooShort,
  isValidTime,
  isValidPhone,
  type StepValidatorMap,
} from "@/lib/wizard-validation";

export type DecijiStepKey = "child" | "date_location" | "design" | "final";

export interface DecijiFormData {
  child_name: string;
  parent_names: string;
  age: number;
  gender: string;
  event_date_only: string;
  event_time: string;
  submit_until_date: string;
  contact_phone: string;
  phone_trust_token: string;
  location_name: string;
  location_address: string;
  theme: string;
  displayFont: string;
  tagline: string;
}

export const decijiValidators: StepValidatorMap<DecijiStepKey, DecijiFormData> = {
  child: (d) => {
    if (isBlank(d.child_name)) return "Unesite ime deteta.";
    if (isBlank(d.parent_names)) return "Unesite imena roditelja.";
    if (!Number.isFinite(d.age) || d.age < 1 || d.age > 14)
      return "Izaberite koji rođendan slavi.";
    if (!d.gender) return "Izaberite pol deteta.";
    return null;
  },
  date_location: (d) => {
    if (isBlank(d.event_date_only)) return "Izaberite datum proslave.";
    if (!isValidTime(d.event_time)) return "Izaberite vreme proslave.";
    if (isBlank(d.submit_until_date))
      return "Izaberite rok za potvrdu dolaska.";
    if (new Date(d.submit_until_date) > new Date(d.event_date_only))
      return "Rok za potvrdu mora biti pre datuma proslave.";
    if (isBlank(d.location_name)) return "Unesite naziv lokacije.";
    if (isBlank(d.location_address)) return "Unesite adresu lokacije.";
    if (!isValidPhone("+381" + (d.contact_phone || "").replace(/[\s-]/g, "")))
      return "Unesite važeći kontakt telefon (npr. 6X XXX XXXX).";
    if (!d.phone_trust_token)
      return "Verifikujte kontakt telefon putem SMS koda pre nego što nastavite.";
    return null;
  },
  design: (d) => {
    if (isBlank(d.theme)) return "Izaberite temu pozivnice.";
    if (isBlank(d.displayFont)) return "Izaberite font za ime.";
    return null;
  },
  final: (d) => {
    if (isTooShort(d.tagline, 3))
      return "Unesite tagline poruku (bar 3 karaktera).";
    return null;
  },
};

export const STEP_KEYS: DecijiStepKey[] = [
  "child",
  "date_location",
  "design",
  "final",
];
