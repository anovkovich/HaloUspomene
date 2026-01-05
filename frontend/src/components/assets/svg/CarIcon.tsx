const CarIconProfessional = ({ className = "w-16 h-16", ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor" // Ovo omogućava DaisyUI bojama da rade
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <g transform="translate(1, 1)">
      {/* Glavna školjka automobila */}
      <path d="M55,25 L60,25 C61.1,25 62,24.1 62,23 L60,13 C60,11.9 53,11 53,11 C53,11 46.1,0 45,0 L23,0 C21,0 13,11 13,11 C13,11 2.1,13.1 1,18 L0,23 C0,24.1 0.9,25 2,25 L8,25" />

      {/* Donja linija između točkova */}
      <path d="M20.1,25 L42.9,25" />

      {/* Detalji / Svetla */}
      <path d="M28,14 L31,14" />
      <path d="M46,14 L49,14" />
      <path d="M1,21 L8.2,21" />
      <path d="M54.6,21 L61.4,21" />

      {/* Prednji prozor */}
      <path d="M31,10 C31,10.6 30.6,11 30,11 L19,11 C18.4,11 18,10.6 18,10 C18,10 23.4,3 24,3 L30,3 C30.6,3 31,3.4 31,4 L31,10 Z" />

      {/* Zadnji prozor */}
      <path d="M35,10 C35,10.6 35.4,11 36,11 L47,11 C47.6,11 48,10.6 48,10 C48,10 43.6,3 43,3 L36,3 C35.4,3 35,3.4 35,4 L35,10 Z" />

      {/* Točkovi */}
      <circle cx="49" cy="24" r="6" />
      <circle cx="14" cy="24" r="6" />
    </g>
  </svg>
);

export default CarIconProfessional;
