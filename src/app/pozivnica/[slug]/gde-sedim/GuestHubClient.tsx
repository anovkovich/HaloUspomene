"use client";

import React, { useState } from "react";
import { Armchair, Map, Images, UtensilsCrossed } from "lucide-react";
import GdeSedimClient from "./GdeSedimClient";
import HallMap from "./HallMap";
import MeniTab from "./MeniTab";
import GalerijaClient from "../galerija/GalerijaClient";
import type { GuestLookupEntry } from "./page";
import type { TableData } from "@/lib/seating";
import type { GalleryPhoto } from "@/lib/gallery";
import type { GalleryPhase } from "@/lib/gallery-lifecycle";
import type { MeniData } from "../types";

type TabKey = "seating" | "map" | "meni" | "gallery";

interface Props {
  slug: string;
  coupleNames: string;
  ijekavica: boolean;
  useCyrillic: boolean;
  hasSeating: boolean;
  guestLookup: GuestLookupEntry[];
  tables: TableData[];
  hasGallery: boolean;
  galleryPhase: GalleryPhase;
  galleryPhotos: GalleryPhoto[];
  hasMeni: boolean;
  meni: MeniData | null;
}

/**
 * Unified guest hub opened from the welcome-pano QR (`/pozivnica/[slug]/gde-sedim`).
 * Bottom tab bar switches between the features the couple enabled:
 *   Gde sedim · Plan sale (both when paid_for_raspored) · Galerija (paid_for_gallery).
 * Owns the selected-guest state so the "Plan sale" tab highlights the table the
 * guest found under "Gde sedim". Reuses the existing GdeSedimClient / HallMap /
 * GalerijaClient — no duplicate logic.
 */
export default function GuestHubClient({
  slug,
  coupleNames,
  ijekavica,
  useCyrillic,
  hasSeating,
  guestLookup,
  tables,
  hasGallery,
  galleryPhase,
  galleryPhotos,
  hasMeni,
  meni,
}: Props) {
  const [selected, setSelected] = useState<GuestLookupEntry | null>(null);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [];
  if (hasSeating) {
    tabs.push({
      key: "seating",
      label: ijekavica ? "Gdje sjedim" : "Gde sedim",
      icon: <Armchair size={20} />,
    });
    tabs.push({ key: "map", label: "Plan sale", icon: <Map size={20} /> });
  }
  if (hasMeni) {
    tabs.push({
      key: "meni",
      label: "Meni",
      icon: <UtensilsCrossed size={20} />,
    });
  }
  if (hasGallery) {
    tabs.push({ key: "gallery", label: "Galerija", icon: <Images size={20} /> });
  }

  const [active, setActive] = useState<TabKey>(
    hasSeating ? "seating" : hasMeni ? "meni" : "gallery",
  );
  const showBar = tabs.length > 1;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      style={{ color: "var(--theme-text)" }}
    >
      <div
        className={`max-w-lg mx-auto px-4 py-8 sm:py-12 ${showBar ? "pb-28" : ""}`}
      >
        {/* Shared header */}
        <div className="text-center mb-8">
          <h1
            className="font-script text-5xl sm:text-6xl mb-3"
            style={{ color: "var(--theme-primary)" }}
          >
            {coupleNames}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px w-10"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
            <span
              style={{ color: "var(--theme-primary)", opacity: 0.5, fontSize: 12 }}
            >
              ✦
            </span>
            <div
              className="h-px w-10"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
          </div>
        </div>

        {/* Tab content */}
        {active === "seating" && hasSeating && (
          <GdeSedimClient
            guestLookup={guestLookup}
            tables={tables}
            ijekavica={ijekavica}
            selected={selected}
            onSelectChange={setSelected}
            showMap={false}
          />
        )}

        {active === "map" && hasSeating && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div
                className="h-px w-8"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
              <p
                className="font-raleway text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "var(--theme-text-light)" }}
              >
                Plan sale
              </p>
              <div
                className="h-px w-8"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
            </div>
            {tables.length > 0 ? (
              <HallMap
                tables={tables}
                highlightTableIds={
                  selected ? selected.tables.map((t) => t.tableId) : []
                }
              />
            ) : (
              <p
                className="text-center font-serif text-base py-12"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Plan sale će uskoro biti dostupan.
              </p>
            )}
          </div>
        )}

        {active === "meni" && hasMeni && meni && (
          <MeniTab meni={meni} useCyrillic={useCyrillic} />
        )}

        {active === "gallery" && hasGallery && (
          <GalerijaClient
            embedded
            slug={slug}
            coupleNames={coupleNames}
            useCyrillic={useCyrillic}
            phase={galleryPhase}
            initialPhotos={galleryPhotos}
          />
        )}
      </div>

      {/* Fixed bottom tab bar */}
      {showBar && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderTop: "1px solid var(--theme-border)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="max-w-lg mx-auto flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="flex flex-col items-center gap-1 flex-1 py-2 transition-colors"
                style={{
                  color:
                    active === tab.key
                      ? "var(--theme-primary)"
                      : "var(--theme-text-light)",
                }}
              >
                {tab.icon}
                <span className="text-[10px] font-medium font-raleway">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
