interface ModernDateInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string; // Opcioni min datum
}

export const ModernDateInput = ({
  label,
  value,
  onChange,
  min,
}: ModernDateInputProps) => {
  return (
    <div className="form-control w-full">
      <label className="label mb-1">
        <span className="label-text flex items-center gap-2 text-[#001c4c]">
          {label}
        </span>
      </label>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-20">
          <svg
            className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <input
          type="date"
          value={value}
          onChange={onChange}
          min={min} // Onemogućava izbor datuma pre ovog u kalendaru
          className="input input-bordered w-full pl-11 hide-calendar-picker bg-white focus:border-primary relative z-10"
          required
        />
      </div>
    </div>
  );
};
