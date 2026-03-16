"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Heart } from "lucide-react";

interface PotvrdeGateProps {
  password: string;
  slug: string;
  coupleNames: string;
  cssVars: Record<string, string>;
  children: React.ReactNode;
}

export default function PotvrdeGate({
  password,
  slug,
  coupleNames,
  cssVars,
  children,
}: PotvrdeGateProps) {
  const storageKey = `potvrde_unlocked_${slug}`;
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === "1") {
      setUnlocked(true);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === password) {
      sessionStorage.setItem(storageKey, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2500);
      inputRef.current?.focus();
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ ...cssVars, backgroundColor: "var(--theme-background)" } as React.CSSProperties}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="font-script text-5xl mb-4"
            style={{ color: "var(--theme-primary)" }}
          >
            {coupleNames}
          </p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
            <Heart size={12} fill="currentColor" style={{ color: "var(--theme-primary)", opacity: 0.4 }} />
            <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
          </div>
          <p
            className="font-raleway text-xs tracking-widest uppercase"
            style={{ color: "var(--theme-text-light)" }}
          >
            Pregled potvrda
          </p>
        </div>

        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <Lock size={20} style={{ color: "var(--theme-primary)", opacity: 0.7 }} />
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Unesite lozinku..."
              autoComplete="off"
              className="w-full bg-transparent pl-4 pr-11 py-3.5 text-sm font-raleway placeholder:opacity-40 outline-none transition-colors duration-300"
              style={{
                color: "var(--theme-text)",
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: `1px solid ${error ? "#c0392b" : "var(--theme-border-light)"}`,
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = "var(--theme-primary)";
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = "var(--theme-border-light)";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-raleway mb-3 pl-1"
                style={{ color: "#c0392b" }}
              >
                Pogrešna lozinka. Pokušajte ponovo.
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-raleway font-medium tracking-wide text-white transition-opacity hover:opacity-85"
            style={{
              backgroundColor: "var(--theme-primary)",
              borderRadius: "var(--theme-radius)",
            }}
          >
            Potvrdi
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
