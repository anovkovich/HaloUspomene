import React from "react";

/**
 * Autorske SVG ilustracije za mrežu proizvoda na početnoj.
 *
 * Sve boje idu preko `currentColor` — kartica sama zadaje boju (brend crvena),
 * a sekundarne površine su isti ton sa smanjenim opacitetom. Bez spoljnih
 * zavisnosti, bez slika, bez fontova; viewBox 48×48, veličinu diktira roditelj
 * kroz `className`.
 */

type IllustrationProps = { className?: string };

/** Zajednički atributi za koren svake ilustracije. */
const svgProps = (className?: string) =>
  ({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
  }) as const;

/** Pozivnica: kartica sa srcem koja viri iz otvorene koverte. */
export const PozivnicaIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <rect
      x={14}
      y={6}
      width={20}
      height={14.5}
      rx={2}
      fill="currentColor"
      fillOpacity={0.14}
    />
    <path
      d="M24 16.2c-2.3-1.8-3.7-3.1-3.7-4.8 0-1.3.9-2.2 2.1-2.2.7 0 1.3.4 1.6 1 .3-.6.9-1 1.6-1 1.2 0 2.1.9 2.1 2.2 0 1.7-1.4 3-3.7 4.8z"
      fill="currentColor"
      stroke="none"
    />
    <rect x={6} y={20} width={36} height={20} rx={3} />
    <path d="M6 22.5 24 34l18-11.5" />
  </svg>
);

/** Premium: otvorena koverta sa voštanim pečatom i sjajem — otmenost. */
export const PremiumIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <path d="M8 21 24 7l16 14z" fill="currentColor" fillOpacity={0.12} />
    <rect x={8} y={21} width={32} height={19} rx={2.5} />
    <path d="M8 23.5 24 33l16-9.5" />
    <circle
      cx={24}
      cy={30.5}
      r={4.2}
      fill="currentColor"
      fillOpacity={0.85}
      stroke="none"
    />
    <path
      d="m37 3 1.1 2.9L41 7l-2.9 1.1L37 11l-1.1-2.9L33 7l2.9-1.1z"
      fill="currentColor"
      stroke="none"
    />
    <path
      d="m10.5 4 .8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9L7.8 6.7l1.9-.8z"
      fill="currentColor"
      fillOpacity={0.6}
      stroke="none"
    />
  </svg>
);

/** Raspored sedenja: okrugli stolovi u sali sa stolicama oko njih. */
export const RasporedIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <circle cx={17} cy={29} r={7} fill="currentColor" fillOpacity={0.15} />
    {/* Stolice oko velikog stola */}
    <g fill="currentColor" stroke="none">
      <circle cx={17} cy={19.2} r={1.6} />
      <circle cx={25.5} cy={24.1} r={1.6} />
      <circle cx={25.5} cy={33.9} r={1.6} />
      <circle cx={17} cy={38.8} r={1.6} />
      <circle cx={8.5} cy={33.9} r={1.6} />
      <circle cx={8.5} cy={24.1} r={1.6} />
    </g>
    <circle cx={36} cy={13} r={5} />
    <g fill="currentColor" stroke="none">
      <circle cx={36} cy={5.7} r={1.4} />
      <circle cx={42.3} cy={16.7} r={1.4} />
      <circle cx={29.7} cy={16.7} r={1.4} />
    </g>
    <circle cx={36} cy={33} r={5} />
    <g fill="currentColor" stroke="none">
      <circle cx={36} cy={40.3} r={1.4} />
      <circle cx={42.3} cy={29.3} r={1.4} />
      <circle cx={29.7} cy={29.3} r={1.4} />
    </g>
  </svg>
);

/** QR pano: štafelaj na ulazu u salu sa tablom i QR kodom. */
export const QrPanoIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <rect
      x={13}
      y={8.5}
      width={22}
      height={22}
      rx={2}
      fill="currentColor"
      fillOpacity={0.08}
    />
    {/* Tri ugaona kvadrata QR koda */}
    <rect x={16.5} y={12} width={5.5} height={5.5} rx={1} />
    <rect x={26} y={12} width={5.5} height={5.5} rx={1} />
    <rect x={16.5} y={21.5} width={5.5} height={5.5} rx={1} />
    <g fill="currentColor" stroke="none">
      <rect x={18.2} y={13.7} width={2.1} height={2.1} rx={0.5} />
      <rect x={27.7} y={13.7} width={2.1} height={2.1} rx={0.5} />
      <rect x={18.2} y={23.2} width={2.1} height={2.1} rx={0.5} />
      <rect x={26} y={21.7} width={2.1} height={2.1} rx={0.5} />
      <rect x={29.4} y={24.4} width={2.1} height={2.1} rx={0.5} />
      <rect x={26} y={26.2} width={2.1} height={2.1} rx={0.5} />
    </g>
    {/* Noge štafelaja */}
    <path d="M16.5 30.5 11.5 42M31.5 30.5 36.5 42M24 30.5V42" />
  </svg>
);

