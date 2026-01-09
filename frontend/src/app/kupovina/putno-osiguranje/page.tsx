"use client";
import React, { useState } from "react";
import Stepper from "@/components/ui/Stepper";
import StepOne from "./components/step-1";
import { FormData } from "./types";
import { StepTwo } from "./components/step-2";

export default function CalculatorTravel() {
  const [activeStep, setActiveStep] = useState(0);

  // CENTRALNI STATE
  const [formData, setFormData] = useState<FormData>({
    whoTravels: "Individualno",
    purpose: "Turizam",
    selectedCountry: "",
    startDate: "",
    endDate: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    adults: 1,
    children: 0,
    seniors: 0,
    coverage: "30.000 €",
    termsAccepted: false,
  });

  // UNIVERZALNI UPDATE
  const updateForm = (
    key: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isTrajanjeValid = !!formData.startDate && !!formData.endDate;
  const isBirthValid =
    formData.birthDay.length === 2 && formData.birthYear.length === 4;
  const isCountersValid =
    formData.adults + formData.children + formData.seniors > 0;

  const canProceed =
    isTrajanjeValid &&
    !!formData.selectedCountry &&
    (formData.whoTravels === "Individualno" ? isBirthValid : isCountersValid) &&
    formData.termsAccepted;

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Vrati korisnika na vrh
    }
  };
  const handleNext = () => {
    if (canProceed) {
      setActiveStep(1); // Prebacuje steper na "Rezultati"
      window.scrollTo({ top: 0, behavior: "smooth" }); // Vrati korisnika na vrh

      // OVDE bi išao tvoj poziv ka API-ju da povučeš cene
      console.log("Dohvatam ponude...");
    } else {
      alert("Molimo vas popunite sva obavezna polja.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6 mt-20">
        <Stepper currentStep={activeStep} />

        {activeStep === 0 && (
          <StepOne formData={formData} updateForm={updateForm} />
        )}

        {activeStep === 1 && (
          <StepTwo
            formData={formData}
            updateForm={updateForm}
            onBack={() => setActiveStep(0)}
          />
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-base-200 shadow-sm">
          <button
            onClick={handleBack}
            className={`btn btn-ghost text-white normal-case ${
              activeStep === 0 ? "invisible" : "visible"
            }`}
          >
            ← Nazad
          </button>
          <button
            onClick={handleNext}
            className={`btn px-10 border-none hover:bg-primary-300 ${
              canProceed ? "bg-primary text-primary-content" : "btn-disabled"
            }`}
          >
            Uporedi online
          </button>
        </div>
      </div>
    </main>
  );
}

// POMOĆNE KOMPONENTE (Ostaju iste, samo vizuelno doterane)
