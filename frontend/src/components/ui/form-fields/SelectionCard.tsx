interface SelectionCardProps {
  label: string;
  name?: string;
  selected?: boolean;
  onClick: () => void;
}

export const SelectionCard = ({
  label,
  selected,
  onClick,
}: SelectionCardProps) => (
  <div
    onClick={onClick}
    className={`
      flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all mb-2 h-[60px]
      ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-base-200 bg-white hover:border-gray-300"
      }
    `}
  >
    <input
      type="radio"
      checked={selected}
      readOnly
      className="radio radio-primary radio-sm mr-4"
    />
    <span
      className={`font-semibold ${selected ? "text-primary" : "text-gray-600"}`}
    >
      {label}
    </span>
  </div>
);
