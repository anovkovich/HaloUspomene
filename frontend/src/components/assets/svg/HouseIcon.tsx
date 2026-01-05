const HouseIconProfessional = ({ className = "w-16 h-16", ...props }) => (
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
      {/* Glavna struktura kuće (Zidovi) */}
      <path d="M10,20 L10,38 C10,39.1 10.9,40 12,40 L52,40 C53.1,40 54,39.1 54,38 L54,20" />
      {/* Krov */}
      <path d="M6,20 L32,2 L58,20" />
      {/* Odžak (Blueprint detalj) */}
      <path d="M44,10 L44,5 L50,5 L50,14" />
      {/* Ulazna vrata */}
      <path d="M28,40 L28,26 C28,24.9 28.9,24 30,24 L38,24 C39.1,24 40,24.9 40,26 L40,40" />
      {/* Kvaka (Mali detalj) */}
      <circle cx="37" cy="32" r="1" fill="currentColor" />
      {/* Prozor */}
      <path d="M16,24 C16,24.6 16.4,25 17,25 L23,25 C23.6,25 24,24.6 24,24 L24,20 C24,19.4 23.6,19 23,19 L17,19 C16.4,19 16,19.4 16,20 L16,24 Z" />
      <path d="M20,19 V25" /> {/* Srednji stub prozora */}
    </g>
  </svg>
);

export default HouseIconProfessional;