/** QR galerija: dve fotografije jedna preko druge i mali QR kod u uglu. */
export const QrGalerijaIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <rect
      x={7}
      y={9}
      width={20}
      height={16}
      rx={2}
      transform="rotate(-8 17 17)"
      fill="currentColor"
      fillOpacity={0.12}
    />
    <rect x={13} y={15} width={20} height={16} rx={2} />
    <circle cx={19} cy={20.5} r={1.6} fill="currentColor" stroke="none" />
    <path d="m15.5 28.5 4.3-4.8 3.4 3.3 2.8-2.8 3 3.3" />
    <rect x={30.5} y={27} width={11} height={11} rx={2} />
    <g fill="currentColor" stroke="none">
      <rect x={33} y={29.5} width={2.4} height={2.4} rx={0.5} />
      <rect x={36.8} y={29.5} width={2.4} height={2.4} rx={0.5} />
      <rect x={33} y={33.3} width={2.4} height={2.4} rx={0.5} />
      <circle cx={38} cy={34.5} r={1.1} />
    </g>
  </svg>
);

/** Audio knjiga: retro telefon sa brojčanikom i slušalicom. */
export const AudioIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    {/* Slušalica */}
    <path d="M11 16.5v-2A4.5 4.5 0 0 1 15.5 10h17a4.5 4.5 0 0 1 4.5 4.5v2" />
    {/* Telo telefona */}
    <path d="M15.5 21h17l3.1 14.2a3 3 0 0 1-2.9 3.8H15.3a3 3 0 0 1-2.9-3.8L15.5 21z" />
    {/* Brojčanik */}
    <circle cx={24} cy={30} r={5} fill="currentColor" fillOpacity={0.15} />
    <g fill="currentColor" stroke="none">
      <circle cx={24} cy={30} r={1.4} />
      <circle cx={24} cy={26.8} r={0.8} />
      <circle cx={26.8} cy={28.4} r={0.8} />
      <circle cx={21.2} cy={31.6} r={0.8} />
    </g>
  </svg>
);

/** Planer: telefon sa checklistom i kružićem sa štikliranom stavkom. */
export const PlanerIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <rect x={13.5} y={5.5} width={21} height={37} rx={4.5} />
    <path d="M21.5 10h5" />
    {/* Stavke checkliste */}
    <g fill="currentColor" stroke="none">
      <circle cx={19} cy={16.5} r={1.5} />
      <circle cx={19} cy={22.5} r={1.5} />
    </g>
    <path d="M23 16.5h8M23 22.5h8" />
    <circle cx={19} cy={28.5} r={1.5} />
    <path d="M23 28.5h6" />
    {/* Značka sa štiklom */}
    <circle
      cx={33.5}
      cy={35}
      r={6.5}
      fill="currentColor"
      fillOpacity={0.15}
    />
    <path d="m30.8 35 2 2.1 3.9-4.4" />
  </svg>
);

/** Vendori: izlog radnje sa tendom i zasvedenim vratima. */
export const VendoriIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <path d="M9 12.5V9.5A1.5 1.5 0 0 1 10.5 8h27A1.5 1.5 0 0 1 39 9.5v3" />
    {/* Tenda sa lučnim resama */}
    <path
      d="M9 12.5h30v3a3.75 3.75 0 0 1-7.5 0 3.75 3.75 0 0 1-7.5 0 3.75 3.75 0 0 1-7.5 0 3.75 3.75 0 0 1-7.5 0z"
      fill="currentColor"
      fillOpacity={0.18}
    />
    <path d="M11.5 20V38a2 2 0 0 0 2 2h21a2 2 0 0 0 2-2V20" />
    <path d="M20 40v-6.5a4 4 0 0 1 8 0V40" />
  </svg>
);

