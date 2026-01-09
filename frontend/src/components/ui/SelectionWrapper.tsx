export const SectionWrapper = ({
  title,
  children,
  isCompleted,
}: {
  title: string;
  children: React.ReactNode;
  isCompleted?: boolean;
}) => (
  <div className="bg-white p-8 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-[#001c4c]">{title}</h2>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
          isCompleted
            ? "bg-success border-success text-white"
            : "border-base-200 text-base-200"
        }`}
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
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
    {children}
  </div>
);
