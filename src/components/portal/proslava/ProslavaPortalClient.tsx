"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Images,
  Armchair,
  Lock,
  ExternalLink,
  QrCode,
  UtensilsCrossed,
  ImagePlus,
  Copy,
  Check,
  CalendarClock,
  Loader2,
} from "lucide-react";
import type { BirthdayRSVPEntry } from "@/lib/birthday-rsvp";
import type {
  ActionResult,
  GalleryLoadResult,
} from "@/lib/proslava/portal-actions-core";
import GuestListTab from "./GuestListTab";
import LockedTab from "./LockedTab";
import GalleryCard from "@/app/moje-vencanje/GalleryCard";
import MeniCard from "@/app/moje-vencanje/MeniCard";
import SlikeTab from "./SlikeTab";
import type { MeniData } from "@/app/pozivnica/[slug]/types";
import { galleryQrDataUrl } from "@/lib/gallery-qr";
import { describeDeadline } from "@/lib/rsvp-deadline";
import PrintCard from "@/components/portal/PrintCard";
import PrintChoiceModal from "@/components/portal/PrintChoiceModal";
import {
  getMeniDescription,
  getPortalTabs,
  getUpsellMeta,
  type PortalFlags,
  type ProslavaTab,
} from "./config";

const TAB_ICONS: Record<ProslavaTab, React.ReactNode> = {
  pregled: <Home size={17} />,
  gosti: <Users size={17} />,
  galerija: <Images size={17} />,
  raspored: <Armchair size={17} />,
  meni: <UtensilsCrossed size={17} />,
  slike: <ImagePlus size={17} />,
};

