import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileDown,
  Images,
  MapPin,
  Type,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import FormPageWrapper, {
  type UpgradeInitialFormData,
} from "./FormPageWrapper";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import { getWeddingData } from "@/lib/couples";
import { resolveBypassInfo } from "@/lib/bypass-token";
import { formatPrice, pricing } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Napravi Pozivnicu za Venčanje Online — Gotova Odmah",
  description:
    "Popunite kratki upitnik, mi dizajniramo vašu digitalnu pozivnicu za venčanje — gotova odmah. Potvrde dolaska, odbrojavanje i besplatan dizajn štampanih pozivnica.",
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
      "Personalizovana website pozivnica za vaše venčanje — sa formom za potvrdu dolaska, odbrojavanjem i programom dana. Gotova odmah.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-pozivnicu",
  },
};

/** Cena se cita jednom i koristi i u tekstu i u schemi, da se ne raziđu. */
const cena = formatPrice(pricing.pozivnica.website.price);

const faqItems = [
  {
    q: "Koliko košta pozivnica za venčanje?",
    a: `Website pozivnica za venčanje košta ${cena}. U cenu ulaze potvrde dolaska, odbrojavanje, program dana, mapa do lokacije i PDF pozivnica za štampu sa QR kodom — bez naknadnih doplata.`,
  },
  {
    q: "Kada je pozivnica gotova?",
    a: "Odmah. Popunite upitnik, izaberete temu i font, i pozivnica je napravljena — otključavate je nakon uplate i istog trenutka možete da je šaljete gostima.",
  },
  {
    q: "Kako gosti potvrđuju dolazak?",
    a: "Gost otvori link i jednim klikom potvrdi dolazak — bez aplikacije i bez registracije. Vi u portalu vidite spisak uživo: ko je potvrdio, ko je otkazao i koliko je ukupno osoba. Spisak se koristi i za raspored sedenja.",
  },
  {
    q: "Mogu li da menjam podatke posle slanja pozivnice?",
    a: "Da. Satnica, lokacija i detalji mogu da se menjaju sve do dana venčanja. Link i QR kod ostaju isti, pa gostima ne šaljete ništa ponovo — oni prosto vide ažuriranu verziju.",
  },
  {
    q: "Da li pozivnica može na ćirilici?",
    a: "Može. Podržane su i latinica i ćirilica, a za ćirilicu je na raspolaganju sedam fontova — od kaligrafskih (Great Vibes, Jasminum, Marck Script) do elegantne antikve (Cormorant Garamond) i art deco stila (Poiret One).",
  },
  {
    q: "Šta ako neko od gostiju ne koristi pametan telefon?",
    a: "Uz web pozivnicu ide i PDF u A5 formatu sa QR kodom. Odštampate ga i uručite lično onima kojima je papir draži — a ko skenira kod, završi na istoj pozivnici i tu potvrdi dolazak.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const ukljuceno = [
  {
    icon: <CheckCircle2 size={18} />,
    title: "Potvrde dolaska",
    desc: "Gost potvrdi jednim klikom, vi vidite spisak uživo.",
  },
  {
    icon: <CalendarClock size={18} />,
    title: "Odbrojavanje i program dana",
    desc: "Satnica venčanja koju gost nosi u telefonu.",
  },
  {
    icon: <MapPin size={18} />,
    title: "Mapa do lokacije",
    desc: "Navigacija se otvara direktno iz pozivnice.",
  },
  {
    icon: <Type size={18} />,
    title: "Latinica i ćirilica",
    desc: "Pet predefinisanih tema i boja po želji.",
  },
  {
    icon: <Images size={18} />,
    title: "Galerija fotografija",
    desc: "Vaše slike u polaroid stilu, ako želite.",
  },
  {
    icon: <FileDown size={18} />,
    title: "PDF za štampu",
    desc: "A5 sa QR kodom — uključen u cenu.",
  },
];

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
  // Invalid/expired → undefined, so the normal SMS form renders.
  const bypassInfo = await resolveBypassInfo(params.bypass);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Formular ostaje sam u prvom ekranu — upit koji dovodi posetioca
          („napravi pozivnicu online", „pozivnice za vencanje online") je
          transakcioni, pa je forma odgovor na njega. Sadrzaj ide ISPOD, gde ga
          vidi samo onaj ko skroluje, dakle onaj ko jos nije odlucio.
          Stranica je do 2026-08-04 imala 320 reci i stajala na poziciji 7,6 sa
          456 prikaza i SEDAM klikova. */}
      <FormPageWrapper
        upgradeSlug={upgradeSlug}
        forcePremium={forcePremium}
        initialFormData={initialFormData}
        bypassInfo={bypassInfo}
      >

      {/* ═══ Sta dobijate ═══
          `mt-16` je namerno: bez njega bela pozadina ove sekcije počinje
          odmah ispod kartice formulara, pa se dve površine slepe. */}
      <section className="mt-16 bg-white py-16 sm:mt-20 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 font-serif text-2xl text-[#232323] sm:text-3xl">
            Šta dobijate uz pozivnicu
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ukljuceno.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-2xl border border-stone-200 bg-[#faf9f6] p-5"
              >
                <span className="mt-0.5 shrink-0 text-[#AE343F]">{f.icon}</span>
                <span>
                  <span className="block font-semibold text-[#232323]">
                    {f.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#232323]/55">
                    {f.desc}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Sta se zaista pise ═══ */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="container mx-auto max-w-3xl space-y-5 px-4 leading-relaxed text-[#232323]/70">
          <h2 className="font-serif text-2xl text-[#232323] sm:text-3xl">
            Šta zapravo pišete u upitniku
          </h2>
          <p>
            Kod digitalne pozivnice ne sastavljate ceo tekst kao na papiru. Imena,
            datum, satnica, naziv i adresa lokacije, rok za potvrde — sve su to{" "}
            <strong className="text-[#232323]">zasebna polja</strong> koja
            pozivnica sama prikazuje, uredno raspoređena i sa mapom.
          </p>
          <p>
            Slobodnim tekstom pišete samo dve stvari:{" "}
            <strong className="text-[#232323]">tagline</strong> — citat ili
            rečenicu koja stoji na vrhu i daje pozivnici ton, i{" "}
            <strong className="text-[#232323]">zahvalnicu</strong> — poruku na
            dnu, obično upućenu roditeljima ili gostima koji dolaze izdaleka.
          </p>
          <ul className="space-y-2.5">
            {[
              "Posle svih ovih godina, konačno i zvanično. Radujemo se što ćete biti sa nama.",
              "Dva srca, jedan dom, i jedan dan koji želimo da podelimo sa vama.",
              "Sve što nam treba tog dana jeste da budete tu.",
            ].map((t) => (
              <li
                key={t}
                className="rounded-xl border border-stone-200 bg-[#faf9f6] px-5 py-3 italic"
              >
                {t}
              </li>
            ))}
          </ul>
          <p>
            Više gotovih primera, po tonu i po tome ko poziva, ima u vodiču{" "}
            <Link
              href="/blog/tekst-za-pozivnicu-za-vencanje"
              className="font-medium text-[#AE343F] hover:underline"
            >
              tekst za pozivnicu za venčanje
            </Link>
            .
          </p>

          <h2 className="pt-4 font-serif text-2xl text-[#232323] sm:text-3xl">
            Digitalna ili štampana pozivnica?
          </h2>
          <p>
            Kod nas odgovor nije ili-ili. Uz web pozivnicu ide i{" "}
            <strong className="text-[#232323]">PDF u A5 formatu sa QR
            kodom</strong>: odštampate ga i uručite lično onima kojima je papir
            draži, a svako ko skenira kod završi na istoj pozivnici i tu potvrdi
            dolazak.
          </p>
          <p>
            Praktična razlika je što digitalna pozivnica{" "}
            <strong className="text-[#232323]">broji goste umesto vas</strong>.
            Umesto da pamtite ko je šta rekao u Viber prepisci, imate spisak koji
            se sam ažurira — a taj isti spisak se prevlači u{" "}
            <Link
              href="/raspored-sedenja"
              className="font-medium text-[#AE343F] hover:underline"
            >
              raspored sedenja
            </Link>
            , bez prepisivanja. Sve o samom formatu ima u vodiču{" "}
            <Link
              href="/blog/digitalne-pozivnice-za-vencanje"
              className="font-medium text-[#AE343F] hover:underline"
            >
              digitalne pozivnice za venčanje
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-[#faf9f6] py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 font-serif text-2xl text-[#232323] sm:text-3xl">
            Česta pitanja
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-stone-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-serif text-lg text-[#232323]">
                  {item.q}
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-[#AE343F] transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-[#232323]/60">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-[#232323] px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-serif text-xl text-[#F5F4DC] sm:text-2xl">
                Pozivnica je gotova odmah
              </p>
              <p className="mt-1 text-sm text-[#F5F4DC]/50">
                Cena {cena}, bez skrivenih troškova.
              </p>
            </div>
            <Link
              href="#formular"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#AE343F] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#F5F4DC] transition-colors hover:bg-[#8A2A32]"
            >
              Napravite pozivnicu
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      </FormPageWrapper>

      <section className="py-16 sm:py-20 bg-[#faf9f6] border-t border-[#232323]/5">
        <InvitationClusterLinks current="vencanje" />
      </section>
      <Footer />
    </>
  );
}