/** Oldtajmer: retro automobil sa velikim točkovima i kabinom. */
export const OldtajmeriIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <path d="M9 33H6v-3.5A3.5 3.5 0 0 1 9.5 26h3l4.8-6.8a3 3 0 0 1 2.5-1.2h8.4a3 3 0 0 1 2.4 1.2L35.5 26h3a4.5 4.5 0 0 1 4.5 4.5V33h-3" />
    <path d="M18.5 33h12" />
    <path
      d="M14.5 26l4.5-6.4a1.5 1.5 0 0 1 1.2-.6h7.6a1.5 1.5 0 0 1 1.2.6L33.5 26z"
      fill="currentColor"
      fillOpacity={0.15}
      stroke="none"
    />
    <path d="M24 19.5V26" />
    <circle cx={13.5} cy={33.5} r={4.2} />
    <circle cx={35} cy={33.5} r={4.2} />
    <g fill="currentColor" stroke="none">
      <circle cx={13.5} cy={33.5} r={1.5} />
      <circle cx={35} cy={33.5} r={1.5} />
      <circle cx={40.5} cy={29} r={1.2} />
    </g>
  </svg>
);

/** Limuzina: niža i izduženija silueta luksuznog automobila. */
export const AutomobiliIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <path d="M8.5 32H5v-2.5a3 3 0 0 1 3-3h5.5l5.6-4.8a4 4 0 0 1 2.6-1H30c1.3 0 2.5.6 3.3 1.6l3.4 4.2H40a3.5 3.5 0 0 1 3.5 3.5V32H41" />
    <path d="M16.5 32H32.5" />
    <path
      d="M15 26.5l4.8-4.1a2 2 0 0 1 1.3-.5H30c.7 0 1.4.3 1.9.9l3 3.7z"
      fill="currentColor"
      fillOpacity={0.15}
      stroke="none"
    />
    <path d="M24.5 21.9v4.6" />
    <circle cx={12.5} cy={32.5} r={3.8} />
    <circle cx={36.5} cy={32.5} r={3.8} />
    <g fill="currentColor" stroke="none">
      <circle cx={12.5} cy={32.5} r={1.3} />
      <circle cx={36.5} cy={32.5} r={1.3} />
      <circle cx={41.5} cy={28.5} r={1.1} />
    </g>
  </svg>
);

/** Oprema: paviljon sa resastom nadstrešnicom i barskim stolom ispod. */
export const OpremaIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <path
      d="M24 6C15 6 9 11 6.5 17.5h35C39 11 33 6 24 6z"
      fill="currentColor"
      fillOpacity={0.14}
    />
    <path d="M6.5 17.5a4.4 4.4 0 0 0 8.75 0 4.4 4.4 0 0 0 8.75 0 4.4 4.4 0 0 0 8.75 0 4.4 4.4 0 0 0 8.75 0" />
    <path d="M24 6V3.5" />
    {/* Stubovi */}
    <path d="M8 20.5V40M40 20.5V40" />
    {/* Barski sto */}
    <ellipse cx={24} cy={27} rx={5.5} ry={1.7} />
    <path d="M24 28.7V38M20 40h8" />
  </svg>
);

/** Matičar: burme iznad otvorene knjige na svečanom stalku. */
export const MaticarIllustration: React.FC<IllustrationProps> = ({
  className,
}) => (
  <svg {...svgProps(className)}>
    <circle cx={20.5} cy={11} r={4.2} fill="currentColor" fillOpacity={0.12} />
    <circle cx={27.5} cy={11} r={4.2} />
    {/* Otvorena knjiga */}
    <path d="M24 21c-2.8-2.2-6.6-3.2-10.5-2.8v13.6c3.9-.4 7.7.6 10.5 2.8 2.8-2.2 6.6-3.2 10.5-2.8V18.2c-3.9-.4-7.7.6-10.5 2.8z" />
    <path
      d="M24 21c-2.8-2.2-6.6-3.2-10.5-2.8v13.6c3.9-.4 7.7.6 10.5 2.8z"
      fill="currentColor"
      fillOpacity={0.12}
      stroke="none"
    />
    <path d="M24 21v13.6" />
    {/* Stalak */}
    <path d="M24 35.5V41M17.5 41.5h13" />
  </svg>
);

/** Mapa ilustracija po `id` proizvoda iz `src/data/products.ts`. */
export const PRODUCT_ILLUSTRATIONS: Record<
  string,
  React.FC<{ className?: string }>
> = {
  pozivnica: PozivnicaIllustration,
  premium: PremiumIllustration,
  raspored: RasporedIllustration,
  "qr-pano": QrPanoIllustration,
  "qr-galerija": QrGalerijaIllustration,
  audio: AudioIllustration,
  planer: PlanerIllustration,
  vendori: VendoriIllustration,
  oldtajmeri: OldtajmeriIllustration,
  automobili: AutomobiliIllustration,
  oprema: OpremaIllustration,
  maticar: MaticarIllustration,
};
