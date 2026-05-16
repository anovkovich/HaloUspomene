"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Heart,
  Cake,
  Armchair,
  MessageCircle,
  ShieldAlert,
  PartyPopper,
} from "lucide-react";

export interface SharePayload {
  kind: "couple" | "birthday" | "seating";
  isPremium?: boolean;
  isEighteenth?: boolean;
  displayName: string;
  slug: string;
  eventDate?: string;
  password: string;
  invitationUrl: string;
  loginUrl: string;
  portalUrl: string | null;
  portalLabel: string | null;
  ogImageUrl: string | null;
}

interface Props {
  token: string;
  payload: SharePayload;
}

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildGuestMessage(p: SharePayload): string {
  if (p.kind === "couple") {
    return `Dragi prijatelju, sa radošću Vas pozivamo na naše venčanje.\n\nDetalji i potvrda dolaska:\n${p.invitationUrl}\n\n— ${p.displayName}`;
  }
  if (p.kind === "birthday") {
    if (p.isEighteenth) {
      return `Pozivamo Vas na proslavu punoletstva!\n\nDetalji i potvrda dolaska:\n${p.invitationUrl}\n\n— ${p.displayName}`;
    }
    return `Pozivamo te na naše rođendansko slavlje!\n\nDetalji i potvrda dolaska:\n${p.invitationUrl}\n\n— ${p.displayName}`;
  }
  // seating — section not shown but keep type-safe
  return p.invitationUrl;
}

function HeaderIcon({ kind }: { kind: SharePayload["kind"] }) {
  if (kind === "couple")
    return <Heart size={28} className="text-[#AE343F]" strokeWidth={1.5} />;
  if (kind === "birthday")
    return <Cake size={28} className="text-[#AE343F]" strokeWidth={1.5} />;
  return <Armchair size={28} className="text-[#AE343F]" strokeWidth={1.5} />;
}

function CopyButton({
  onCopy,
  label,
  copiedLabel = "Kopirano!",
  primary = false,
}: {
  onCopy: () => Promise<void> | void;
  label: string;
  copiedLabel?: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={
        primary
          ? "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#AE343F] hover:bg-[#8A2A32] text-white font-medium text-sm transition-colors cursor-pointer w-full sm:w-auto"
          : "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#232323]/5 hover:bg-[#232323]/10 text-[#232323]/70 hover:text-[#232323] text-sm transition-colors cursor-pointer"
      }
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check size={16} /> {copiedLabel}
        </>
      ) : (
        <>
          <Copy size={16} /> {label}
        </>
      )}
    </button>
  );
}