interface Props extends PortalFlags {
  displayName: string;
  eventDate: string;
  responses: BirthdayRSVPEntry[];
  fetchError: boolean;
  addGuestAction: (
    slug: string,
    name: string,
    guestCount: number,
  ) => Promise<ActionResult>;
  updateGuestCountAction: (
    slug: string,
    id: string,
    guestCount: number,
  ) => Promise<ActionResult>;
  deleteGuestAction: (slug: string, id: string) => Promise<ActionResult>;
  loadGalleryAction: (
    slug: string,
    skip?: number,
    limit?: number,
  ) => Promise<GalleryLoadResult | null>;
  deleteGalleryPhotoAction: (
    slug: string,
    id: string,
  ) => Promise<{ success: boolean }>;
  invitationImages: Array<{ url: string; pathname: string }>;
  uploadImageAction: (
    slug: string,
    form: FormData,
  ) => Promise<{ ok: boolean; url?: string; pathname?: string; error?: string }>;
  deleteImageAction: (
    slug: string,
    url: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  /** ISO `submit_until` — the RSVP cut-off shown (and extendable) on Pregled. */
  submitUntil: string;
  extendDeadlineAction: (
    slug: string,
    days: number,
  ) => Promise<
    { ok: true; submitUntil: string; capped: boolean } | { ok: false; error: string }
  >;
  loadMeniAction: (slug: string) => Promise<MeniData | null>;
  saveMeniAction: (
    slug: string,
    meni: MeniData,
  ) => Promise<{ error: string; ok?: undefined } | { ok: boolean; error?: undefined }>;
}

function daysUntil(eventDate: string): number | null {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatEventDate(eventDate: string): string {
  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProslavaPortalClient({
  displayName,
  eventDate,
  responses,
  fetchError,
  addGuestAction,
  updateGuestCountAction,
  deleteGuestAction,
  loadGalleryAction,
  deleteGalleryPhotoAction,
  loadMeniAction,
  saveMeniAction,
  invitationImages,
  uploadImageAction,
  deleteImageAction,
  submitUntil,
  extendDeadlineAction,
  ...flags
}: Props) {
  const tabs = getPortalTabs(flags);
  const [active, setActive] = useState<ProslavaTab>("pregled");

  // Deep links matter here — the /pristup page and our own messages link
  // straight to a tab.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && tabs.some((x) => x.key === t && !x.href)) {
      setActive(t as ProslavaTab);
    }
    // Read once on mount; afterwards the tab state is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (key: ProslavaTab) => {
    setActive(key);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    window.history.replaceState({}, "", url.toString());
  };

  // Production domain hardcoded like `gallery-qr.ts` does: this PNG gets
  // printed on table signs, so a preview host would hand out a dead URL.
  const [copied, setCopied] = useState(false);
  const [deadline, setDeadline] = useState(submitUntil);
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState("");
  const [printChoice, setPrintChoice] = useState<"potvrde" | "galerija" | null>(
    null,
  );

  const base = flags.isEighteenth ? "punoletstvo" : "deciji-rodjendan";
  const invitationUrl = `https://halouspomene.rs/${base}/${flags.slug}/`;
  // Short, print-friendly reply page. `/rsvp/[id]` already routes both birthday
  // kinds — the invitation anchor would open the whole page instead of the form.
  const rsvpUrl = `https://halouspomene.rs/rsvp/${base === "punoletstvo" ? "punoletstvo" : "rodjendan"}-${flags.slug}/`;
  const deadlineState = describeDeadline(deadline);

  function copyInvitationLink() {
    navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function extendDeadline() {
    setExtending(true);
    setExtendError("");
    const res = await extendDeadlineAction(flags.slug, 7);
    setExtending(false);
    if (res.ok) setDeadline(res.submitUntil);
    else setExtendError(res.error);
  }

  async function downloadPng(url: string, filename: string, camera = false) {
    let dataUrl: string;
    if (camera) {
      dataUrl = await galleryQrDataUrl(url, 1400);
    } else {
      const QRCode = (await import("qrcode")).default;
      dataUrl = await QRCode.toDataURL(url, {
        width: 1400,
        margin: 2,
        color: { dark: "#232323", light: "#ffffff" },
      });
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Points at the HUB, not the standalone /galerija page: one scanned code then
  // carries the album, the seat lookup and the menu, exactly like the
  // standalone-seating product's welcome-sign QR does. The old /galerija route
  // stays alive as insurance for any code already printed.
  const guestGalleryUrl = `https://halouspomene.rs/deciji-rodjendan/${flags.slug}/gde-sedim/?tab=galerija`;

  async function downloadGalleryQr() {
    const dataUrl = await galleryQrDataUrl(guestGalleryUrl, 1400);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-galerija-${flags.slug}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const attending = responses.filter((r) => r.attending === "Da");
  const notAttending = responses.filter((r) => r.attending === "Ne");
  const totalGuests = attending.reduce(
    (sum, r) => sum + (parseInt(r.guestCount) || 1),
    0,
  );
  const days = daysUntil(eventDate);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-1"
          style={{
            color: "var(--theme-primary)",
            fontFamily: "var(--theme-display-font)",
          }}
        >
          {displayName}
        </h1>
        <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
          {formatEventDate(eventDate)}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) =>
          tab.href ? (
            <Link
              key={tab.key}
              href={tab.href}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "#fff",
              }}
            >
              {TAB_ICONS[tab.key]}
              {tab.label}
              <ExternalLink size={12} className="opacity-70" />
            </Link>
          ) : (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
              style={{
                backgroundColor:
                  active === tab.key
                    ? "var(--theme-primary)"
                    : "var(--theme-surface)",
                color:
                  active === tab.key ? "#fff" : "var(--theme-text-muted)",
                border:
                  active === tab.key
                    ? "1px solid var(--theme-primary)"
                    : "1px solid var(--theme-border-light)",
              }}
            >
              {TAB_ICONS[tab.key]}
              {tab.label}
              {tab.locked && <Lock size={11} className="opacity-70" />}
            </button>
          ),
        )}
      </div>

      {fetchError && (
        <div
          className="p-4 rounded-2xl text-center mb-6"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <p className="text-red-600 text-sm">
            Greška pri učitavanju prijava. Osvežite stranicu.
          </p>
        </div>
      )}

