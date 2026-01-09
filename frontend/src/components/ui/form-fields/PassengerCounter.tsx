interface CounterProps {
  label: string;
  subLabel: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
}

export const PassengerCounter = ({
  label,
  subLabel,
  count,
  onIncrement,
  onDecrement,
  min = 0,
}: CounterProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-col">
      <span className="font-bold text-[#001c4c]">{label}</span>
      <span className="text-xs text-gray-400">({subLabel})</span>
    </div>

    <div className="join border border-base-200 bg-white rounded-lg w-fit">
      <button
        onClick={onDecrement}
        disabled={count <= min}
        className="btn btn-ghost join-item btn-sm px-3 hover:bg-gray-50 disabled:bg-transparent disabled:text-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="join-item flex items-center justify-center w-12 text-sm font-bold border-x border-base-200">
        {count}
      </div>

      <button
        onClick={onIncrement}
        className="btn btn-ghost join-item btn-sm px-3 hover:bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
);
