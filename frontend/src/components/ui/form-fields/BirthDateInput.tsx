import { RefObject, useRef } from "react";

interface BirthDateInputProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
}

export const BirthDateInput = ({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
}: BirthDateInputProps) => {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();

  // Univerzalna funkcija za promenu unosa
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    nextRef: RefObject<HTMLInputElement | null>,
    maxLength: number,
    maxValue: number,
    updateFn: (val: string) => void
  ) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value !== "" && parseInt(value) > maxValue) {
      value = maxValue.toString();
    }

    // Ažuriramo stanje u roditeljskoj komponenti
    updateFn(value);

    // Auto-tabbing
    if (value.length >= maxLength && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length === 4) {
      const numValue = parseInt(value);
      if (numValue > currentYear) value = currentYear.toString();
    }
    onYearChange(value);
  };

  const validateYear = () => {
    const numValue = parseInt(year);
    if (isNaN(numValue)) return;
    if (numValue < 1925) onYearChange("1925");
    if (numValue > currentYear) onYearChange(currentYear.toString());
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef: RefObject<HTMLInputElement | null>
  ) => {
    if (
      e.key === "Backspace" &&
      e.currentTarget.value === "" &&
      prevRef.current
    ) {
      prevRef.current.focus();
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label mb-1">
        <span className="label-text flex items-center gap-2 text-[#001c4c]">
          Koji je datum vašeg rođenja?
          <span className="text-gray-300 text-[10px] bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center cursor-help">
            ?
          </span>
        </span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        <input
          ref={dayRef}
          type="text"
          placeholder="DD"
          maxLength={2}
          value={day}
          onChange={(e) => handleInputChange(e, monthRef, 2, 31, onDayChange)}
          className="input input-bordered text-center focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <input
          ref={monthRef}
          type="text"
          placeholder="MM"
          maxLength={2}
          value={month}
          onChange={(e) => handleInputChange(e, yearRef, 2, 12, onMonthChange)}
          onKeyDown={(e) => handleKeyDown(e, dayRef)}
          className="input input-bordered text-center focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <input
          ref={yearRef}
          type="text"
          placeholder="GGGG"
          maxLength={4}
          value={year}
          onChange={handleYearChange}
          onBlur={validateYear}
          onKeyDown={(e) => handleKeyDown(e, monthRef)}
          className="input input-bordered text-center focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};