      {active === "pregled" && (
        <div className="space-y-4">
          {/* Countdown hero */}
          {days !== null && (
            <div
              className="p-6 rounded-2xl text-center"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--theme-text-muted)" }}
              >
                {days > 0
                  ? "Do proslave"
                  : days === 0
                    ? "Danas je dan"
                    : "Proslava je prošla"}
              </p>
              {days > 0 && (
                <p
                  className="text-4xl font-bold"
                  style={{
                    color: "var(--theme-primary)",
                    fontFamily: "var(--theme-display-font)",
                  }}
                >
                  {days}{" "}
                  <span className="text-lg">
                    {days === 1 ? "dan" : "dana"}
                  </span>
                </p>
              )}

              <button
                onClick={copyInvitationLink}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-background)",
                  border: "1px solid var(--theme-border-light)",
                  color: copied
                    ? "var(--theme-primary)"
                    : "var(--theme-text-muted)",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Link je kopiran" : "Kopiraj link pozivnice"}
              </button>
            </div>
          )}

          {/* Rok za potvrde — invisible until now, even though it already
              gated the RSVP form. An expired deadline silently stopped guests
              from replying and nobody could see why. */}
          {deadlineState && (
            <div
              className="p-4 rounded-2xl flex items-center justify-between gap-3"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <CalendarClock
                  size={16}
                  style={{ color: "var(--theme-text-muted)" }}
                  className="shrink-0"
                />
                <span className="min-w-0">
                  <span
                    className="block text-sm font-medium"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {deadlineState.expired
                      ? "Rok za potvrde je istekao"
                      : "Rok za potvrde dolaska"}
                  </span>
                  <span
                    className="block text-xs"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {deadlineState.display}
                    {!deadlineState.expired &&
                      deadlineState.daysLeft <= 7 &&
                      ` — još ${deadlineState.daysLeft === 0 ? "danas" : `${deadlineState.daysLeft} dana`}`}
                  </span>
                </span>
              </span>
              {(deadlineState.expired || deadlineState.daysLeft <= 7) &&
                days !== null &&
                days >= 0 && (
                <button
                  onClick={extendDeadline}
                  disabled={extending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  {extending && <Loader2 size={12} className="animate-spin" />}
                  Produži 7 dana
                </button>
              )}
            </div>
          )}

          {extendError && (
            <p className="text-xs text-red-500 -mt-2">{extendError}</p>
          )}

          {/* Brojke */}
          <div className="grid grid-cols-3 gap-3">
            <StatTile value={totalGuests} label="Gostiju dolazi" accent />
            <StatTile value={attending.length} label="Potvrdili Da" accent />
            <StatTile value={notAttending.length} label="Ne dolazi" />
          </div>

          {/* Add-ons — locked ones lead to their teaser tab */}
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-widest pt-2"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Za štampu
            </p>

            {/* Sells the artefact, not the abstraction: a locked card names the
                add-on that unlocks it instead of a bare "Saznajte više". */}
            <PrintCard
              featured
              title="QR za potvrde dolaska"
              sub="Dodajte na štampane pozivnice — gosti skeniraju i potvrde dolazak."
              formats={["PNG"]}
              offerPill="štampamo za vas"
              onClick={() => setPrintChoice("potvrde")}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <PrintCard
                title="QR — Gde sedim"
                sub="Gosti pronalaze svoje mesto."
                formats={["PNG"]}
                locked={!flags.paidForRaspored}
                lockLabel="Uz raspored sedenja"
                onClick={() =>
                  flags.paidForRaspored
                    ? downloadPng(
                        `https://halouspomene.rs/deciji-rodjendan/${flags.slug}/gde-sedim/`,
                        `qr-gde-sedim-${flags.slug}.png`,
                      )
                    : selectTab("raspored")
                }
              />
              <PrintCard
                title="QR za galeriju"
                sub="Gosti šalju svoje fotografije."
                formats={["PNG"]}
                locked={!flags.paidForGallery}
                lockLabel="Uz galeriju fotografija"
                // Printed in advance, but the guest link only opens on the day —
                // saying so here stops "the code is broken" when it is tested early.
                note="Aktivan na dan proslave i sutradan."
                offerPill="štampamo za vas"
                onClick={() =>
                  flags.paidForGallery
                    ? setPrintChoice("galerija")
                    : selectTab("galerija")
                }
              />
            </div>

          </div>
        </div>
      )}

      {printChoice && (
        <PrintChoiceModal
          title={
            printChoice === "potvrde" ? "QR za potvrde dolaska" : "QR za galeriju"
          }
          fileLabel="Samo QR kod — PNG"
          fileHint="Za ubacivanje u vaš dizajn ili samostalnu štampu."
          offerText={
            printChoice === "potvrde"
              ? "Štampane pozivnice sa QR kodom za potvrde dolaska, izrađene po vašoj želji."
              : "Štampane zahvalnice sa QR kodom galerije — gosti skeniranjem ostavljaju svoje fotografije."
          }
          order={{
            product:
              printChoice === "potvrde"
                ? "Pozivnice sa QR kodom za potvrde dolaska"
                : "Zahvalnice sa QR kodom galerije",
            slug: flags.slug,
            displayName,
            eventDate,
          }}
          onDownload={() => {
            if (printChoice === "potvrde")
              downloadPng(rsvpUrl, `qr-potvrde-${flags.slug}.png`);
            else downloadPng(guestGalleryUrl, `qr-galerija-${flags.slug}.png`, true);
          }}
          onClose={() => setPrintChoice(null)}
        />
      )}

      {active === "gosti" && (
        <GuestListTab
          responses={responses}
          slug={flags.slug}
          addGuestAction={addGuestAction}
          updateGuestCountAction={updateGuestCountAction}
          deleteGuestAction={deleteGuestAction}
        />
      )}

      {active === "galerija" &&
        (flags.paidForGallery ? (
          <div className="space-y-4">
            <div
              className="p-4 rounded-2xl flex items-center justify-between gap-3"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <div className="min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--theme-text)" }}
                >
                  QR kod za goste
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  Odštampajte ga i stavite na stolove — gosti skeniraju i šalju
                  slike.
                </p>
              </div>
              <button
                onClick={downloadGalleryQr}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                <QrCode size={14} />
                Preuzmi QR
              </button>
            </div>
            <GalleryCard
              slug={flags.slug}
              // GalleryCard's contract is slug-free (the wedding actions read
              // the slug off the cookie); ours take it explicitly, so bind here.
              loadAction={(skip, limit) =>
                loadGalleryAction(flags.slug, skip, limit)
              }
              deleteAction={(id) => deleteGalleryPhotoAction(flags.slug, id)}
              downloadBase={`/api/deciji-rodjendan/${flags.slug}`}
            />
          </div>
        ) : (
          <LockedTab feature="galerija" meta={getUpsellMeta("galerija", flags)} />
        ))}

      {active === "slike" &&
        (flags.paidForImages ? (
          <SlikeTab
            slug={flags.slug}
            initialImages={invitationImages}
            uploadAction={uploadImageAction}
            deleteAction={deleteImageAction}
          />
        ) : (
          <LockedTab feature="slike" meta={getUpsellMeta("slike", flags)} />
        ))}

      {active === "meni" &&
        (flags.paidForGallery || flags.paidForRaspored ? (
          <MeniCard
            loadAction={() => loadMeniAction(flags.slug)}
            saveAction={(meni) => saveMeniAction(flags.slug, meni)}
            description={getMeniDescription(flags)}
          />
        ) : (
          <LockedTab feature="meni" meta={getUpsellMeta("meni", flags)} />
        ))}

      {active === "raspored" && (
        <LockedTab feature="raspored" meta={getUpsellMeta("raspored", flags)} />
      )}

    </div>
  );
}

function StatTile({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-2xl text-center"
      style={{
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border-light)",
      }}
    >
      <p
        className="text-2xl font-bold"
        style={{
          color: accent ? "var(--theme-primary)" : "var(--theme-text-muted)",
          fontFamily: "var(--theme-display-font)",
        }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

