"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Check, Pencil, Users, Cake, Armchair, Receipt, Eye } from "lucide-react";
import { encodeToBase64 } from "@/lib/encoding";
import ShareLinkButton from "./ShareLinkButton";

interface Birthday {
  slug: string;
  child_name: string;
  parent_names: string;
  event_date: string;
  theme: string;
  gender: string;
  age: number;
  type?: "child" | "eighteenth";
  draft?: boolean;
  paid_for_raspored?: boolean;
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
}

interface BirthdayStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
  seating: { totalSeats: number; assignedSeats: number } | null;
}

interface Props {
  onNeedsLogin: () => void;
  bankAccountIdx: number;
}

export default function BirthdayAdminList({ onNeedsLogin, bankAccountIdx }: Props) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [stats, setStats] = useState<Record<string, BirthdayStats>>({});
  const [shareStats, setShareStats] = useState<Record<string, { visit_count: number; last_visited_at?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [receiptCopiedSlug, setReceiptCopiedSlug] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/birthdays")
      .then((r) => {
        if (r.status === 401) {
          onNeedsLogin();
          setLoading(false);
          return [];
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBirthdays(data);
          fetch("/api/admin/birthday-stats")
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch(() => {});
          fetch("/api/admin/share-links?kind=birthday")
            .then((r) => r.json())
            .then((m) => {
              if (m && typeof m === "object") setShareStats(m);
            })
            .catch(() => {});
        }
        setLoading(false);
      });
  }, [onNeedsLogin]);

  async function handleToggleDraft(slug: string, current: boolean) {
    const newVal = !current;
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, draft: newVal } : b
      )
    );
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: newVal }),
    });
    if (!res.ok) {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.slug === slug ? { ...b, draft: current } : b
        )
      );
    }
  }

  async function handleToggleRaspored(slug: string, current: boolean) {
    const newVal = !current;
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, paid_for_raspored: newVal } : b
      )
    );
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_raspored: newVal }),
    });
    if (!res.ok) {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.slug === slug ? { ...b, paid_for_raspored: current } : b
        )
      );
    }
  }

  function daysUntil(dateStr: string) {
    // Calendar-day comparison so events later today don't show "za 1 dan".
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
    if (diff > 0) return `za ${diff} dana`;
    if (diff === 0) return "danas!";
    return `pre ${Math.abs(diff)} dana`;
  }

  function buildReceiptUrl(b: Birthday) {
    const data: Record<string, unknown> = {
      kind: "rodjendan",
      s: b.slug,
      par: b.child_name || b.slug,
      datum: b.event_date,
      r: b.paid_for_raspored ? 1 : 0,
      t18: b.type === "eighteenth" ? 1 : 0,
      d: b.custom_discount ?? 0,
      ba: bankAccountIdx,
      t: Date.now(),
    };
    return `https://halouspomene.rs/racun?d=${encodeToBase64(data)}`;
  }

  async function patchBirthday(slug: string, body: Record<string, unknown>) {
    return fetch(`/api/admin/birthdays/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function handleGenerateReceipt(slug: string) {
    const now = new Date().toISOString();
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, receipt_valid: true, receipt_created: now } : b,
      ),
    );
    const res = await patchBirthday(slug, { receipt_valid: true, receipt_created: now });
    if (!res.ok) {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.slug === slug ? { ...b, receipt_valid: false } : b,
        ),
      );
      alert(`Greška: Nisu mogli podesiti račun (${res.status})`);
    }
  }

  async function handleInvalidateReceipt(slug: string) {
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, receipt_valid: false } : b,
      ),
    );
    await patchBirthday(slug, { receipt_valid: false });
  }

  async function handleSetDiscount(slug: string, amount: number) {
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, custom_discount: amount } : b,
      ),
    );
    await patchBirthday(slug, { custom_discount: amount });
  }

  async function copyReceiptLink(b: Birthday) {
    const url = buildReceiptUrl(b);
    await navigator.clipboard.writeText(url);
    setReceiptCopiedSlug(b.slug);
    setTimeout(() => setReceiptCopiedSlug(null), 2500);
  }

  async function handleDelete() {
    if (!deleteSlug || deleteConfirm !== deleteSlug) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/birthdays/${deleteSlug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBirthdays((b) => b.filter((x) => x.slug !== deleteSlug));
      setDeleteSlug(null);
      setDeleteConfirm("");
    }
    setDeleting(false);
  }

  if (loading) return <p className="text-white/40">Učitavanje...</p>;

  const genderLabel = (g: string) =>
    g === "boy" ? "Dečak" : g === "girl" ? "Devojčica" : "Neutralno";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Rođendani ({birthdays.length})
        </h2>
        <button
          onClick={() => router.push("/admin/novi-rodjendan")}
          className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#E55A5A] text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus size={14} /> <span className="hidden sm:inline">Novi rođendan</span><span className="sm:hidden">Novi</span>
        </button>
      </div>

      <div className="space-y-3">
        {birthdays.map((b) => {
          const s = stats[b.slug];
          const eventDate = new Date(b.event_date);
          const today = new Date();
          const isPast = eventDate < today;

          return (
            <div
              key={b.slug}
              className={`rounded-xl px-4 py-4 sm:px-5 ${
                isPast
                  ? "bg-white/5 opacity-50 border border-white/10"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${b.draft ? "bg-orange-400" : "bg-green-400"}`}
                        title={b.draft ? "Draft" : "Live"}
                      />
                      <Cake size={14} className="text-[#FF6B6B] shrink-0" />
                      <span className="font-semibold text-white">
                        {b.child_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {b.age}. rođendan
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {genderLabel(b.gender)}
                      </span>
                      <span className="text-[10px] text-white/60 shrink-0">
                        {daysUntil(b.event_date)}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      /{b.slug} &middot; {b.parent_names} &middot;{" "}
                      {new Date(b.event_date).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {shareStats[b.slug]?.visit_count ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-green-400/70" title="Klijent je otvorio share link">
                          <Eye size={10} /> {shareStats[b.slug].visit_count}×
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ShareLinkButton
                      productKind="birthday"
                      slug={b.slug}
                      directUrl={`https://halouspomene.rs/${b.type === "eighteenth" ? "punoletstvo" : "deciji-rodjendan"}/${b.slug}/`}
                    />
                    <button
                      onClick={() => router.push(`/admin/rodjendan/${b.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
                      title="Izmeni"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteSlug(b.slug)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400 cursor-pointer"
                      title="Obriši"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats + toggles */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
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

                {s?.seating && b.paid_for_raspored && (
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

                <div className="flex items-center gap-3 sm:ml-auto">
                  <div
                    className="flex items-center gap-1.5"
                    title="Raspored sedenja"
                  >
                    <Armchair size={12} className="text-white/30" />
                    <button
                      onClick={() =>
                        handleToggleRaspored(b.slug, !!b.paid_for_raspored)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        b.paid_for_raspored ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          b.paid_for_raspored ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Draft</span>
                    <button
                      onClick={() => handleToggleDraft(b.slug, !!b.draft)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        b.draft ? "bg-orange-400" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          b.draft ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <BirthdayReceiptDropdown
                birthday={b}
                copiedSlug={receiptCopiedSlug}
                onGenerate={async () => {
                  await handleGenerateReceipt(b.slug);
                  await copyReceiptLink(b);
                }}
                onCopy={() => copyReceiptLink(b)}
                onPaid={() => handleInvalidateReceipt(b.slug)}
                onDiscount={(amount) => handleSetDiscount(b.slug, amount)}
              />
            </div>
          );
        })}
      </div>

      {/* Delete modal */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#2a2a2a] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Obriši <span className="text-red-400">{deleteSlug}</span>
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Ovo će obrisati rođendansku pozivnicu i sve RSVP prijave. Unesite slug za potvrdu:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={deleteSlug}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm mb-4 focus:outline-none focus:border-red-400"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setDeleteSlug(null); setDeleteConfirm(""); }}
                className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== deleteSlug || deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-30 cursor-pointer"
              >
                {deleting ? "Brisanje..." : "Obriši"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BirthdayReceiptDropdown({
  birthday,
  copiedSlug,
  onGenerate,
  onCopy,
  onPaid,
  onDiscount,
}: {
  birthday: Birthday;
  copiedSlug: string | null;
  onGenerate: () => void;
  onCopy: () => void;
  onPaid: () => void;
  onDiscount: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCopied = copiedSlug === birthday.slug;
  const isActive = birthday.receipt_valid;

  return (
    <div ref={ref} className="relative mt-2 pt-2 border-t border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[10px] cursor-pointer transition-colors ${
          isActive ? "text-green-400 hover:text-green-300" : "text-white/30 hover:text-white/50"
        }`}
      >
        <Receipt size={11} />
        {isCopied ? "✓ Link kopiran!" : isActive ? "Račun aktivan" : "Račun"}
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 rounded-lg overflow-hidden shadow-xl z-30"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 220 }}
        >
          <button
            onClick={() => {
              onGenerate();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Receipt size={12} className="text-yellow-400" />
            {isActive ? "Regeneriši račun" : "Generiši račun"}
          </button>

          {isActive && (
            <button
              onClick={() => {
                onCopy();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Copy size={12} className="text-green-400" />
              Kopiraj link
            </button>
          )}

          {isActive && (
            <button
              onClick={() => {
                onPaid();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Check size={12} />
              Označi kao plaćeno
            </button>
          )}

          <div className="px-4 py-2.5 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Popust:</span>
              <input
                type="number"
                min={0}
                step={500}
                value={birthday.custom_discount ?? 0}
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