export default function SharePageClient({ token, payload }: Props) {
  // Fire-and-forget visit tracking — never blocks the page.
  useEffect(() => {
    fetch(`/api/share-link/${encodeURIComponent(token)}/visit`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [token]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const eventDate = formatEventDate(payload.eventDate);

  const productLabel =
    payload.kind === "couple"
      ? payload.isPremium
        ? "Premium pozivnica"
        : "Pozivnica"
      : payload.kind === "birthday"
        ? payload.isEighteenth
          ? "Pozivnica za punoletstvo"
          : "Rođendanska pozivnica"
        : "Raspored sedenja";

  const heading =
    payload.kind === "seating"
      ? "Vaš pristup je spreman"
      : "Vaša pozivnica je spremna";

  const guestMessage = buildGuestMessage(payload);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-4">
          <HeaderIcon kind={payload.kind} />
        </div>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#AE343F] font-medium mb-2">
          HaloUspomene · {productLabel}
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#232323] mb-2">
          {heading}
        </h1>
        <p className="text-base sm:text-lg text-[#232323]/70">
          <span className="font-medium text-[#232323]">{payload.displayName}</span>
          {eventDate && (
            <>
              <span className="mx-2 text-[#232323]/30">·</span>
              {eventDate}
            </>
          )}
        </p>
      </header>

      {/* Section 1: Link */}
      <section className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink size={16} className="text-[#AE343F]" />
          <h2 className="text-xs uppercase tracking-wider text-[#232323]/50 font-semibold">
            Link do{" "}
            {payload.kind === "seating" ? "alata" : "pozivnice"}
          </h2>
        </div>
        <div className="bg-[#F5F4DC]/60 rounded-lg px-3 py-2.5 mb-4 break-all">
          <code className="text-sm text-[#232323]/80">
            {payload.invitationUrl}
          </code>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CopyButton
            label="Kopiraj link"
            onCopy={() => navigator.clipboard.writeText(payload.invitationUrl)}
            primary
          />
          <Link
            href={payload.invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#232323]/15 hover:bg-[#232323]/5 text-[#232323]/70 hover:text-[#232323] text-sm transition-colors w-full sm:w-auto"
          >
            <ExternalLink size={14} /> Otvori u novom tabu
          </Link>
        </div>
      </section>

      {/* Section 2: Login credentials */}
      {payload.password && (
        <section className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} className="text-[#AE343F]" />
            <h2 className="text-xs uppercase tracking-wider text-[#232323]/50 font-semibold">
              Podaci za prijavu
            </h2>
          </div>
          <p className="text-sm text-[#232323]/60 mb-3">
            {payload.kind === "couple"
              ? "Koristite SLUG i šifru za prijavu na portal."
              : `Koristite ovu šifru za prijavu na ${payload.portalUrl ? "portal" : "alat"}.`}
          </p>

          {payload.kind === "couple" && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-wider text-[#232323]/40 mb-1.5 font-semibold">
                Slug
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-0 bg-[#F5F4DC]/60 rounded-lg px-3 py-2.5">
                  <code className="text-base font-mono text-[#232323] break-all">
                    {payload.slug}
                  </code>
                </div>
                <CopyButton
                  label="Kopiraj"
                  onCopy={() => navigator.clipboard.writeText(payload.slug)}
                />
              </div>
            </div>
          )}

          <div>
            {payload.kind === "couple" && (
              <div className="text-[10px] uppercase tracking-wider text-[#232323]/40 mb-1.5 font-semibold">
                Šifra
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-0 bg-[#F5F4DC]/60 rounded-lg px-3 py-2.5">
                <code className="text-base font-mono tracking-widest text-[#232323]">
                  {passwordVisible
                    ? payload.password
                    : "•".repeat(Math.max(payload.password.length, 6))}
                </code>
              </div>
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#232323]/5 hover:bg-[#232323]/10 text-[#232323]/70 hover:text-[#232323] text-sm transition-colors cursor-pointer"
                aria-label={passwordVisible ? "Sakrij šifru" : "Prikaži šifru"}
              >
                {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline">
                  {passwordVisible ? "Sakrij" : "Prikaži"}
                </span>
              </button>
              <CopyButton
                label="Kopiraj"
                onCopy={() => navigator.clipboard.writeText(payload.password)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Portal access */}
      {payload.portalUrl && payload.portalLabel && (
        <section className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <PartyPopper size={16} className="text-[#AE343F]" />
            <h2 className="text-xs uppercase tracking-wider text-[#232323]/50 font-semibold">
              {payload.portalLabel}
            </h2>
          </div>
          <p className="text-sm text-[#232323]/60 mb-4">
            {payload.kind === "couple"
              ? "Dobijate pristup svom kontrolnom portalu gde ćete pratiti sve potvrde gostiju, pristupiti alatu za raspored sedenja, planeru budžeta i čeklisti!"
              : "Pratite sve potvrde gostiju i upravljajte gostima sa svog kontrolnog portala."}
          </p>
          <ol className="text-sm text-[#232323]/70 space-y-1.5 mb-4">
            <li className="flex gap-2">
              <span className="font-semibold text-[#AE343F]">1.</span>
              Otvorite portal.
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#AE343F]">2.</span>
              {payload.kind === "couple"
                ? "Unesite SLUG & Šifru!"
                : "Unesite Šifru!"}
            </li>
          </ol>
          <Link
            href={payload.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#232323] hover:bg-[#000] text-white font-medium text-sm transition-colors w-full sm:w-auto"
          >
            <ExternalLink size={14} /> Otvori portal
          </Link>
        </section>
      )}

      {/* Section 4: Share with guests (skip for seating) */}
      {payload.kind !== "seating" && (
        <section className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-[#AE343F]" />
            <h2 className="text-xs uppercase tracking-wider text-[#232323]/50 font-semibold">
              Podeli sa gostima
            </h2>
          </div>
          <p className="text-sm text-[#232323]/60 mb-3">
            Pripremili smo poruku koju možete kopirati i poslati preko
            WhatsApp-a, Vibera ili SMS-a. Sadrži čist link koji se neće
            pretvoriti u dugu adresu kada ga gosti proslede dalje.
          </p>
          <div className="bg-[#F5F4DC]/60 rounded-lg px-3 py-3 mb-4">
            <pre className="text-sm text-[#232323]/80 whitespace-pre-wrap font-sans leading-relaxed">
              {guestMessage}
            </pre>
          </div>
          <CopyButton
            label="Kopiraj poruku"
            copiedLabel="Poruka kopirana!"
            onCopy={() => navigator.clipboard.writeText(guestMessage)}
            primary
          />
        </section>
      )}

      {/* Footer link */}
      <p className="text-center text-[11px] text-[#232323]/40 mt-8">
        <Link href="/" className="hover:text-[#AE343F] transition-colors">
          halouspomene.rs
        </Link>
      </p>
    </main>
  );
}
