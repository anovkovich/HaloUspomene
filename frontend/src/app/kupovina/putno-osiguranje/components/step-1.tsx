import {
  SelectionCard,
  ModernDateInput,
  BirthDateInput,
  CountrySearchCard,
  PassengerCounter,
  CoverageSlider,
  Question,
} from "@/components/ui/form-fields";
import { SectionWrapper } from "@/components/ui/SelectionWrapper";
import { FormData } from "../types";

interface StepOneProps {
  formData: FormData;
  updateForm: (key: keyof FormData, value: string | number | boolean) => void;
}

export default function Step1({ formData, updateForm }: StepOneProps) {
  const today = new Date().toISOString().split("T")[0];

  // PUTNICI SEKCIJA: Provera da li je sekcija o putnicima popunjena
  const isBirthInfoValid =
    formData.birthDay.length === 2 &&
    formData.birthMonth.length === 2 &&
    formData.birthYear.length === 4;

  const isCountersValid =
    formData.adults + formData.children + formData.seniors > 0;

  // Dinamički uslov za checkmark
  const isPassengerSectionCompleted =
    formData.whoTravels === "Individualno" ? isBirthInfoValid : isCountersValid;

  return (
    <>
      {/* NASLOV SEKCIJE */}
      <div className="text-center md:text-left mb-10">
        <h1 className="text-3xl font-bold text-[#001c4c]">
          Kalkulator putnog osiguranja
        </h1>
        <p className="text-gray-500">
          Uporedite cene putnog osiguranja online.
        </p>
      </div>

      {/* 1. OPSTE INFO */}
      <SectionWrapper title="Vaše putovanje" isCompleted={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <Question label="Putujete?" />
            {["Individualno", "Porodično", "Grupno"].map((opt) => (
              <SelectionCard
                key={opt}
                label={opt}
                selected={formData.whoTravels === opt}
                onClick={() => updateForm("whoTravels", opt)}
              />
            ))}
          </div>
          <div>
            <Question label="Svrha putovanja?" />
            {["Turizam", "Biznis", "Sport / Skijanje"].map((opt) => (
              <SelectionCard
                key={opt}
                label={opt}
                selected={formData.purpose === opt}
                onClick={() => updateForm("purpose", opt)}
              />
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 2. DESTINACIJA */}
      <SectionWrapper
        title="Destinacija"
        isCompleted={!!formData.selectedCountry}
      >
        <Question label="Gde putujete? Izaberite zemlju." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
          {["Grčka", "Crna Gora", "Hrvatska"].map((opt) => (
            <SelectionCard
              key={opt}
              label={opt}
              selected={formData.selectedCountry === opt}
              onClick={() => updateForm("selectedCountry", opt)}
            />
          ))}

          {/* Četvrto polje je naša pretraga koja izgleda kao kartica */}
          <CountrySearchCard />
        </div>
      </SectionWrapper>

      {/* 3. TRAJANJE */}
      <SectionWrapper
        title="Trajanje"
        isCompleted={!!formData.startDate && !!formData.endDate}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernDateInput
            label="Početak"
            value={formData.startDate}
            min={today}
            onChange={(e) => updateForm("startDate", e.target.value)}
          />
          <ModernDateInput
            label="Kraj"
            value={formData.endDate}
            min={formData.startDate || today}
            onChange={(e) => updateForm("endDate", e.target.value)}
          />
        </div>
      </SectionWrapper>

      {/* POKRICE */}
      <SectionWrapper title="Pokriće" isCompleted={true}>
        <div className="flex flex-col">
          {/* Leva strana: Pitanje */}
          <div className="md:col-span-1">
            <Question label="Koliko pokriće želite?" />
            {/* <p className="text-xs text-gray-400 leading-relaxed">
                Ovaj iznos predstavlja maksimalnu sumu koju osiguranje isplaćuje
                u slučaju nezgode ili bolesti.
              </p> */}
          </div>

          {/* Desna strana: Slider (zauzima više mesta) */}
          <div className="md:col-span-2 bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
            <CoverageSlider
              value={formData.coverage}
              onChange={(val) => updateForm("coverage", val)}
            />{" "}
          </div>
        </div>
      </SectionWrapper>

      {/* 4. INFORMACIJE O PUTNICIMA */}
      <SectionWrapper
        title="Informacije o putnicima"
        isCompleted={isPassengerSectionCompleted}
      >
        {formData.whoTravels === "Individualno" ? (
          /* OPCIJA 1: Prikazujemo datum rođenja ako je Individualno */
          <div className="max-w-md animate-in fade-in duration-300">
            <BirthDateInput
              day={formData.birthDay}
              month={formData.birthMonth}
              year={formData.birthYear}
              onDayChange={(val) => updateForm("birthDay", val)}
              onMonthChange={(val) => updateForm("birthMonth", val)}
              onYearChange={(val) => updateForm("birthYear", val)}
            />
          </div>
        ) : (
          /* OPCIJA 2: Prikazujemo brojače ako je Porodično ili Grupno */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-in slide-in-from-left-4 duration-500">
            <PassengerCounter
              label="Odrasli"
              subLabel="18-70 god."
              count={formData.adults}
              onIncrement={() => updateForm("adults", formData.adults + 1)}
              onDecrement={() => updateForm("adults", formData.adults - 1)}
              min={formData.whoTravels === "Porodično" ? 1 : 0}
            />
            <PassengerCounter
              label="Deca"
              subLabel="do 17 god."
              count={formData.children}
              onIncrement={() => updateForm("children", formData.children + 1)}
              onDecrement={() => updateForm("children", formData.children - 1)}
            />
            <PassengerCounter
              label="Stariji"
              subLabel="71+ god."
              count={formData.seniors}
              onIncrement={() => updateForm("seniors", formData.seniors + 1)}
              onDecrement={() => updateForm("seniors", formData.seniors - 1)}
            />
          </div>
        )}
      </SectionWrapper>

      {/* 5. NAPOMENA & USLOVI */}
      <div className="p-6 bg-white rounded-2xl border border-base-200 shadow-sm">
        <h3 className="font-bold mb-2">Napomena</h3>
        <p className="text-sm text-gray-500 mb-4">
          Polisa je važeća samo ako ste državljanin Srbije i kupujete pre
          početka putovanja.
        </p>
        <div className="flex items-center  gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={formData.termsAccepted}
            onChange={(e) => updateForm("termsAccepted", e.target.checked)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 leading-tight"
          >
            <span className="font-bold">Uslovi korišćenja:</span> Ovim
            izjavljujem da sam u potpunosti pročitao i razumeo{" "}
            <a href="#" className="link link-primary">
              opšte uslove
            </a>{" "}
            korišćenja i pravila privatnosti.
          </label>
        </div>
      </div>
    </>
  );
}
