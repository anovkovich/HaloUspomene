export const CountrySearchCard = () => (
  <div className="flex items-center p-4 border-2 border-base-200 bg-white rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all h-[60px]">
    <div className="mr-4 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <input
      type="text"
      placeholder="Ili potražite drugu zemlju"
      className="w-full bg-transparent outline-none text-sm font-semibold text-gray-600 placeholder:text-gray-400"
    />
  </div>
);
