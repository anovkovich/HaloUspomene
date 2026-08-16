"use client";

import { useState } from "react";
import { Instagram, Check } from "lucide-react";
import { analytics } from "@/utils/analytics";

const INSTAGRAM_URL = "https://www.instagram.com/halo_uspomene";

/** Instagram brend gradijent — radijalni iz donjeg levog ugla (to daje onaj
 *  prepoznatljiv prelaz; linearna varijanta izgleda pljosnato). Namerno stoji
 *  SAMO na ikonici-čipu: čip je samodovoljan pa isto radi na tamnim staklenim i
 *  na svetlim temama, a dugme ostaje "ghost" da primarno dugme zadrži primat. */
const IG_GRADIENT =
  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)";

/**
 * Sekundarno "zaprati nas" dugme za RSVP-success ekran. Klijentsko ostrvo u
 * (serverskom) InvitationOfferCTA, po uzoru na PromoCodeCopy.
 *
 * Kad postoji poklon kôd, klik ga prvo kopira pa pušta normalno otvaranje
 * Instagrama u novom tabu — inače gost ode sa stranice i kôd mu ostane samo u
 * glavi. Mikro-tekst to najavi, a posle klika potvrdi zelenom kvačicom.
 *
 * Namerno "ghost" stil (providna pozadina, tanka ivica, manji font) da primarno
 * dugme ka builderu ostane jedino puno obojeno.
 */
export default function InstagramFollowLink({
  code,
  textColor,
  borderColor,
  mutedColor,
}: {
  code?: string;
  textColor: string;
  borderColor: string;
  mutedColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    analytics.socialClick("instagram", "rsvp_success");
    if (!code) return;
    try {
      // Ne-blokirajuće: navigacija u novi tab kreće odmah, kopiranje ide
      // paralelno (poziv je unutar korisničkog gesta, pa dozvola važi).
      void navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {}
  };

  return (
    <div className="mt-3">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 pl-2.5 pr-5 py-2 rounded-full text-[13px] font-medium border bg-transparent transition-opacity duration-300 hover:opacity-80"
        style={{ color: textColor, borderColor }}
      >
        <span
          aria-hidden
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px]"
          style={{ background: IG_GRADIENT }}
        >
          <Instagram size={14} strokeWidth={2.2} color="#ffffff" />
        </span>
        Zapratite nas na Instagramu
      </a>
      <p className="mt-1.5 text-[11px]" style={{ color: mutedColor }}>
        {code ? (
          copied ? (
            <span
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color: "#22c55e" }}
            >
              <Check size={12} /> Kôd je kopiran — čeka vas kad zatreba.
            </span>
          ) : (
            "Klikom se kôd kopira, pa ga imate i kasnije."
          )
        ) : (
          "Ideje i inspiracija za vašu proslavu."
        )}
      </p>
    </div>
  );
}
