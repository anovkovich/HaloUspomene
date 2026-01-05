const SuitcaseIconProfessional = ({ className = "w-16 h-16", ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <g transform="translate(1, 1)">
      {/* Glavno telo kofera */}
      <path d="M16,8 L48,8 C49.1,8 50,8.9 50,10 L50,32 C50,33.1 49.1,34 48,34 L16,34 C14.9,34 14,33.1 14,32 L14,10 C14,8.9 14.9,8 16,8 Z" />

      {/* Ručka na vrhu */}
      <path d="M26,8 L26,4 C26,2.9 26.9,2 28,2 L36,2 C37.1,2 38,2.9 38,4 L38,8" />

      {/* Kaiševi / Detalji na koferu (Blueprint stil) */}
      <path d="M22,8 L22,34" />
      <path d="M42,8 L42,34" />

      {/* Horizontalne linije za teksturu */}
      <path d="M22,16 L42,16" />
      <path d="M22,26 L42,26" />

      {/* Točkići */}
      <circle cx="19" cy="38" r="3" />
      <circle cx="45" cy="38" r="3" />
    </g>
  </svg>
);

export default SuitcaseIconProfessional;
