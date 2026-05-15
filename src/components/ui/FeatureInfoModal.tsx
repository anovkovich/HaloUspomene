"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Mic,
  Check,
  ArrowRight,
  Phone,
  QrCode,
  FileDown,
  Smartphone,
  Sparkles,
  Clock,
  Gift,
} from "lucide-react";

export type FeatureInfoKey = "raspored" | "audio" | null;

interface Props {
  feature: FeatureInfoKey;
  onClose: () => void;
}

export default function FeatureInfoModal({ feature, onClose }: Props) {
  const open = feature !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="feature-info-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8 bg-black/55 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feature-info-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Zatvori"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="overflow-y-auto px-6 sm:px-8 pt-7 pb-7">
              {feature === "raspored" && <RasporedContent />}
              {feature === "audio" && <AudioContent />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--cene-accent)] mb-3 mt-6">
      {children}
    </h3>
  );
}

function Bullet({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        style={{
          backgroundColor: "rgba(var(--cene-accent-rgb),0.08)",
          color: "var(--cene-accent)",
        }}
      >
        {icon}
      </span>
      <div className="flex-1 text-sm">
        <span className="font-semibold text-[#232323]">{title}.</span>{" "}
        <span className="text-[#232323]/65 leading-relaxed">{children}</span>
      </div>
    </li>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
        style={{
          backgroundColor: "var(--cene-accent)",
          color: "white",
        }}
      >
        {n}
      </span>
      <span className="text-sm text-[#232323]/75 leading-relaxed pt-0.5">
        {children}
      </span>
    </li>
  );
}

function ExampleLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
      style={{
        backgroundColor: "rgba(var(--cene-accent-rgb),0.08)",
        color: "var(--cene-accent)",
        border: "1px solid rgba(var(--cene-accent-rgb),0.18)",
      }}
    >
      {label}
      <ArrowRight size={14} />
    </Link>
  );
}

function RasporedContent() {
  return (
    <>
      <div className="flex items-center gap-3 mb-3 pr-10">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "rgba(var(--cene-accent-rgb),0.1)",
            color: "var(--cene-accent)",
          }}
        >
          <LayoutDashboard size={20} />
        </span>
        <h2
          id="feature-info-title"
          className="text-xl sm:text-2xl font-serif text-[#232323] leading-tight"
        >
          Alat za raspored sedenja <br className="sm:hidden" />
          <span className="text-[var(--cene-accent)]">
            + QR pano dobrodošlice
          </span>
        </h2>
      </div>

      <p className="text-sm sm:text-[15px] text-[#232323]/70 leading-relaxed">
        Vizuelni editor za raspored stolova i prateća stranica gde gosti, jednim
        skeniranjem QR koda na ulazu u salu, sami za par sekundi pronalaze gde
        sede — bez liste imena, bez gužve na vratima, bez pitanja{" "}
        <em>„gde sam ja?“</em>.
      </p>

      <SectionTitle>Šta dobijate</SectionTitle>
      <ul className="space-y-3">
        <Bullet icon={<LayoutDashboard size={14} />} title="Vizuelni editor">
          Okrugli, pravougaoni i mladenački stolovi prema vašoj skici sale.
          Gosti se raspoređuju po mestima, filtrirate ih po kategorijama
          (mladini / mladoženjini / zajednički) i pretragom po imenu.
        </Bullet>
        <Bullet
          icon={<Smartphone size={14} />}
          title="Stranica „Gde sedim?“ za goste"
        >
          Gost ukuca svoje ime i odmah vidi broj stola i raspored sedišta.
          Pretraga radi sa i bez kvačica (Peric = Perić).
        </Bullet>
        <Bullet icon={<QrCode size={14} />} title="QR pano dobrodošlice">
          Elegantan pano za štampu — dobijate spreman dizajn za stampu 50x70 cm
          ili samo preuzmete QR kod i prosledite dekoraciji da vam izdizajniraju
          pano dobrodošlice po vašem ukusu!
        </Bullet>
        <Bullet icon={<FileDown size={14} />} title="PDF za štampu">
          Za one koje vole tradiocionalni plan B tu je PDF - sa planom sale,
          spisak po stolovima i abecedni spisak imena sa brojem stola — spremno
          za hostese ili domaćina koji dočekuje goste.
        </Bullet>
      </ul>

      <SectionTitle>Kako gosti koriste</SectionTitle>
      <ol className="space-y-2.5">
        <Step n={1}>
          Skeniraju QR sa panoa kamerom telefona — bez aplikacije.
        </Step>
        <Step n={2}>Otvori se „Gde sedim?“ stranica.</Step>
        <Step n={3}>Ukucaju ime i odmah vide sto za kojim su raspoređeni.</Step>
      </ol>

      <div
        className="mt-6 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: "rgba(var(--cene-accent-rgb),0.06)",
          border: "1px solid rgba(var(--cene-accent-rgb),0.12)",
        }}
      >
        <Sparkles
          size={16}
          className="text-[var(--cene-accent)] flex-shrink-0 mt-0.5"
        />
        <p className="text-[#232323]/70 leading-relaxed">
          <span className="font-semibold text-[var(--cene-accent)]">
            Promene su trenutne.
          </span>{" "}
          Otkaže li neko dva dana pre venčanja, samo ažurirate raspored — pano
          ostaje isti, gosti odmah vide najnovije stanje.
        </p>
      </div>

      <ExampleLink
        href="/pozivnica/ana-dejan/gde-sedim"
        label="Pogledajte primer „Gde sedim?“ uživo"
      />
    </>
  );
}

