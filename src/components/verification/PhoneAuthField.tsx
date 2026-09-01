"use client";

import { BypassPhoneInput } from "./BypassPhoneInput";
import { PhoneVerificationField } from "./PhoneVerificationField";
import { ForeignCustomerNote } from "./ForeignCustomerNote";
import type { BypassInfo } from "@/lib/bypass-token";

type Variant = "light" | "dark";

interface Props {
  /** When set (foreign-customer bypass link), the SMS UI is replaced by a plain
   *  number input with the bypass country's calling code — no verification. */
  bypassInfo?: BypassInfo;
  /** Local digits without the calling code. */
  value: string;
  onChange: (v: string) => void;
  /** SMS path only: called with the trust token once OTP passes. */
  onVerified: (trustToken: string) => void;
  /** SMS path only: called when the verified number is edited (token voided). */
  onUnverified: () => void;
  variant?: Variant;
  required?: boolean;
  placeholder?: string;
}

/**
 * Phone field that auto-switches between the default Serbia-only SMS
 * verification and the no-SMS bypass input when an admin-issued bypass link is
 * active. Shared by every create form so the two paths never drift.
 *
 * Authorization from the caller's side is simply: `!!bypassInfo || !!trustToken`.
 * In bypass mode there is no token to collect — the signed link is the proof,
 * and the form sends `bypass_token: bypassInfo.token` in its payload.
 */
export function PhoneAuthField({
  bypassInfo,
  value,
  onChange,
  onVerified,
  onUnverified,
  variant = "light",
  required = false,
  placeholder,
}: Props) {
  if (bypassInfo) {
    return (
      <BypassPhoneInput
        value={value}
        onChange={onChange}
        callingCode={bypassInfo.callingCode}
        countryLabel={bypassInfo.countryLabel}
        variant={variant}
        required={required}
        {...(placeholder ? { placeholder } : {})}
      />
    );
  }
  return (
    <>
      <PhoneVerificationField
        value={value}
        onChange={(v) => {
          onChange(v);
          onUnverified();
        }}
        onVerified={onVerified}
        onUnverified={onUnverified}
        variant={variant}
        required={required}
        {...(placeholder ? { placeholder } : {})}
      />
      <ForeignCustomerNote variant={variant} />
    </>
  );
}
