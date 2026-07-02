"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import QuickRegisterModal from "./QuickRegisterModal";

export default function QuickRegisterCta() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#AE343F] hover:bg-[#8A2A32] border border-[#AE343F] hover:shadow-lg rounded-xl p-4 sm:p-5 flex flex-col items-center text-center gap-2 transition-all w-full"
        data-track="cta_click"
        data-track-cta-name="moje_vencanje_modal"
        data-track-cta-location="vendori_grid"
      >
        <div className="text-[#F5F4DC]">
          <LogIn size={26} />
        </div>
        <p className="text-sm font-semibold text-[#F5F4DC] mt-1">
          Moje Venčanje
        </p>
        <p className="text-xs text-[#F5F4DC]/75">Besplatna registracija</p>
      </button>
      <QuickRegisterModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