function AudioContent() {
  return (
    <>
      <div className="flex items-center gap-3 mb-3 pr-10">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "rgba(var(--cene-accent-rgb),0.1)",
            color: "var(--cene-accent)",
          }}
        >
          <Mic size={20} />
        </span>
        <h2
          id="feature-info-title"
          className="text-xl sm:text-2xl font-serif text-[#232323] leading-tight"
        >
          Digitalna audio knjiga utisaka
        </h2>
      </div>

      <p className="text-sm sm:text-[15px] text-[#232323]/70 leading-relaxed">
        Moderna alternativa klasičnoj knjizi utisaka ili nešto slično našem
        retro telefonu uspomena za proslave — gosti ostavljaju kratku glasovnu
        poruku koju ćete moći da čujete i za deset, dvadeset, pedeset godina.
        Bez aplikacije, bez registracije, direktno sa njihovog telefona.
      </p>

      <SectionTitle>Kako funkcioniše</SectionTitle>
      <ol className="space-y-2.5">
        <Step n={1}>
          Preuzmete PDF zahvalnicu spremnu za štampu i postavljate je na stolove
          gostima.
        </Step>
        <Step n={2}>
          Gost skenira QR kod kamerom telefona — otvara se stranica za
          ostavljanje poruke
        </Step>
        <Step n={3}>
          Pritisne dugme i snimi poruku do <strong>60 sekundi</strong> — može
          snimiti i više poruka tokom večeri, poslati čestitku, otpevati vašu
          pesmu...
        </Step>
        <Step n={4}>
          Na kraju klikne dugme Pošalji — vi dobijate sve audio zapise u svom{" "}
          <strong>Moje Venčanje</strong> portalu!
        </Step>
      </ol>

      <SectionTitle>Šta dobijate u portalu</SectionTitle>
      <ul className="space-y-3">
        <Bullet icon={<QrCode size={14} />} title="PDF zahvalnica za štampu">
          Spremna grafika sa QR kodom i kratkim uputstvom za goste — samo
          odštampate i postavite na stolove.
        </Bullet>
        <Bullet icon={<Check size={14} />} title="Sve poruke na jednom mestu">
          Preslušavanje, preuzimanje i brisanje pojedinačnih snimaka — kad god
          poželite.
        </Bullet>
        <Bullet icon={<FileDown size={14} />} title="Spajanje u jedan fajl">
          Jednim klikom spajate sve poruke u jedan fajl — savršeno za čuvanje
          ili deljenje sa porodicom.
        </Bullet>
      </ul>

      <SectionTitle>Suveniri (opciono)</SectionTitle>
      <ul className="space-y-3">
        <Bullet icon={<Gift size={14} />} title="USB retro kaseta">
          Sve poruke na nostalgičnom USB-u u obliku retro kasete — uspomena koju
          ćete sa zadovoljstvom pokazati svima.
        </Bullet>
        <Bullet icon={<Gift size={14} />} title="USB u bočici">
          Snimci u elegantnoj staklenoj mini bočici sa USB-om — prelepo i
          elegantno čuvanje uspomena zauvek.
        </Bullet>
      </ul>

      <div
        className="mt-6 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: "rgba(var(--cene-accent-rgb),0.06)",
          border: "1px solid rgba(var(--cene-accent-rgb),0.12)",
        }}
      >
        <Clock
          size={16}
          className="text-[var(--cene-accent)] flex-shrink-0 mt-0.5"
        />
        <p className="text-[#232323]/70 leading-relaxed">
          <span className="font-semibold text-[var(--cene-accent)]">
            Kada je aktivno:
          </span>{" "}
          snimanje radi na dan venčanja — da snimci ostanu autentični deo
          trenutka i atmosfere sa venčanja!
        </p>
      </div>

      <div
        className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: "rgba(var(--cene-accent-rgb),0.06)",
          border: "1px solid rgba(var(--cene-accent-rgb),0.12)",
        }}
      >
        <Phone
          size={16}
          className="text-[var(--cene-accent)] flex-shrink-0 mt-0.5"
        />
        <p className="text-[#232323]/70 leading-relaxed">
          <span className="font-semibold text-[var(--cene-accent)]">
            Želite pravi retro telefon umesto QR koda?
          </span>{" "}
          Iznajmite naš autentični vintage telefon — gosti podižu slušalicu,
          čuju vaš pozdrav i ostavljaju poruku kao u stara dobra vremene.
        </p>
      </div>

      <ExampleLink
        href="/pozivnica/ana-dejan/audio-knjiga"
        label="Pogledajte primer stranice uživo"
      />
    </>
  );
}
