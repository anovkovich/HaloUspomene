import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import FormPageWrapper, { type UpgradeInitialFormData } from "./FormPageWrapper";
import { getWeddingData } from "@/lib/couples";

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
  searchParams: Promise<{ upgrade?: string; premium?: string }>;
}) {
  const params = await searchParams;
  const upgradeSlug = params.upgrade?.trim();
  const forcePremium = params.premium === "true";

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

    // Strip "+381" prefix from quick-register contact_phone
    const rawPhone =
      (existing as unknown as { contact_phone?: string }).contact_phone || "";
    const contact_phone = rawPhone.replace(/^\+?381/, "").trim();

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
      />
      <Footer />
    </>
  );
}
