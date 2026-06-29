import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import FormPageWrapper, {
  type UpgradeInitialFormData,
  type BypassInfo,
} from "./FormPageWrapper";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import { getWeddingData } from "@/lib/couples";
import {
  verifyBypassToken,
  COUNTRY_CONFIGS,
} from "@/lib/bypass-token";

export const metadata: Metadata = {
  title: "Napravi Website Pozivnicu za Venčanje | Personalizovana Online Pozivnica",
  description:
    "Napravite svoju website pozivnicu za venčanje za 24h. Popunite kratki upitnik — mi biramo temu, font i dizajn. RSVP forma, odbrojavanje i program dana su uključeni.",
  keywords: [
    "website venčana pozivnica",
    "napravi pozivnicu online",
    "online venčana pozivnica",
    "personalizovana pozivnica za venčanje",
    "website pozivnica za svadbu",
    "venčana pozivnica sa RSVP",
    "pozivnica za venčanje srbija",
    "elektronska pozivnica venčanje",
    "custom wedding invitation",
    "vencanje pozivnica online",
    "pozivnica za svadbu",
    "pozivnica za svadbu online",
    "izrada pozivnica za venčanje",
    "napravi pozivnicu za venčanje",
  ],
  openGraph: {
    title: "Napravi Website Pozivnicu za Venčanje | HALO Uspomene",
    description:
      "Personalizovana website pozivnica za vaše venčanje — sa RSVP formom, odbrojavanjem i programom dana. Gotova za 24h.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-pozivnicu",
  },
};

export default async function NapraviPozivnicuPage({
  searchParams,
}: {
  searchParams: Promise<{
    upgrade?: string;
    premium?: string;
    bypass?: string;
  }>;
}) {
  const params = await searchParams;
  const upgradeSlug = params.upgrade?.trim();
  const forcePremium = params.premium === "true";

  // Foreign-customer bypass: admin-issued signed link that disables SMS
  // verification and pre-sets the phone country prefix. Verified server-side.
  let bypassInfo: BypassInfo | undefined;
  if (params.bypass) {
    try {
      const payload = await verifyBypassToken(params.bypass);
      const cfg = COUNTRY_CONFIGS[payload.country];
      bypassInfo = {
        token: params.bypass,
        country: payload.country,
        callingCode: cfg.callingCode,
        countryLabel: cfg.label,
      };
    } catch {
      // Invalid/expired bypass — render the normal form as if no token was passed.
      // The foreign-customer notice will still be visible.
    }
  }

  let initialFormData: UpgradeInitialFormData | undefined;

  if (upgradeSlug) {
    const existing = await getWeddingData(upgradeSlug);

    // Guard: must exist, must be draft, must not be already submitted/paid
    if (
      !existing ||
      existing.draft !== true ||
      existing.premium_paid === true ||
      (existing.locations ?? []).length > 0
    ) {
      redirect("/moje-vencanje?upgradeError=invalid");
    }

    // Split event_date "YYYY-MM-DDTHH:MM:SS" into date + time
    const evt = existing.event_date || "";
    const [event_date_only, event_time_full] = evt.split("T");
    const event_time = event_time_full ? event_time_full.slice(0, 5) : "18:00";

    // Strip "+381" prefix and split legacy comma-separated value into
    // primary (verified) + optional secondary (PDF-only) slots.
    const rawPhone =
      (existing as unknown as { contact_phone?: string }).contact_phone || "";
    const phoneParts = rawPhone
      .split(",")
      .map((p) => p.replace(/^\+?381/, "").trim())
      .filter(Boolean);
    const contact_phone = phoneParts[0] || "";
    const contact_phone_secondary = phoneParts[1] || "";

    initialFormData = {
      bride: existing.couple_names?.bride || "",
      groom: existing.couple_names?.groom || "",
      full_display:
        existing.couple_names?.full_display ||
        `${existing.couple_names?.bride || ""} & ${existing.couple_names?.groom || ""}`,
      useCyrillic: existing.useCyrillic ?? false,
      premium: forcePremium,
      event_date: evt,
      event_date_only: event_date_only || "",
      event_time,
      submit_until_date: existing.submit_until || "",
      contact_phone,
      contact_phone_secondary,
      scriptFont: existing.scriptFont || "great-vibes",
      theme: existing.theme || "classic_rose",
      tagline: existing.tagline || "",
      thankYouFooter: existing.thankYouFooter || "",
      countdown_enabled: existing.countdown_enabled ?? true,
      map_enabled: existing.map_enabled ?? true,
      extra_raspored: existing.paid_for_raspored ?? false,
      extra_audio: existing.paid_for_audio ?? false,
      extra_usb_kaseta: existing.paid_for_audio_USB === "kaseta",
      extra_usb_bocica: existing.paid_for_audio_USB === "bocica",
    };
  }

  return (
    <>
      <Header />
      <FormPageWrapper
        upgradeSlug={upgradeSlug}
        forcePremium={forcePremium}
        initialFormData={initialFormData}
        bypassInfo={bypassInfo}
      />
      <section className="py-16 sm:py-20 bg-[#faf9f6] border-t border-[#232323]/5">
        <InvitationClusterLinks current="vencanje" />
      </section>
      <Footer />
    </>
  );
}
