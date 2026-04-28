"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Send } from "lucide-react";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";

type Variant = "light" | "dark";

interface Props {
  /** Phone digits without +381 prefix (e.g. "611234567"). */
  value: string;
  onChange: (v: string) => void;
  /** Called once OTP has been verified successfully. */
  onVerified: (trustToken: string) => void;
  /** Called when user edits the verified phone (token becomes invalid). */
  onUnverified?: () => void;
  variant?: Variant;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

type Phase =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "awaiting"; pinId: string }
  | { kind: "verifying"; pinId: string }
  | { kind: "verified" }
  | { kind: "error"; message: string };

const RESEND_SECONDS = 60;
const PIN_LENGTH = 4;

const VERIFICATION_DISABLED =
  process.env.NEXT_PUBLIC_PHONE_VERIFICATION_DISABLED === "true";
const DISABLED_TOKEN = "__verification_disabled__";

function isValidLocalPhone(local: string): boolean {
  const digits = local.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 9;
}

export function PhoneVerificationField({
  value,
  onChange,
  onVerified,
  onUnverified,
  variant = "light",
  disabled = false,
  placeholder = "6X XXX XXXX",
  required = false,
}: Props) {
  const { execute } = useRecaptcha();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const lastVerifiedValue = useRef<string | null>(null);

  // Reset to idle if user edits a previously verified phone
  useEffect(() => {
    if (
      lastVerifiedValue.current !== null &&
      value !== lastVerifiedValue.current
    ) {
      lastVerifiedValue.current = null;
      setPhase({ kind: "idle" });
      setCode("");
      onUnverified?.();
    }
  }, [value, onUnverified]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Auto-focus code input when entering awaiting state
  useEffect(() => {
    if (phase.kind === "awaiting") {
      codeInputRef.current?.focus();
    }
  }, [phase.kind]);

  const phoneE164 = `+381${value.replace(/\D/g, "")}`;
  const phoneLooksValid = isValidLocalPhone(value);
  const isVerified = phase.kind === "verified";
  const isBusy = phase.kind === "sending" || phase.kind === "verifying";

  // When the global disable flag is set, auto-emit a sentinel trust token
  // whenever the phone format becomes valid, so parent forms unblock without
  // an SMS round-trip. The server-side `ensurePhoneVerified` short-circuits
  // its own check based on the same env flag.
  useEffect(() => {
    if (!VERIFICATION_DISABLED) return;
    if (phoneLooksValid) {
      onVerified(DISABLED_TOKEN);
    } else {
      onUnverified?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneLooksValid]);

  const sendCode = async () => {
    if (!phoneLooksValid || isBusy) return;
    setError(null);
    setPhase({ kind: "sending" });
    try {
      const recaptchaToken = await execute("verify_send");
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneE164, recaptchaToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        pinId?: string;
        alreadyVerified?: boolean;
        trustToken?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Greška pri slanju koda.");
        setPhase({ kind: "idle" });
        return;
      }
      if (data.alreadyVerified && data.trustToken) {
        lastVerifiedValue.current = value;
        setPhase({ kind: "verified" });
        onVerified(data.trustToken);
        return;
      }
      if (!data.pinId) {
        setError("Neuspešno slanje koda.");
        setPhase({ kind: "idle" });
        return;
      }
      setPhase({ kind: "awaiting", pinId: data.pinId });
      setResendIn(RESEND_SECONDS);
    } catch {
      setError("Greška pri slanju koda. Pokušajte ponovo.");
      setPhase({ kind: "idle" });
    }
  };

  const verify = async () => {
    if (phase.kind !== "awaiting") return;
    if (code.length !== PIN_LENGTH) return;
    setError(null);
    const pinId = phase.pinId;
    setPhase({ kind: "verifying", pinId });
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId, code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        trustToken?: string;
        error?: string;
      };
      if (!res.ok || !data.trustToken) {
        setError(data.error || "Pogrešan kod.");
        setPhase({ kind: "awaiting", pinId });
        setCode("");
        return;
      }
      lastVerifiedValue.current = value;
      setPhase({ kind: "verified" });
      onVerified(data.trustToken);
    } catch {
      setError("Greška pri proveri koda.");
      setPhase({ kind: "awaiting", pinId });
    }
  };

  // ---- styling presets (avoid per-form overrides) ----
  const CODE_INPUT_HEIGHT = "h-12";
  const styles =
    variant === "dark"
      ? {
          wrapper: "border-b border-white/10 focus-within:border-[#AE343F]",
          prefix: "py-3 pl-4 pr-2 text-[#F5F4DC]/80 text-lg select-none",
          input:
            "flex-1 bg-transparent py-3 pr-4 text-[#F5F4DC] text-lg outline-none placeholder:text-white/50",
          bigButton:
            "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AE343F] py-3 text-sm font-semibold text-white hover:bg-[#8d2a33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          codeInput: `min-w-0 flex-1 bg-transparent border border-white/15 rounded-xl px-3 ${CODE_INPUT_HEIGHT} text-center text-xl tracking-[0.4em] text-[#F5F4DC] outline-none focus:border-[#AE343F] placeholder:text-white/40`,
          confirmBtn: `${CODE_INPUT_HEIGHT} shrink-0 w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#AE343F] px-5 text-sm font-semibold text-white hover:bg-[#8d2a33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors`,
          subText: "text-xs text-[#F5F4DC]/70",
          resendBtn: "text-xs text-[#F5F4DC]/80 hover:text-[#AE343F] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors",
          errorText: "text-xs text-red-400",
          verifiedBadge: "inline-flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5",
        }
      : {
          wrapper:
            "flex items-center border-b border-stone-200 focus-within:border-[var(--accent,#AE343F)] transition-colors",
          prefix: "py-1.5 pl-1 pr-2 text-stone-400 text-base select-none",
          input:
            "flex-1 bg-transparent py-1.5 pr-1 text-stone-800 text-base outline-none placeholder:text-stone-300",
          bigButton:
            "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent,#AE343F)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity",
          codeInput: `min-w-0 flex-1 bg-white border border-stone-200 rounded-xl px-3 ${CODE_INPUT_HEIGHT} text-center text-xl tracking-[0.4em] text-stone-800 outline-none focus:border-[var(--accent,#AE343F)] placeholder:text-stone-300`,
          confirmBtn: `${CODE_INPUT_HEIGHT} shrink-0 w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent,#AE343F)] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity`,
          subText: "text-xs text-stone-500",
          resendBtn:
            "text-xs text-stone-500 hover:text-[var(--accent,#AE343F)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors",
          errorText: "text-xs text-red-600",
          verifiedBadge: "inline-flex items-center gap-1.5 text-xs text-emerald-600 mt-1",
        };

  return (
    <div className="space-y-3">
      <div className={`flex items-center ${styles.wrapper}`}>
        <span className={styles.prefix}>+381</span>
        <input
          required={required}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          disabled={disabled || isVerified || isBusy}
          onChange={(e) =>
            onChange(
              e.target.value
                .replace(/^\+?381/, "")
                .replace(/\D/g, "")
                .replace(/^0+/, ""),
            )
          }
        />
        {isVerified ? (
          <CheckCircle2
            size={20}
            className={`mr-2 shrink-0 ${variant === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
            aria-label="Verifikovano"
          />
        ) : null}
      </div>

      {!VERIFICATION_DISABLED &&
      !isVerified &&
      (phase.kind === "idle" || phase.kind === "error") ? (
        <button
          type="button"
          onClick={sendCode}
          disabled={!phoneLooksValid || disabled}
          className={styles.bigButton}
        >
          <Send size={16} />
          Pošalji kod
        </button>
      ) : null}

      {!VERIFICATION_DISABLED && phase.kind === "sending" ? (
        <button
          type="button"
          disabled
          className={styles.bigButton + " pointer-events-none"}
        >
          <Loader2 size={16} className="animate-spin" />
          Šaljem...
        </button>
      ) : null}

      {!VERIFICATION_DISABLED &&
      (phase.kind === "awaiting" || phase.kind === "verifying") ? (
        <div className="space-y-2 pt-1">
          <p className={styles.subText}>
            Unesite {PIN_LENGTH}-cifreni kod koji smo poslali na +381 {value}.
          </p>
          <div className="flex items-stretch gap-2">
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              autoComplete="one-time-code"
              className={styles.codeInput}
              placeholder="••••"
              value={code}
              disabled={phase.kind === "verifying"}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  verify();
                }
              }}
            />
            <button
              type="button"
              onClick={verify}
              disabled={code.length !== PIN_LENGTH || phase.kind === "verifying"}
              className={styles.confirmBtn}
            >
              {phase.kind === "verifying" ? (
                <>
                  Provera <Loader2 size={14} className="animate-spin" />
                </>
              ) : (
                <>Potvrdi</>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={sendCode}
            disabled={resendIn > 0}
            className={styles.resendBtn}
          >
            <RefreshCw size={12} />
            {resendIn > 0 ? `Pošalji ponovo za ${resendIn}s` : "Pošalji ponovo"}
          </button>
        </div>
      ) : null}

      {!VERIFICATION_DISABLED && isVerified ? (
        <div className={styles.verifiedBadge}>
          <CheckCircle2 size={14} /> Broj telefona je verifikovan.
        </div>
      ) : null}

      {!VERIFICATION_DISABLED && error ? (
        <p className={styles.errorText}>{error}</p>
      ) : null}
    </div>
  );
}
