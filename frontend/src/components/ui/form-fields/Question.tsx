export const Question = ({ label }: { label: string }) => (
  <p className="text-gray-700 mb-2 flex items-center gap-2">
    {label}
    <span className="text-gray-300 text-[10px] bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center cursor-help">
      ?
    </span>
  </p>
);
