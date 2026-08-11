import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

/**
 * Small "Made with ♥" credit at the very bottom of a guest-facing invitation.
 *
 * Every invitation product renders this — wedding, children's birthday and
 * 18th-birthday — so a guest who likes the invitation can find us. Deliberately
 * quiet (logo at 60% opacity, 10px caption at 50%) so it never competes with the
 * couple's/honoree's own footer, and both halves link to the homepage.
 *
 * Kept theme-agnostic on purpose: it uses fixed brand styling rather than the
 * per-invitation CSS variables, so it reads the same across all themes.
 */
export function InvitationCredit({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href="/"
        className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
      >
        <Image
          src="/images/logo.png"
          alt="Halo Uspomene"
          width={3519}
          height={1301}
          className="h-6 mb-1 w-auto"
        />
      </Link>

      <Link
        href="/"
        className="w-full flex font-serif text-center gap-1 mb-3 justify-center items-center text-[10px] sm:text-xs mt-0 sm:mt-2 opacity-50"
      >
        Made with <Heart size={10} className="text-[#AE343F]" /> | Halo Uspomene
      </Link>
    </div>
  );
}
