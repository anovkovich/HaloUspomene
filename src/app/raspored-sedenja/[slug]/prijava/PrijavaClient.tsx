"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, Eye, EyeOff } from "lucide-react";

interface Props {
  slug: string;
  nextUrl: string;
  eventName: string;
}

export default function PrijavaClient({ slug, nextUrl, eventName }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch(`/api/raspored-sedenja/auth/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: input }),
    });

    setLoading(false);

    if (res.ok) {
      router.replace(nextUrl);
      return;
    }

    setError(true);
    setErrorMsg(
      res.status === 404
        ? "Pristup nije aktivan. Kontaktirajte HALO Uspomene."
        : "Pogrešna lozinka. Pokušajte ponovo.",
    );
    setShake(true);
    setInput("");
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setError(false), 3500);
    inputRef.current?.focus();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAFAF5" }}
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
            className="font-script text-4xl mb-4"
            style={{ color: "#AE343F" }}
          >
            {eventName}
          </p>
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(35,35,35,0.6)" }}
          >
            Raspored sedenja
          </p>
        </div>

        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#F5F4DC",
              border: "1px solid rgba(35,35,35,0.12)",
            }}
          >
            <Armchair
              size={20}
              style={{ color: "#AE343F", opacity: 0.75 }}
            />
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={input}
              onChange={(e) => {
                setInput(e.target.value.replace(/[^0-9]/g, ""));
                setError(false);
              }}
              placeholder="6-cifarni PIN"
              autoComplete="off"
              className="w-full bg-transparent pl-4 pr-11 py-3.5 text-sm placeholder:opacity-40 outline-none transition-colors duration-300 rounded-lg tracking-widest"
              style={{
                color: "#232323",
                backgroundColor: "#F5F4DC",
                border: `1px solid ${error ? "#c0392b" : "rgba(35,35,35,0.16)"}`,
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = "#AE343F";
              }}
              onBlur={(e) => {
                if (!error)
                  e.target.style.borderColor = "rgba(35,35,35,0.16)";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: "rgba(35,35,35,0.6)" }}
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
                className="text-xs mb-3 pl-1"
                style={{ color: "#c0392b" }}
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || input.length !== 6}
            className="w-full py-3.5 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-85 disabled:opacity-40 cursor-pointer rounded-lg"
            style={{ backgroundColor: "#AE343F" }}
          >
            {loading ? "Proveravam..." : "Potvrdi"}
          </button>
        </motion.form>

        <p
          className="text-center text-[11px] mt-8 leading-relaxed"
          style={{ color: "rgba(35,35,35,0.5)" }}
        >
          Pristup vam je dodelio HALO Uspomene tim. Ako ste izgubili PIN,
          pišite na halouspomene@gmail.com.
        </p>
      </motion.div>
    </div>
  );
}
