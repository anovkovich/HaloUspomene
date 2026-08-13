"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Images,
  Armchair,
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  QrCode,
  UtensilsCrossed,
  ImagePlus,
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
  return d.toLocaleDateString("sr-RS", {
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
            </div>
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
              Dodaci za proslavu
            </p>
            {tabs
              .filter((t) => t.key === "galerija" || t.key === "raspored")
              .map((t) => (
                <AddonRow
                  key={t.key}
                  label={t.label}
                  locked={t.locked}
                  href={t.href}
                  onClick={() => selectTab(t.key)}
                />
              ))}
          </div>
        </div>
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

function AddonRow({
  label,
  locked,
  href,
  onClick,
}: {
  label: string;
  locked: boolean;
  href?: string;
  onClick: () => void;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-2.5">
        {locked ? (
          <Lock size={16} style={{ color: "var(--theme-text-muted)" }} />
        ) : (
          <Sparkles size={16} style={{ color: "var(--theme-primary)" }} />
        )}
        <span
          className="font-medium text-sm"
          style={{ color: "var(--theme-text)" }}
        >
          {label}
        </span>
      </span>
      <span
        className="flex items-center gap-1 text-xs"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {locked ? "Saznajte više" : "Otvori"}
        <ChevronRight size={14} />
      </span>
    </>
  );

  const className =
    "w-full flex items-center justify-between gap-3 p-4 rounded-2xl transition-opacity hover:opacity-80 cursor-pointer text-left";
  const style = {
    backgroundColor: "var(--theme-surface)",
    border: "1px solid var(--theme-border-light)",
  };

  return href ? (
    <Link href={href} className={className} style={style}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}
