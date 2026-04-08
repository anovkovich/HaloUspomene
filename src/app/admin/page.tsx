"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Users, Armchair, Mic, Receipt, Copy, Check, Heart, Cake, Star, CalendarPlus, Phone } from "lucide-react";
import { encodeToBase64 } from "@/lib/encoding";
import { getAudioPrice } from "@/data/pricing";
import DeleteModal from "./DeleteModal";
import BirthdayAdminList from "./BirthdayAdminList";
import VendorAdminTab from "./VendorAdminTab";
import PhoneRentalModal from "./PhoneRentalModal";
import AdminCalendar from "./AdminCalendar";

type AdminTab = "pozivnice" | "rodjendani" | "vendori";

const BANK_ACCOUNTS = [
  { raw: "340000003258405791", display: "340-0000032584057-91", label: "Erste (340)" },
  { raw: "170001040456500004", display: "170-0010404565000-04", label: "UniCredit (170)" },
  { raw: "000000000000000000", display: "TODO", label: "TODO" },
];

interface Couple {
  slug: string;
  couple_names: { bride: string; groom: string; full_display: string };
  event_date: string;
  theme: string;
  paid_for_raspored?: boolean;
  paid_for_audio?: boolean;
  paid_for_images?: boolean;
  paid_for_audio_USB?: "" | "kaseta" | "bocica";
  premium?: boolean;
  premium_paid?: boolean;
  draft?: boolean;
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
}

