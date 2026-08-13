"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, X, ArrowRight } from "lucide-react";
import { trackEvent } from "@/utils/analytics";
import { guestsLabel } from "@/lib/serbian-plural";
import type { NudgeStage, NudgeState } from "@/lib/seating/nudge";
import { dismissSeatingNudgeAction } from "./actions";

interface Props {
  slug: string;
  state: NudgeState;
  stage: NudgeStage;
  /** Zbir osoba iz potvrda sa odgovorom "dolazi" — ulazi u naslov. */
  attendingPeople: number;
}

interface Copy {
  title: string;
  body: string;
  cta: string;
}

function getCopy(state: NudgeState, stage: NudgeStage, n: number): Copy {
  // `n` je broj OSOBA, ne broj potvrda — traka stoji tik iznad statistike koja
  // razdvaja to dvoje, pa svako mešanje odmah puca u oči.
  const guests = guestsLabel(n);

  if (state === "paid_empty") {
    return {
      title: "Vaš raspored sedenja vas čeka",
      body: `Dolazak je potvrdilo ${guests} — svi su već u editoru, spremni za raspoređivanje. Ako je vaša sala u našoj biblioteci šema, učitajte je i preskočite crtanje.`,
      cta: "Započni raspored",
    };
  }

  if (stage === "strong") {
    return {
      title: "Potvrde su se ustalile — vreme je da gosti dobiju svoja mesta",
      body: `Dolazak je potvrdilo ${guests}. Raspored se pravi lakše sad nego u poslednjoj noći, a alat Gde sedim vas štedi od odgovaranja na istu poruku trideset puta.`,
      cta: "Otvori editor rasporeda",
    };
  }

  return {
    title: `Dolazak je potvrdilo ${guests} — dobar trenutak za raspored sedenja`,
    body: "U editoru postavite stolove svoje sale i rasporedite goste, a svako od njih pred salom ukuca svoje ime i odmah vidi gde sedi. Probajte sa svojim gostima — oni su već tu.",
    cta: "Otvori editor rasporeda",
  };
}

export default function SeatingNudgeCard({
  slug,
  state,
  stage,
  attendingPeople,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const viewLogged = useRef(false);

  useEffect(() => {
    if (viewLogged.current) return;
    viewLogged.current = true;
    trackEvent("seating_nudge_view", {
      nudge_state: state,
      nudge_stage: stage,
    });
  }, [state, stage]);

  if (hidden) return null;

  const copy = getCopy(state, stage, attendingPeople);

  const handleDismiss = () => {
    setHidden(true);
    trackEvent("seating_nudge_dismiss", {
      nudge_state: state,
      nudge_stage: stage,
    });
    // Namerno bez await-a: par je već video da je traka nestala, a upis je
    // samo pamćenje odluke za sledeći uređaj.
    void dismissSeatingNudgeAction(state, stage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-[#d4af37]/40 p-5 mb-4 shadow-[0_10px_26px_-18px_rgba(174,52,63,0.35)]"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <button
        onClick={handleDismiss}
        aria-label="Sakrij predlog"
        className="absolute top-3 right-3 text-[#232323]/55 hover:text-[#232323] transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AE343F]/10 shrink-0">
          <LayoutDashboard size={18} className="text-[#AE343F]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg text-[#232323] mb-1 pr-6">
            {copy.title}
          </p>
          <p className="text-[13px] text-[#232323]/70 leading-relaxed">
            {copy.body}
          </p>
          <a
            href={`/pozivnica/${slug}/raspored-sedenja/?source=gosti_nudge`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("seating_nudge_click", {
                nudge_state: state,
                nudge_stage: stage,
              })
            }
            className="mt-3.5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#AE343F] text-white shadow-[0_6px_16px_-8px_rgba(174,52,63,0.6)] hover:bg-[#962d36] transition-colors cursor-pointer"
          >
            {copy.cta}
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
