"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import type { StandaloneGuest } from "@/lib/standalone-seating";
import RasporedClient from "@/lib/seating/editor/RasporedClient";
import {
  saveStandaloneRaspored,
  loadStandaloneRaspored,
  checkStandaloneActive,
} from "./actions";
import { generateStandaloneWelcomePDF } from "./generateStandaloneWelcomePDF";

interface Props {
  slug: string;
  eventName: string;
  ownerEmail: string;
  guests: StandaloneGuest[];
}

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

// HALO Uspomene brand palette — replaces the editor's default luxury gold.
const HALO_BRAND_VARS: React.CSSProperties = {
  "--theme-primary": "#AE343F",
  "--theme-primary-light": "rgba(174,52,63,0.25)",
  "--theme-primary-muted": "rgba(174,52,63,0.15)",
} as React.CSSProperties;

/** Adapts the standalone guest list into the RSVPEntry shape the shared
 *  editor consumes. Every entry is treated as "attending" — standalone
 *  events have no decline path, the organizer enters only confirmed guests. */
function toAttendingEntries(guests: StandaloneGuest[]): RSVPEntry[] {
  return guests.map((g) => ({
    id: g.id,
    timestamp: "",
    name: g.name,
    attending: "Da",
    guestCount: String(g.guestCount),
    details: "",
    category: g.category ?? "",
  }));
}

export default function StandaloneRasporedRoot({
  slug,
  eventName,
  ownerEmail,
  guests,
}: Props) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestContactName, setRequestContactName] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const totalGuests = guests.reduce((s, g) => s + g.guestCount, 0);

  async function handleSubmitDesignRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY) {
      toast.error("Slanje nije konfigurisano. Pišite na halouspomene@gmail.com.");
      return;
    }
    setRequestSubmitting(true);
    try {
      const editorUrl = `https://halouspomene.rs/raspored-sedenja/${slug}`;
      const lookupUrl = `https://halouspomene.rs/raspored-sedenja/${slug}/gde-sedim/`;

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `🎨 QR Pano dizajn zahtev — ${eventName}`,
          from_name: requestContactName.trim() || "Standalone klijent",
          email: ownerEmail,
          message: [
            `Klijent zahteva dizajn QR panoa za standalone raspored sedenja.`,
            ``,
            `Event: ${eventName}`,
            `Slug: ${slug}`,
            `Email klijenta: ${ownerEmail}`,
            `Kontakt osoba: ${requestContactName.trim() || "—"}`,
            `Broj stavki gostiju: ${guests.length}`,
            `Ukupno gostiju (sa pratiocima): ${totalGuests}`,
            ``,
            `Editor: ${editorUrl}`,
            `Gde sedim link: ${lookupUrl}`,
            ``,
            `Poruka klijenta:`,
            requestMessage.trim() || "(bez poruke)",
          ].join("\n"),
        }),
      });

      if (!res.ok) {
        toast.error("Greška pri slanju zahteva. Pokušajte ponovo.");
        return;
      }
      toast.success("Zahtev je poslat. Javljamo se u toku 24h.");
      setShowRequestModal(false);
      setRequestMessage("");
      setRequestContactName("");
    } catch {
      toast.error("Greška pri slanju zahteva. Pokušajte ponovo.");
    } finally {
      setRequestSubmitting(false);
    }
  }

  return (
    <>
      <RasporedClient
        attending={toAttendingEntries(guests)}
        slug={slug}
        coupleNames={eventName}
        paidForRaspored={true}
        actions={{
          save: saveStandaloneRaspored,
          load: loadStandaloneRaspored,
          checkPaid: checkStandaloneActive,
        }}
        hideBackButton
        sidebarTopAction={{
          label: "Lista gostiju",
          href: `/raspored-sedenja/${slug}/gosti`,
        }}
        guestLookupUrl={`https://halouspomene.rs/raspored-sedenja/${slug}/gde-sedim/`}
        hideWeddingOnlyElements
        hideDecorations
        themeVarsOverride={HALO_BRAND_VARS}
        onGenerateWelcomePDF={() =>
          generateStandaloneWelcomePDF({ slug, eventName })
        }
        onRequestPanoDesign={() => setShowRequestModal(true)}
      />

      {showRequestModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
          onClick={() => !requestSubmitting && setShowRequestModal(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitDesignRequest}
            className="w-full max-w-md rounded-2xl p-6 relative"
            style={{ backgroundColor: "#ffffff" }}
          >
            <button
              type="button"
              onClick={() => !requestSubmitting && setShowRequestModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
              style={{ color: "rgba(35,35,35,0.5)" }}
              aria-label="Zatvori"
            >
              <X size={15} />
            </button>

            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(174,52,63,0.12)" }}
            >
              <Sparkles size={18} style={{ color: "#AE343F" }} />
            </div>

            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: "#232323" }}
            >
              Zatraži dizajn QR panoa
            </h3>
            <p
              className="text-xs leading-relaxed mb-5"
              style={{ color: "rgba(35,35,35,0.6)" }}
            >
              Naš tim će dizajnirati štampani pano sa QR kodom za vaš event.
              Javljamo se u toku 24h sa cenom i predlogom dizajna.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label
                  className="text-[10px] uppercase tracking-widest mb-1 block"
                  style={{ color: "rgba(35,35,35,0.5)" }}
                >
                  Vaše ime (opciono)
                </label>
                <input
                  type="text"
                  value={requestContactName}
                  onChange={(e) => setRequestContactName(e.target.value)}
                  placeholder="Ime prezime"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: "#F5F4DC",
                    border: "1px solid rgba(35,35,35,0.12)",
                    color: "#232323",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-[10px] uppercase tracking-widest mb-1 block"
                  style={{ color: "rgba(35,35,35,0.5)" }}
                >
                  Poruka (opciono)
                </label>
                <textarea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Stil dizajna, format, dodatne želje..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "#F5F4DC",
                    border: "1px solid rgba(35,35,35,0.12)",
                    color: "#232323",
                  }}
                />
              </div>
            </div>

            <p
              className="text-[11px] mb-5 leading-relaxed"
              style={{ color: "rgba(35,35,35,0.5)" }}
            >
              Vaš email <strong>{ownerEmail}</strong>, slug, broj gostiju i link
              na editor će automatski biti uključeni u zahtev.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                disabled={requestSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#F5F4DC",
                  color: "rgba(35,35,35,0.7)",
                }}
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={requestSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#AE343F" }}
              >
                {requestSubmitting ? "Šaljem..." : "Pošalji zahtev"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
