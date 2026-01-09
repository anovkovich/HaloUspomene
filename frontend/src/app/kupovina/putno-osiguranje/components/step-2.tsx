// components/steps/StepTwo.tsx
"use client";
import React, { useState, useEffect } from "react";
import { FormData } from "../types";
import { ModernDateInput } from "@/components/ui/form-fields";

interface StepTwoProps {
  formData: FormData;
  updateForm: (key: keyof FormData, value: string | number | boolean) => void;
  onBack: () => void;
}

export const StepTwo = ({ formData, updateForm, onBack }: StepTwoProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Inicijalizujemo pretragu...");
  const [isDone, setIsDone] = useState(false);

  // LOGIKA ZA HAKOVANJE PERCEPCIJE (10 sekundi)
  useEffect(() => {
    const duration = 10000; // 10 sekundi
    const interval = 100; // Osvežavanje na 100ms
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((old) => {
        const next = old + step;
        if (next >= 100) {
          clearInterval(timer);
          setIsDone(true);
          return 100;
        }
        return next;
      });
    }, interval);

    // Menjanje teksta tokom učitavanja
    const textTimer = setInterval(() => {
      const texts = [
        "Proveravamo dostupne polise...",
        "Analiziramo cene osiguravajućih kuća...",
        "Primenjujemo aktuelne popuste...",
        "Pripremamo prikaz ponude za vas...",
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. CLEAN SUMMARY CARD */}
      <div className="bg-white p-6 pb-3 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
        {/* Naslov sa žutom tačkicom kao na slici */}
        <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3">
          <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
          Podaci o putovanju
        </div>

        {/* Glavni kontejner sa podacima */}
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 relative group mb-2">
          {/* Prvi red: Osnovne informacije */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-b border-slate-200/60 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Vrsta putovanja
              </span>
              <span className="text-[#001c4c] font-bold">
                {formData.whoTravels}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Svrha
              </span>
              <span className="text-[#001c4c] font-bold">
                {formData.purpose}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Zemlja
              </span>
              <span className="text-[#001c4c] font-bold">
                {formData.selectedCountry}
              </span>
            </div>
          </div>

          {/* Drugi red: Datum i Suma + Izmeni link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Početak osiguranja
              </span>
              <div className="flex items-center gap-2 text-[#001c4c] font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                {formData.startDate.split("-").reverse().join(".")}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Kraj osiguranja
              </span>
              <div className="flex items-center gap-2 text-[#001c4c] font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                {formData.endDate.split("-").reverse().join(".")}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                Osigurana suma
              </span>
              <span className="bg-primary text-[#001c4c] w-fit px-3 py-0.5 rounded-full text-sm font-black shadow-sm">
                {formData.coverage}
              </span>
            </div>
          </div>
        </div>

        {/* Dugme za povratak nazad */}
        <button
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors group/btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Izmeni podatke
        </button>
      </div>

      {/* 2. PROGRESS BAR (The "Hack") */}
      {!isDone && (
        <div className="text-center py-10 space-y-4">
          <div className="relative pt-1 max-w-md mx-auto">
            <progress
              className="progress progress-primary w-full h-4"
              value={progress}
              max="100"
            ></progress>
            <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">
              {loadingText} {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {/* 3. SKELETONS OR RESULTS */}
      <div className="space-y-4">
        {!isDone ? (
          // SKELETON LOADER
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-base-100 flex items-center justify-between animate-shimmer opacity-60"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-6 w-20 bg-gray-200 rounded ml-auto"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          // REAL RESULTS (Ovo ćemo popuniti u sledećem koraku)
          <div className="animate-in zoom-in-95 duration-500">
            <div className="alert alert-success bg-success/10 border-success/20 text-success font-bold rounded-2xl">
              <span>
                Pronašli smo 3 ponude koje najbolje odgovaraju vašim
                kriterijumima!
              </span>
            </div>
            {/* Ovde će ići prave kartice sa ponudama */}
          </div>
        )}
      </div>
    </div>
  );
};