interface CoupleStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
  seating: { totalSeats: number; assignedSeats: number } | null;
  audio: { messageCount: number } | null;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("pozivnice");
  const [couples, setCouples] = useState<Couple[]>([]);
  const [stats, setStats] = useState<Record<string, CoupleStats>>({});
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [bankAccountIdx, setBankAccountIdx] = useState(0);
  const [showPhoneRental, setShowPhoneRental] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/couples")
      .then((r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          setLoading(false);
          return [];
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCouples(data);
          // Load stats async
          fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch(() => {});
        }
        setLoading(false);
      });
  }, []);

  if (needsLogin)
    return (
      <LoginForm
        onSuccess={() => {
          setNeedsLogin(false);
          setLoading(true);
          window.location.reload();
        }}
      />
    );
  if (loading) return <p className="text-white/40">Učitavanje...</p>;


  async function handleToggleDraft(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, draft: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, draft: current } : c
        )
      );
    }
  }

  async function handleToggleRaspored(slug: string, current: boolean) {
    const newVal = !current;
    // Optimistic update
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_raspored: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_raspored: newVal }),
    });
    if (!res.ok) {
      // Revert on error
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_raspored: current } : c
        )
      );
    }
  }

  async function handleToggleAudio(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_audio: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_audio: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_audio: current } : c
        )
      );
    }
  }

  async function handleTogglePremiumPaid(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, premium_paid: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ premium_paid: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, premium_paid: current } : c
        )
      );
    }
  }

  function buildReceiptUrl(c: Couple, extras?: { retro_phone?: boolean; dobrodoslica?: boolean }) {
    const data = {
      s: c.slug,
      par: c.couple_names?.full_display || c.slug,
      datum: c.event_date,
      r: c.paid_for_raspored ? 1 : 0,
      a: c.paid_for_audio ? 1 : 0,
      uk: c.paid_for_audio_USB === "kaseta" ? 1 : 0,
      ub: c.paid_for_audio_USB === "bocica" ? 1 : 0,
      rp: extras?.retro_phone ? 1 : 0,
      pd: extras?.dobrodoslica ? 1 : 0,
      cc: (c as any).custom_primary_color || (c as any).custom_background_color ? 1 : 0,
      ig: (c as any).paid_for_images ? 1 : 0,
      d: c.custom_discount ?? 0,
      ba: bankAccountIdx,
      t: Date.now(),
    };
    return `https://halouspomene.rs/racun?d=${encodeToBase64(data)}`;
  }

  async function handleGenerateReceipt(slug: string) {
    const now = new Date().toISOString();
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, receipt_valid: true, receipt_created: now } : c
      )
    );
    try {
      const res = await fetch(`/api/admin/couples/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_valid: true, receipt_created: now }),
      });
      if (!res.ok) {
        console.error(`Failed to set receipt_valid: ${res.status} ${res.statusText}`);
        alert(`Greška: Nisu mogli podesiti račun (${res.status})`);
        // Revert optimistic update
        setCouples((prev) =>
          prev.map((c) =>
            c.slug === slug ? { ...c, receipt_valid: false } : c
          )
        );
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Greška: Problem sa konekcijom");
      // Revert optimistic update
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, receipt_valid: false } : c
        )
      );
    }
  }

  async function handleInvalidateReceipt(slug: string) {
    const couple = couples.find((c) => c.slug === slug);

    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, receipt_valid: false } : c
      )
    );

    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: false }),
    });

    // Also mark phone rental as paid if it exists
    if (couple?.couple_names?.full_display) {
      await fetch("/api/admin/phone-rentals/by-contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: couple.couple_names.full_display,
          receipt_valid: false,
        }),
      }).catch(() => {}); // Silently fail if phone rental doesn't exist
    }
  }

  async function handleSetDiscount(slug: string, amount: number) {
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, custom_discount: amount } : c
      )
    );
    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ custom_discount: amount }),
    });
  }

  function daysUntil(dateStr: string) {
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) return `za ${diff} dana`;
    if (diff === 0) return "danas!";
    return `pre ${Math.abs(diff)} dana`;
  }

  return (
    <div>
      {/* Admin Calendar */}
      <AdminCalendar couples={couples} />

      {/* Bank account selector */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-white/30">Žiro račun:</span>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {BANK_ACCOUNTS.map((acc, i) => (
            <button
              key={i}
              onClick={() => setBankAccountIdx(i)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                bankAccountIdx === i
                  ? "bg-[#AE343F] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              title={acc.display}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("pozivnice")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "pozivnice"
              ? "bg-[#AE343F] text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Heart size={14} /> Pozivnice
        </button>
        <button
          onClick={() => setActiveTab("rodjendani")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "rodjendani"
              ? "bg-[#FF6B6B] text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Cake size={14} /> Rođendani
        </button>
        <button
          onClick={() => setActiveTab("vendori")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "vendori"
              ? "bg-[#d4af37] text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Star size={14} /> Vendori
        </button>
      </div>

      {activeTab === "vendori" ? (
        <>
          <div className="mb-4">
            <a
              href="/admin/vendors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#AE343F] text-white hover:bg-[#AE343F]/90 transition-colors"
            >
              <Star size={14} /> Upravljaj vendorima (DB)
            </a>
          </div>
          <VendorAdminTab />
        </>
      ) : activeTab === "rodjendani" ? (
        <BirthdayAdminList onNeedsLogin={() => setNeedsLogin(true)} />
      ) : (
      <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Pozivnice ({couples.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhoneRental(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            title="Iznajmljivanje telefona"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => router.push("/admin/nova")}
            className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nova pozivnica
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {couples.map((c) => {
          const s = stats[c.slug];
          const eventDate = c.event_date ? new Date(c.event_date) : null;
          const today = new Date();
          const isToday = eventDate ? eventDate.toDateString() === today.toDateString() : false;
          const isPast = eventDate ? eventDate < today && !isToday : false;
          const daysSince = isPast && eventDate
            ? Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          const isExpired = daysSince > 5;
          const isQuickStart = !c.theme;

          return (
            <div
              key={c.slug}
              className={`rounded-xl px-5 py-4 ${
                isQuickStart
                  ? "bg-indigo-950/30 border border-dashed border-indigo-400/30"
                  : isExpired
                  ? "bg-red-950/40 border border-red-500/25 opacity-70"
                  : isPast
                  ? "bg-white/5 opacity-50 border border-white/10"
                  : isToday
                  ? "bg-white/5 border-2 border-[#AE343F]"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {/* Top row */}
              <div className="mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${c.draft ? "bg-orange-400" : "bg-green-400"}`}
                        title={c.draft ? "Draft" : "Live"}
                      />
                      <span className="font-semibold text-white">
                        {c.couple_names?.full_display || c.slug}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {c.theme || "—"}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 ${isExpired ? "text-red-400/60" : isPast ? "text-white/30" : "text-white/60"}`}
                      >
                        {c.event_date ? daysUntil(c.event_date) : "—"}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      /{c.slug}{c.event_date ? <> &middot;{" "}
                      {new Date(c.event_date).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}</> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://halouspomene.rs/pozivnica/${c.slug}`);
                        setCopiedSlug(c.slug);
                        setTimeout(() => setCopiedSlug(null), 2000);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
                      title="Kopiraj link pozivnice"
                    >
                      {copiedSlug === c.slug ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      disabled={!c.event_date}
                      onClick={() => {
                        if (!c.event_date) return;
                        const d = new Date(c.event_date);
                        const pad = (n: number) => String(n).padStart(2, "0");
                        const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
                        const ics = [
                          "BEGIN:VCALENDAR",
                          "VERSION:2.0",
                          "BEGIN:VEVENT",
                          `DTSTART;VALUE=DATE:${dateStr}`,
                          `DTEND;VALUE=DATE:${dateStr}`,
                          `SUMMARY:Venčanje — ${c.couple_names?.full_display || c.slug}`,
                          `URL:https://halouspomene.rs/pozivnica/${c.slug}`,
                          "END:VEVENT",
                          "END:VCALENDAR",
                        ].join("\r\n");
                        const blob = new Blob([ics], { type: "text/calendar" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `vencanje-${c.slug}.ics`;
                        a.click();
                        URL.revokeObjectURL(a.href);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                      title={c.event_date ? "Dodaj u kalendar" : "Nema datuma"}
                    >
                      <CalendarPlus size={14} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/${c.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      title="Izmeni"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteSlug(c.slug)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400"
                      title="Obriši"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                {/* RSVP */}
                {s?.rsvp && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Users size={12} />
                    <span>
                      <span className="text-green-400">{s.rsvp.attending} Da</span>
                      {" / "}
                      <span className="text-red-400">{s.rsvp.declined} Ne</span>
                      {" — "}
                      <span className="text-white/70">{s.rsvp.totalGuests} gostiju</span>
                    </span>
                  </div>
                )}

                {/* Seating */}
                {s?.seating && c.paid_for_raspored && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Armchair size={12} />
                    <span>
                      {s.seating.assignedSeats}/{s.seating.totalSeats} raspoređeno
                    </span>
                    {s.seating.totalSeats > 0 && (
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#AE343F] rounded-full transition-all"
                          style={{
                            width: `${Math.round((s.seating.assignedSeats / s.seating.totalSeats) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Audio stats */}
                {s?.audio && c.paid_for_audio && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Mic size={12} />
                    <span>
                      {s.audio.messageCount} {s.audio.messageCount === 1 ? "poruka" : "poruka"}
                    </span>
                  </div>
                )}

                {/* Toggles */}
                <div className="flex items-center gap-4 sm:ml-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Draft</span>
                    <button
                      onClick={() =>
                        handleToggleDraft(c.slug, !!c.draft)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.draft ? "bg-orange-400" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.draft ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Raspored</span>
                    <button
                      onClick={() =>
                        handleToggleRaspored(c.slug, !!c.paid_for_raspored)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.paid_for_raspored ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.paid_for_raspored ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Audio</span>
                    <button
                      onClick={() =>
                        handleToggleAudio(c.slug, !!c.paid_for_audio)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.paid_for_audio ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.paid_for_audio ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {c.premium && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#d4af37]">Premium</span>
                      <button
                        onClick={() =>
                          handleTogglePremiumPaid(c.slug, !!c.premium_paid)
                        }
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          c.premium_paid ? "bg-[#d4af37]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            c.premium_paid ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Receipt dropdown */}
                <ReceiptDropdown
                  couple={c}
                  copiedSlug={copiedSlug}
                  onGenerate={async (extras) => {
                    await handleGenerateReceipt(c.slug);

                    // If retro phone is enabled, create a phone rental record
                    if (extras.retro_phone && c.event_date) {
                      const eventDate = new Date(c.event_date);

                      await fetch("/api/admin/phone-rentals", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          contact_name: c.couple_names?.full_display || c.slug,
                          rental_date: eventDate.toISOString().split("T")[0],
                          dobrodoslica: extras.dobrodoslica || false,
                          receipt_valid: true,
                          receipt_created: new Date().toISOString(),
                        }),
                      });
                    }

                    const url = buildReceiptUrl(c, extras);
                    await navigator.clipboard.writeText(url);
                    setCopiedSlug(c.slug);
                    setTimeout(() => setCopiedSlug(null), 2500);
                  }}
                  onCopy={async (extras) => {
                    const url = buildReceiptUrl(c, extras);
                    await navigator.clipboard.writeText(url);
                    setCopiedSlug(c.slug);
                    setTimeout(() => setCopiedSlug(null), 2500);
                  }}
                  onPaid={() => handleInvalidateReceipt(c.slug)}
                  onDiscount={(amount) => handleSetDiscount(c.slug, amount)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {mounted && showPhoneRental && (
        <PhoneRentalModal
          onClose={() => setShowPhoneRental(false)}
          bankAccountIdx={bankAccountIdx}
        />
      )}

      {deleteSlug && (
        <DeleteModal
          slug={deleteSlug}
          onClose={() => setDeleteSlug(null)}
          onDeleted={() => {
            setCouples((c) => c.filter((x) => x.slug !== deleteSlug));
            setDeleteSlug(null);
          }}
        />
      )}
      </>
      )}
    </div>
  );
}

function ReceiptDropdown({
  couple,
  copiedSlug,
  onGenerate,
  onCopy,
  onPaid,
  onDiscount,
}: {
  couple: Couple;
  copiedSlug: string | null;
  onGenerate: (extras: { retro_phone: boolean; dobrodoslica: boolean }) => void;
  onCopy: (extras: { retro_phone: boolean; dobrodoslica: boolean }) => void;
  onPaid: () => void;
  onDiscount: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [retroPhone, setRetroPhone] = useState(false);
  const [dobrodoslica, setDobrodoslica] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCopied = copiedSlug === couple.slug;
  const isActive = couple.receipt_valid;

  return (
    <div ref={ref} className="relative mt-2 pt-2 border-t border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[10px] cursor-pointer transition-colors ${
          isActive
            ? "text-green-400 hover:text-green-300"
            : "text-white/30 hover:text-white/50"
        }`}
      >
        <Receipt size={11} />
        {isCopied ? "✓ Link kopiran!" : isActive ? "Račun aktivan" : "Račun"}
        <svg
          width="10" height="10" viewBox="0 0 16 16" fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 rounded-lg overflow-hidden shadow-xl z-30"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 220 }}
        >
          {/* Retro Phone toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[11px] text-white/50">Retro telefon ({getAudioPrice()})</span>
            <button
              onClick={() => {
                const next = !retroPhone;
                setRetroPhone(next);
                if (next) onDiscount(1500);
                else onDiscount(0);
              }}
              className={`w-8 h-[18px] rounded-full relative transition-colors ${retroPhone ? "bg-yellow-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${retroPhone ? "translate-x-3.5" : ""}`} />
            </button>
          </div>

          {/* Personalizovana dobrodošlica toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[11px] text-white/50">Dobrodošlica (1.000)</span>
            <button
              onClick={() => setDobrodoslica((v) => !v)}
              className={`w-8 h-[18px] rounded-full relative transition-colors ${dobrodoslica ? "bg-yellow-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${dobrodoslica ? "translate-x-3.5" : ""}`} />
            </button>
          </div>

          {/* Generate / Regenerate */}
          <button
            onClick={() => { onGenerate({ retro_phone: retroPhone, dobrodoslica }); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Receipt size={12} className="text-yellow-400" />
            {isActive ? "Regeneriši račun" : "Generiši račun"}
          </button>

          {/* Copy link */}
          {isActive && (
            <button
              onClick={() => { onCopy({ retro_phone: retroPhone, dobrodoslica }); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Copy size={12} className="text-green-400" />
              Kopiraj link
            </button>
          )}

          {/* Mark as paid */}
          {isActive && (
            <button
              onClick={() => { onPaid(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Check size={12} />
              Označi kao plaćeno
            </button>
          )}

          {/* Discount */}
          <div className="px-4 py-2.5 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Popust:</span>
              <input
                type="number"
                min={0}
                step={500}
                value={couple.custom_discount ?? 0}
                onChange={(e) => onDiscount(parseInt(e.target.value) || 0)}
                className="w-16 text-[11px] text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1 text-right outline-none focus:border-white/20"
              />
              <span className="text-[10px] text-white/30">din</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        Admin Prijava
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin lozinka"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#AE343F]"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">Pogrešna lozinka</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-xl px-4 py-3 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Proveravam..." : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}
