"use client";

import { useEffect, useState, useRef } from "react";
import {
  Calendar,
  Trash2,
  Copy,
  Check,
  Link2,
  RefreshCw,
  MapPin,
  Sparkles,
  Receipt,
  FileText,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { issueReceiptRef } from "@/lib/issue-receipt-ref";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice, pricing } from "@/data/pricing";
import {
  weekendKey,
  occupies,
  PHONE_UNITS_DEFAULT,
  type PhoneRental,
} from "@/lib/phone-rentals-shared";
import AdminCalendar from "./AdminCalendar";
import FocusNotice from "./FocusNotice";
import {
  buildReceiptItems,
  currentPriceTable,
  receiptTotal,
  type ReceiptFlags,
} from "@/lib/receipt-items";
import type { MarkPaidTarget } from "@/lib/admin-mark-paid";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://halouspomene.rs";
const ONLINE_PAY_URL = `${SITE_URL}/telefon-uspomena/online-placanje/`;

export default function PhoneAdminTab({
  bankAccountIdx,
  couples,
  onNeedsLogin,
  onMarkPaid,
  focusSlug,
  focusLabel,
  onClearFocus,
}: {
  bankAccountIdx: number;
  /** Weddings, shown as faint context dots in the availability calendar. */
  couples: Array<{
    event_date: string;
    couple_names: { full_display: string };
    slug: string;
    draft?: boolean;
  }>;
  onNeedsLogin: () => void;
  onMarkPaid: (target: MarkPaidTarget) => void;
  /** Kad pretraga po pozivu na broj pogodi ovaj tab — prikaži samo taj `tel-…` id. */
  focusSlug?: string | null;
  focusLabel?: string;
  onClearFocus?: () => void;
}) {
  const { confirm, dialog } = useConfirmDialog({ variant: "dark" });
  const [rentals, setRentals] = useState<PhoneRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactName, setContactName] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [dobrodoslica, setDobrodoslica] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [units, setUnits] = useState(PHONE_UNITS_DEFAULT);
  const [unitsBusy, setUnitsBusy] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/phone-rentals");
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      const data = await r.json();
      setRentals(Array.isArray(data) ? data : []);
      // Stamp the clock here, in an event handler — payment holds expire against
      // it, and reading Date.now() during render is impure (unstable re-renders).
      setLoadedAt(Date.now());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    fetch("/api/admin/phone-units")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.units === "number") setUnits(d.units);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Fleet size is the only override left now that a full weekend hard-blocks
   *  the Dodaj button: borrow a third phone, raise it, book, lower it back. */
  async function changeUnits(delta: number) {
    const next = units + delta;
    if (next < 1 || next > 20) return;
    setUnitsBusy(true);
    try {
      const r = await fetch("/api/admin/phone-units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ units: next }),
      });
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      if (r.ok) setUnits(next);
    } finally {
      setUnitsBusy(false);
    }
  }

  async function handleAddRental() {
    if (!contactName.trim() || !rentalDate) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/phone-rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: contactName,
          rental_date: rentalDate,
          notes: newNotes.trim() || undefined,
          dobrodoslica: dobrodoslica || undefined,
          source: "admin",
        }),
      });
      if (res.ok) {
        const newRental = await res.json();
        setRentals((prev) =>
          [...prev, newRental].sort(
            (a, b) =>
              new Date(a.rental_date).getTime() -
              new Date(b.rental_date).getTime(),
          ),
        );
        setContactName("");
        setRentalDate("");
        setNewNotes("");
        setDobrodoslica(false);
      }
    } catch (error) {
      console.error("Error adding rental:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRental(id: string) {
    if (!(await confirm({ title: "Obriši iznajmljivanje?", danger: true, confirmLabel: "Obriši" })))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/phone-rentals/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setRentals((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting rental:", error);
    } finally {
      setDeleting(false);
    }
  }

  function downloadIcs(dateStr: string, summary: string, filename: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateFormatted = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:${summary}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Flags shared by the printed receipt and the ledger prefill, so the amount
   *  we file can never disagree with the amount we billed. */
  function receiptFlags(rental: PhoneRental) {
    return {
      s: rental.id, // tel-xxx
      par: rental.contact_name,
      datum: rental.rental_date,
      r: 0,
      a: 0,
      uk: 0,
      ub: 0,
      rp: 1, // retro phone
      pd: rental.dobrodoslica ? 1 : 0, // dobrodoslica addon
      cc: 0,
      ig: 0,
      d: rental.custom_discount ?? 0,
      ba: bankAccountIdx,
    };
  }

  async function buildReceiptUrl(rental: PhoneRental) {
    const data = receiptFlags(rental);
    // Cache-buster on the receipt URL only — it must not reach receiptTotal.
    Object.assign(data, { t: Date.now() });
    const { items, bundleDiscount } = buildReceiptItems(
      data as unknown as ReceiptFlags,
      currentPriceTable(),
    );
    const total =
      items.reduce((s, i) => s + i.p, 0) -
      bundleDiscount -
      (rental.custom_discount ?? 0);

    Object.assign(data, {
      t: await issueReceiptRef({
        kind: "telefon",
        slug: rental.id,
        displayName: rental.contact_name || rental.id,
        amountRsd: total,
        items: items.map((i) => ({ l: i.l, p: i.p })),
        bankAccountIdx,
        t: (data as unknown as { t: number }).t,
      }),
    });

    const payload = { ...data, v: 2, li: items, bd: bundleDiscount };
    return `${SITE_URL}/racun?d=${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
  }

  async function handleGenerateReceipt(id: string) {
    const now = new Date().toISOString();
    const res = await fetch(`/api/admin/phone-rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: true, receipt_created: now }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  async function handleCopyReceiptUrl(id: string) {
    const rental = rentals.find((r) => r.id === id);
    if (!rental) return;
    await navigator.clipboard.writeText(await buildReceiptUrl(rental));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  /** Shipping notes — seeded from the location the buyer typed on the self-serve
   *  form, then ours to extend (street, courier, who hands the phone over). */
  async function saveNotes(id: string, notes: string) {
    const res = await fetch(`/api/admin/phone-rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  /** Receipt is spent once the payment is filed — same lifecycle as a couple's. */
  async function invalidateReceipt(id: string) {
    const res = await fetch(`/api/admin/phone-rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: false }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  /** Hands the rental to the shared mark-paid modal, so a manual (žiralna)
   *  payment for a phone lands in the Uplate ledger like every other product —
   *  and an already-pending self-serve order can be linked and approved, which
   *  runs unlock() and flips `paid` on the rental. */
  function openMarkPaid(rental: PhoneRental) {
    onMarkPaid({
      slug: rental.id,
      name: rental.contact_name,
      premium: false,
      kind: "telefon",
      defaultTier: "default",
      prefillAmount: receiptTotal(
        receiptFlags(rental) as unknown as ReceiptFlags,
        currentPriceTable(),
      ),
      prefillLabel: `Retro telefon — ${rental.contact_name}`.slice(0, 120),
      slugEditable: false,
      source: {
        type: "external",
        onInvalidate: () => invalidateReceipt(rental.id),
      },
    });
  }

  async function copyOnlineLink() {
    try {
      await navigator.clipboard.writeText(ONLINE_PAY_URL);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      /* clipboard blocked — the URL is visible next to the button */
    }
  }

  // Bookings per capacity WEEKEND, applying the same `occupies` rule the server
  // uses — counting every row instead would call a date full while the public
  // checkout is still selling it (an expired unpaid hold occupies nothing).
  const perWeekend = new Map<string, number>();
  for (const r of rentals) {
    if (!occupies(r, loadedAt)) continue;
    const k = weekendKey(r.rental_date);
    perWeekend.set(k, (perWeekend.get(k) ?? 0) + 1);
  }
  const takenThisWeekend = rentalDate
    ? (perWeekend.get(weekendKey(rentalDate)) ?? 0)
    : 0;
  const dateFull = !!rentalDate && takenThisWeekend >= units;

  const today = new Date().toISOString().slice(0, 10);
  // Fokus iz pretrage po pozivu na broj suzi obe liste na taj `tel-…` id.
  const visibleRentals = focusSlug
    ? rentals.filter((r) => r.id === focusSlug)
    : rentals;
  const upcoming = visibleRentals.filter((r) => r.rental_date >= today);
  const past = visibleRentals.filter((r) => r.rental_date < today);

  return (
    <div>
      {dialog}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Retro telefon {upcoming.length > 0 && `(${upcoming.length})`}
        </h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white/80 transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Osveži
        </button>
      </div>

      {/* Link za samostalno plaćanje */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/85 flex items-center gap-2">
              <Link2 size={15} className="text-[#AE343F]" />
              Link za samostalno plaćanje
            </p>
            <p className="text-xs text-white/45 mt-1 leading-relaxed">
              Pošalji klijentu — sam upisuje datum i podatke, plaća{" "}
              {formatPrice(pricing.packages.essential.price)} karticom ili preko
              IPS QR koda, i rezervacija se sama pojavi u ovoj listi.
            </p>
            <p className="text-[11px] font-mono text-white/30 mt-1.5 break-all">
              {ONLINE_PAY_URL}
            </p>
          </div>
          <button
            onClick={copyOnlineLink}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#AE343F] hover:bg-[#8d2a33] text-white px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            {linkCopied ? <Check size={14} /> : <Copy size={14} />}
            {linkCopied ? "Kopirano" : "Kopiraj link"}
          </button>
        </div>
      </div>

      {/* Novo iznajmljivanje (ručno) */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-white/80">
            Novo iznajmljivanje (ručno)
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40">Uređaja u floti:</span>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => changeUnits(-1)}
                disabled={unitsBusy || units <= 1}
                className="w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Smanji broj uređaja"
              >
                −
              </button>
              <span className="text-xs font-semibold text-white tabular-nums w-4 text-center">
                {units}
              </span>
              <button
                onClick={() => changeUnits(1)}
                disabled={unitsBusy || units >= 20}
                className="w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Povećaj broj uređaja"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Ime osobe"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#AE343F]"
          />
          <DatePicker
            value={rentalDate}
            onChange={setRentalDate}
            placeholder="Izaberite datum"
            variant="dark"
          />
        </div>
        {dateFull && (
          <p className="text-xs text-amber-300">
            Taj vikend je pun — {takenThisWeekend} od {units} telefona je već
            rezervisano. Ako si obezbedio još jedan, povećaj broj uređaja gore.
          </p>
        )}
        <textarea
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          rows={2}
          placeholder="Napomena — adresa i podaci za slanje"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#AE343F] resize-y"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dobrodoslica"
            checked={dobrodoslica}
            onChange={(e) => setDobrodoslica(e.target.checked)}
            className="rounded cursor-pointer"
          />
          <label
            htmlFor="dobrodoslica"
            className="text-xs text-white/70 cursor-pointer"
          >
            Personalizovana audio dobrodošlica
          </label>
        </div>
        <button
          onClick={handleAddRental}
          disabled={saving || !contactName.trim() || !rentalDate || dateFull}
          className="w-full sm:w-auto bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Dodajem…" : "Dodaj"}
        </button>
      </div>

      {/* Availability — between the form it feeds and the list it summarizes. */}
      <AdminCalendar
        rentals={rentals}
        units={units}
        now={loadedAt}
        couples={couples}
        onPickDate={setRentalDate}
      />

      {loading ? (
        <p className="text-white/40 py-10 text-center text-sm">Učitavanje…</p>
      ) : rentals.length === 0 ? (
        <p className="text-white/40 py-10 text-center text-sm">
          Nema iznajmljivanja.
        </p>
      ) : (
        <div className="space-y-6">
          {focusSlug && (
            <FocusNotice
              paymentRef={focusLabel ?? focusSlug}
              count={visibleRentals.length}
              onClear={() => onClearFocus?.()}
            />
          )}
          {upcoming.length > 0 && (
            <RentalList
              rentals={upcoming}
              copiedId={copiedId}
              deleting={deleting}
              onIcs={downloadIcs}
              onGenerate={handleGenerateReceipt}
              onCopy={handleCopyReceiptUrl}
              onPaid={openMarkPaid}
              onDelete={handleDeleteRental}
              onSaveNotes={saveNotes}
            />
          )}
          {past.length > 0 && (
            <div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">
                Prošli termini
              </span>
              <div className="mt-2">
                <RentalList
                  rentals={past}
                  copiedId={copiedId}
                  deleting={deleting}
                  dim
                  onIcs={downloadIcs}
                  onGenerate={handleGenerateReceipt}
                  onCopy={handleCopyReceiptUrl}
                  onPaid={openMarkPaid}
                  onDelete={handleDeleteRental}
                  onSaveNotes={saveNotes}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RentalList({
  rentals,
  copiedId,
  deleting,
  dim = false,
  onIcs,
  onGenerate,
  onCopy,
  onPaid,
  onDelete,
  onSaveNotes,
}: {
  rentals: PhoneRental[];
  copiedId: string | null;
  deleting: boolean;
  dim?: boolean;
  onIcs: (date: string, summary: string, filename: string) => void;
  onGenerate: (id: string) => void;
  onCopy: (id: string) => void;
  onPaid: (rental: PhoneRental) => void;
  onDelete: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void | Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {rentals.map((rental) => {
        // A handful of legacy rows predate the date field — render them rather
        // than printing "Invalid Date".
        const formattedRentalDate = rental.rental_date
          ? new Date(rental.rental_date).toLocaleDateString("sr-RS", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "bez datuma";
        const selfServe = rental.source === "self";

        return (
          <div
            key={rental.id}
            className={`rounded-xl border p-4 ${
              dim
                ? "border-white/5 bg-white/[0.02] opacity-60"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white">
                    {rental.contact_name}
                  </p>
                  {selfServe && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        rental.paid
                          ? "bg-green-500/20 text-green-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {rental.paid ? "Plaćeno online" : "Čeka uplatu"}
                    </span>
                  )}
                  {rental.dobrodoslica && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      <Sparkles size={10} /> Dobrodošlica
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} /> {formattedRentalDate}
                  </span>
                  {rental.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} /> {rental.city}
                    </span>
                  )}
                  {rental.phone && (
                    <a
                      href={`tel:${rental.phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {rental.phone}
                    </a>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() =>
                    onIcs(
                      rental.rental_date,
                      `Iznajmljivanje telefona — ${rental.contact_name}`,
                      `iznajmljivanje-${rental.id}.ics`,
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
                  title="Dodaj u kalendar"
                >
                  <Calendar size={14} />
                </button>

                <button
                  onClick={() => onDelete(rental.id)}
                  disabled={deleting}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400 disabled:opacity-50 cursor-pointer"
                  title="Obriši"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <NotesBlock
              notes={rental.notes ?? ""}
              onSave={(v) => onSaveNotes(rental.id, v)}
            />

            {/* Receipt — own row at the bottom of the card, same spot as on the
                Pozivnice and Rođendani cards. */}
            <div className="mt-3 pt-2 border-t border-white/5">
              <ReceiptDropdownMini
                rental={rental}
                copiedId={copiedId}
                onGenerate={() => onGenerate(rental.id)}
                onCopy={() => onCopy(rental.id)}
                onPaid={() => onPaid(rental)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Free-text shipping note per rental. Multi-line on purpose — an address, a
 *  courier reference and a contact rarely fit on one line, which is why this is
 *  inline editing rather than the shared single-line prompt dialog. */
function NotesBlock({
  notes,
  onSave,
}: {
  notes: string;
  onSave: (v: string) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setDraft(notes);
          setEditing(true);
        }}
        className="mt-2 w-full text-left group cursor-pointer"
        title="Izmeni napomenu"
      >
        {notes ? (
          <p className="text-[11px] leading-relaxed text-white/55 whitespace-pre-wrap group-hover:text-white/80 transition-colors">
            <FileText size={11} className="inline mr-1.5 -mt-0.5 text-white/30" />
            {notes}
          </p>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/25 group-hover:text-white/50 transition-colors">
            <FileText size={11} /> Dodaj napomenu za slanje
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Adresa, kontakt za preuzimanje, kurirska služba…"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-[#AE343F] resize-y"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[#AE343F] hover:bg-[#8d2a33] disabled:opacity-50 text-white px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer"
        >
          {saving ? "Čuvam…" : "Sačuvaj"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
        >
          Otkaži
        </button>
      </div>
    </div>
  );
}

function ReceiptDropdownMini({
  rental,
  copiedId,
  onGenerate,
  onCopy,
  onPaid,
}: {
  rental: PhoneRental;
  copiedId: string | null;
  onGenerate: () => void;
  onCopy: () => void;
  onPaid: () => void;
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

  const isCopied = copiedId === rental.id;
  const isActive = rental.receipt_valid;

  return (
    <div ref={ref} className="relative">
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
          style={{
            backgroundColor: "#2a2a2a",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 180,
          }}
        >
          <button
            onClick={() => {
              onGenerate();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            📋 {isActive ? "Regeneriši" : "Generiši"}
          </button>

          {isActive && (
            <>
              <button
                onClick={() => {
                  onCopy();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors border-t border-white/5"
              >
                {isCopied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} />
                )}
                {isCopied ? "✓ Kopiran!" : "Kopiraj link"}
              </button>

              <button
                onClick={() => {
                  onPaid();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors border-t border-white/5"
              >
                <Check size={12} /> Označi kao plaćeno
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
