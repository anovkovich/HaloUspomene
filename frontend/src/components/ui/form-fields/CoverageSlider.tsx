interface CoverageSliderProps {
  value: string;
  onChange: (val: string) => void;
}

export const CoverageSlider = ({ value, onChange }: CoverageSliderProps) => {
  const options = ["12.000 €", "30.000 €", "40.000 €"];

  // Nalazimo trenutni indeks na osnovu prosleđene vrednosti
  const currentIndex = options.indexOf(value);

  return (
    <div className="w-full py-1">
      <div className="flex flex-col items-center mb-4">
        {/* Prikaz trenutne vrednosti - Bold i u primarnoj boji */}
        <span className="text-3xl font-black text-primary transition-all duration-300">
          {value}
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
          Suma osiguranja
        </span>
      </div>

      <div className="relative w-full px-1">
        <input
          type="range"
          min="0"
          max="2"
          value={currentIndex}
          step="1"
          className="range range-primary range-md w-full [--range-fill:0]"
          onChange={(e) => onChange(options[parseInt(e.target.value)])}
        />

        {/* Markeri ispod slidera */}
        <div className="w-full flex justify-between px-0.5 mt-1">
          {options.map((opt, i) => (
            <div
              key={opt}
              className="flex flex-col items-center first:items-start last:items-end"
            >
              <span className="text-gray-300 px-2">|</span>
              <span
                className={`text-[10px] font-bold mt-1 transition-colors ${
                  i === currentIndex ? "text-primary" : "text-gray-400"
                }`}
              >
                {opt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
