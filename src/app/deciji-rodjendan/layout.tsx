import {
  Fredoka,
  Bubblegum_Sans,
  Baloo_2,
  Patrick_Hand,
  Chewy,
} from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fredoka",
  display: "swap",
});

const bubblegumSans = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bubblegum-sans",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo-2",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-patrick-hand",
  display: "swap",
});

const chewy = Chewy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chewy",
  display: "swap",
});

export default function BirthdayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fredoka.variable} ${bubblegumSans.variable} ${baloo2.variable} ${patrickHand.variable} ${chewy.variable}`}
    >
      {children}
    </div>
  );
}
