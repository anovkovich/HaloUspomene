import {
  isBlank,
  isTooShort,
  isValidTime,
  isValidPhone,
  type StepValidatorMap,
} from "@/lib/wizard-validation";

export type PunoletstvoStepKey =
  | "honoree"
  | "date_location"
  | "design"
  | "final";

export type PunoletstvoGender = "male" | "female";
export type PunoletstvoTheme = "white_gold_burgundy" | "white_gold_navy";

export interface PunoletstvoFormData {
  honoree_name: string;
  honoree_surname: string;
  gender: PunoletstvoGender;
  event_date_only: string;
  event_time: string;
  submit_until_date: string;
  contact_phone: string;
  location_name: string;
  location_address: string;
  theme: PunoletstvoTheme;
  scriptFont: string;
  tagline: string;
}

export const punoletstvoValidators: StepValidatorMap<
  PunoletstvoStepKey,
  PunoletstvoFormData
> = {
  honoree: (d) => {
    if (isBlank(d.honoree_name)) return "Unesite ime slavljenika.";
    if (isBlank(d.honoree_surname)) return "Unesite prezime slavljenika.";
    if (d.gender !== "male" && d.gender !== "female")
      return "Izaberite pol slavljenika.";
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
    return null;
  },
  design: (d) => {
    if (d.theme !== "white_gold_burgundy" && d.theme !== "white_gold_navy")
      return "Izaberite boje pozivnice.";
    if (isBlank(d.scriptFont)) return "Izaberite font za ime.";
    return null;
  },
  final: (d) => {
    if (isTooShort(d.tagline, 3))
      return "Unesite tagline poruku (bar 3 karaktera).";
    return null;
  },
};

export const STEP_KEYS: PunoletstvoStepKey[] = [
  "honoree",
  "date_location",
  "design",
  "final",
];
