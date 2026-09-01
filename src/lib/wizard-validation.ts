/**
 * Shared per-step validation for multi-step lead-gen wizards
 * (napravi-pozivnicu, napravi-deciju-pozivnicu, napravi-punoletstvo).
 *
 * Each wizard exports a StepValidatorMap keyed by its step identifier.
 * `goNext()` calls validateStep() and, if a message is returned, displays
 * it instead of advancing.
 */

export type StepValidator<TData> = (data: TData) => string | null;

export type StepValidatorMap<TStep extends string, TData> = Record<
  TStep,
  StepValidator<TData>
>;

export function validateStep<TStep extends string, TData>(
  validators: StepValidatorMap<TStep, TData>,
  step: TStep,
  data: TData,
): string | null {
  const validator = validators[step];
  if (!validator) return null;
  return validator(data);
}

// ---------- primitive field helpers ----------

export function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export function isTooShort(value: unknown, min: number): boolean {
  return typeof value !== "string" || value.trim().length < min;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export function isValidTime(value: unknown): boolean {
  return typeof value === "string" && TIME_RE.test(value);
}

// Accepts +3816xxxxxxxx / +38160xxxxxxx / 06xxxxxxx / 06xxxxxxxx, trimmed.
const PHONE_RE = /^(\+381\d{8,9}|0\d{8,9})$/;
export function isValidPhone(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const compact = value.replace(/[\s-]/g, "");
  return PHONE_RE.test(compact);
}

export function isValidISODate(value: unknown): boolean {
  if (typeof value !== "string" || !value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

// ---------- field error helpers (for inline on-blur UX) ----------

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function setFieldError<T extends string>(
  errors: FieldErrors<T>,
  field: T,
  message: string | null,
): FieldErrors<T> {
  const next = { ...errors };
  if (message) next[field] = message;
  else delete next[field];
  return next;
}
