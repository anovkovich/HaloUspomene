"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { GuestList, Invitee } from "./types";
import { loadGuestListAction, saveGuestListAction } from "./actions";
import { createManualAnswer } from "./manual-answer";
import {
  AnswerPickerModal,
  ConfirmAttendanceModal,
  inviteeHasAnswer,
} from "./InviteeListCard";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Prečica „Javila se zvanica?" sa Pregleda — cela radnja se odvija ovde, bez
 * skakanja u tab Gosti. Namerno NE dira „Listu zvanica": ona se otvara samo
 * kad par tamo ode sam.
 *
 * Nudi samo zvanice bez prave potvrde (plus dodavanje one koju su zaboravili
 * da upišu). Izmena već upisanog odgovora ostaje u Listi zvanica, gde stoje i
 * prave potvrde koje su za to potrebne — tako ovaj ekran ne mora da učitava
 * `rsvp_responses`.
 *
 * Zvanica označena kao „otkazao" tačkicom statusa nema red u potvrdama, pa
 * prolazi kroz filter — ali je picker prigušuje i spušta na dno, da ne stoji
 * među onima od kojih se odgovor tek čeka.
 */
export default function QuickAnswerModal({
  draft,
  onClose,
  onSaved,
}: {
  draft: boolean;
  onClose: () => void;
  /** Odgovor je upisan — Pregled može da osveži brojke. */
  onSaved: () => void;
}) {
  const [guestList, setGuestList] = useState<GuestList | null>(null);
  const [confirming, setConfirming] = useState<Invitee | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    loadGuestListAction().then((gl) => {
      if (!alive) return;
      if (gl) setGuestList(gl);
      else setGuestList({ sections: [], invitees: [] });
    });
    return () => {
      alive = false;
    };
  }, []);

  // Lista se čita sveža pri svakom otvaranju, pa se izmene čuvaju odmah —
  // ovde nema odloženog upisa kao u Listi zvanica.
  const persist = (next: GuestList) => {
    setGuestList(next);
    saveGuestListAction(next);
  };

  const handleCreate = (name: string) => {
    if (!guestList) return;
    // Bez celine i sa statusom „pozvan": ko se javio, očito je pozvan.
    // „Potvrdio"/„otkazao" postavlja tek sam odgovor.
    const invitee: Invitee = {
      id: uid("inv"),
      name,
      count: 1,
      sectionId: "",
      category: "",
      status: "invited",
    };
    persist({ ...guestList, invitees: [...guestList.invitees, invitee] });
    toast(`„${name}" dodat u zvanice — bez celine`);
    setConfirming(invitee);
  };

  const handleAnswer = async (
    name: string,
    count: number,
    attends: "Da" | "Ne",
  ) => {
    if (!confirming || !guestList || saving) return;
    if (draft) {
      toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
      return;
    }
    setSaving(true);
    const res = await createManualAnswer({
      invitee: confirming,
      name,
      count,
      attends,
    });
    setSaving(false);
    if (!res.ok) {
      toast(res.error);
      return;
    }
    persist({
      ...guestList,
      invitees: guestList.invitees.map((i) =>
        i.id === confirming.id ? { ...i, ...res.patch } : i,
      ),
    });
    toast(
      attends === "Da"
        ? "Potvrda kreirana i povezana sa zvanicom"
        : "Otkazivanje zabeleženo i povezano sa zvanicom",
    );
    setConfirming(null);
    onSaved();
    onClose();
  };

  if (!guestList) return null;

  if (confirming) {
    return (
      <ConfirmAttendanceModal
        invitee={confirming}
        // Ovde uvek stiže zvanica bez odgovora, pa dijalog prikazuje unos —
        // nikad svoj sažetak sa poništavanjem.
        linkedRsvp={null}
        onClose={() => setConfirming(null)}
        onConfirm={handleAnswer}
        onUndo={() => {}}
      />
    );
  }

  return (
    <AnswerPickerModal
      invitees={guestList.invitees.filter((i) => !inviteeHasAnswer(i))}
      onClose={onClose}
      onPick={(id) => {
        const inv = guestList.invitees.find((i) => i.id === id);
        if (inv) setConfirming(inv);
      }}
      onCreate={handleCreate}
    />
  );
}
