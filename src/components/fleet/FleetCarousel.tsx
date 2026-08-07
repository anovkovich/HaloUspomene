"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero karusel flote — centralno vozilo u punoj veličini, sa po jednim
 * umanjenim i izbledelim vozilom levo i desno. Sam se vrti (sledeće vozilo
 * dolazi s desna i potiskuje centralno ulevo), a zaustavlja se dok je miš na
 * njemu, dok je fokus unutar njega i kada je uključeno „smanji animacije".
 *
 * Radi sa bilo kojim brojem vozila: sa 3 su uvek sva tri u kadru, sa više se
 * ostala drže sakrivena iza ivica dok ne dođu na red. Zato dodavanje vozila u
 * `oldtimerFleet` ne traži nikakvu izmenu ovde.
 *
 * Ne prima ceo tip vozila nego `FleetSlide`, da bi mogao da posluži i floti
 * modernih automobila, koja ima drugačiji oblik podataka.
 */
export interface FleetSlide {
  /** Stabilan ključ — id vozila iz izvora podataka. */
  id: string;
  /** Naziv modela, ispisuje se ispod karusela. */
  name: string;
  /** Sitniji red ispod naziva (npr. „Crveni klasik · Šezdesete"). */
  caption?: string;
  image: string;
  alt: string;
}

/**
 * Pomeraj bočnih vozila (u % širine karusela) i njihovo umanjenje.
 *
 * Namerno iste vrednosti na svim širinama: razliku između telefona i desktopa
 * nosi `px-` klasa na slajdu, koja je čist CSS. Da se pomeraj računa u JS-u po
 * širini ekrana, prvi render (i serverski markup) bi imao jedne vrednosti a
 * render posle montiranja druge — pa bi vozila posle učitavanja stranice vidno
 * odlutala na svoja mesta.
 */
const SIDE = { offset: 37, scale: 0.34 };

/** Providnost, zamućenje i zasićenje boje bočnih vozila. */
const SIDE_OPACITY = 0.26;
const SIDE_FILTER = "blur(3px) saturate(0.4)";
const CENTER_FILTER = "blur(0px) saturate(1)";

/** Trajanje prelaza u sekundama — jedan izvor i za animaciju i za takt vrtnje. */
const GLIDE_S = 1.1;
const GLIDE_S_REDUCED = 0.55;

export default function FleetCarousel({
  slides,
  holdMs = 3000,
  label = "Flota vozila",
  eyebrow,
}: {
  slides: FleetSlide[];
  /**
   * Koliko vozilo MIRUJE u centru pre nego što krene sledeće. Trajanje samog
   * prelaza se dodaje na ovo, pa je razmak između smena `holdMs + prelaz` —
   * inače bi se pri dužem prelazu skratilo baš vreme u kome se auto gleda.
   */
  holdMs?: number;
  /** Pristupačno ime karusela (ne prikazuje se). */
  label?: string;
  /** Sitan naslov iznad karusela, npr. „Iz ponude izdvajamo". */
  eyebrow?: string;
}) {
  const n = slides.length;
  /* Kreće od drugog vozila, da prva tri stoje s leva na desno onako kako su
     poređana u floti. Sa prvim u centru, poslednje vozilo se obmota na levu
     stranu i redosled na ekranu deluje nasumično. */
  const initial = n > 2 ? 1 : 0;

  const [active, setActive] = useState(initial);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + n) % n),
    [n],
  );

  /* Samo-vrtnja se ne gasi uz `prefers-reduced-motion` nego usporava — inace
     bi karusel kod tih posetilaca ostao zamrznut na prvom vozilu. */
  useEffect(() => {
    if (n < 2 || paused) return;
    const glideMs = (reduceMotion ? GLIDE_S_REDUCED : GLIDE_S) * 1000;
    const every = (reduceMotion ? holdMs * 1.5 : holdMs) + glideMs;
    const id = setInterval(() => setActive((a) => (a + 1) % n), every);
    return () => clearInterval(id);
  }, [n, paused, reduceMotion, holdMs]);

  if (n === 0) return null;

  /**
   * Pozicija vozila u odnosu na centralno, sa preskakanjem preko kraja niza
   * (poslednje vozilo je „levo" od prvog), da rotacija nema šav.
   */
  const relative = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  /* Prelaz je namerno dug i mek. Dve stvari ga cuvaju od utiska da vozila
     naglo zamene mesta:
     1. kriva `[0.4, 0, 0.2, 1]` blago krece i dugo se smiruje, umesto da sav
        pomeraj potrosi u prvih par kadrova (tada izgleda kao presnimavanje);
     2. providnost, zamucenje i boja idu sporije od samog pomeraja i bez
        ubrzanja — vozilo prvo otklizi ka sredini pa tek onda skroz izostri i
        dobije punu boju, a ono koje odlazi jos malo ostane vidljivo u letu.
     Uz `prefers-reduced-motion` prelaz se skracuje, ali se NE gasi: klizanje
     je ovde sam sadrzaj (prikaz flote), a ne ukras. Nulto trajanje bi izgledalo
     kao da se slike presnimavaju. Napomena: Windows sa iskljucenim animacijama
     (`MinAnimate=0`) salje bas taj signal, pa se ta grana vidi cesce nego sto
     bi se ocekivalo. */
  const glide = {
    duration: reduceMotion ? GLIDE_S_REDUCED : GLIDE_S,
    ease: [0.4, 0, 0.2, 1] as const,
  };
  const fade = {
    duration: reduceMotion ? GLIDE_S_REDUCED * 1.1 : GLIDE_S * 1.25,
    ease: "easeOut" as const,
  };
  const transition = { x: glide, scale: glide, opacity: fade, filter: fade };

  return (
    <div
      className="relative mx-auto mb-9 max-w-5xl"
      role="group"
      aria-roledescription="karusel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {eyebrow && (
        <p className="relative z-10 flex items-center justify-center gap-3 mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#AE343F]/75">
          <span aria-hidden className="h-px w-8 bg-[#AE343F]/25" />
          {eyebrow}
          <span aria-hidden className="h-px w-8 bg-[#AE343F]/25" />
        </p>
      )}

      {/* Topli sjaj ispod vozila — fotografije su bez pozadine, pa nema okvira */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] blur-3xl"
      />

      <div
        className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[400px]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null || n < 2) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {slides.map((slide, i) => {
          const d = relative(i);
          const isCenter = d === 0;
          const isVisible = Math.abs(d) <= 1;
          const at = {
            x: `${d * SIDE.offset}%`,
            scale: isCenter ? 1 : SIDE.scale,
            opacity: isVisible ? (isCenter ? 1 : SIDE_OPACITY) : 0,
            filter: isCenter ? CENTER_FILTER : SIDE_FILTER,
          };

          return (
            <motion.div
              key={slide.id}
              className={`absolute inset-0 px-[15%] sm:px-[17%] ${
                isVisible ? "" : "pointer-events-none"
              }`}
              style={{ zIndex: 10 - Math.abs(d) }}
              /* Isto stanje i u `initial` i u `animate`: vozila su na svojim
                 mestima od prvog kadra, pa se pri ucitavanju ne razlete iz
                 sredine. `initial` se primenjuje samo pri montiranju, tako da
                 kasnije promene i dalje idu kroz animaciju. */
              initial={at}
              animate={at}
              transition={transition}
              aria-hidden={isVisible ? undefined : true}
            >
              {/* Bočno vozilo je dugme — klik ga dovodi u centar.
                  Centralno i sakrivena su `disabled`, pa ne hvataju fokus. */}
              <button
                type="button"
                disabled={isCenter || !isVisible}
                onClick={() => setActive(i)}
                aria-label={isCenter ? undefined : `Prikaži ${slide.name}`}
                className="relative block h-full w-full cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#AE343F] rounded-3xl"
              >
                {/* LCP je vozilo koje se prvo vidi u centru, ne prvo u nizu */}
                <Image
                  src={slide.image}
                  alt={isCenter ? slide.alt : ""}
                  fill
                  priority={i === initial}
                  sizes="(max-width: 640px) 70vw, (max-width: 1024px) 55vw, 560px"
                  className="object-contain"
                />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Naziv vozila — aria-live da čitač ekrana prati rotaciju */}
      <div className="mt-3 min-h-[3.25rem]" aria-live="polite">
        <motion.div
          key={slides[active].id}
          /* `initial` i `animate` NE smeju da zavise od `reduceMotion`: framer
             ih upisuje u stil, a `useReducedMotion()` na serveru uvek daje
             false pa na klijentu odmah true kod korisnika sa iskljucenim
             animacijama — tada se serverski `translateY(6px)` i klijentski
             `none` ne poklope i React prijavi hydration mismatch. Razliku sme
             da nosi samo `transition`, koja se ne renderuje u markup. */
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          /* Kasni za vozilom, da naziv ne odskoci pre nego sto auto stigne. */
          transition={{
            duration: reduceMotion ? 0.3 : 0.5,
            delay: reduceMotion ? 0.15 : 0.3,
          }}
        >
          <p className="font-serif text-xl sm:text-2xl text-[#232323]">
            {slides[active].name}
          </p>
          {slides[active].caption && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#232323]/45 mt-1">
              {slides[active].caption}
            </p>
          )}
        </motion.div>
      </div>

      {/* Bez strelica — karusel se vrti sam, a ko hoce da preskoci ima tackice,
          klik na bocno vozilo i prevlacenje prstom. */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Prikaži ${slide.name}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === active
                  ? "w-6 bg-[#AE343F]"
                  : "w-2 bg-[#232323]/20 hover:bg-[#232323]/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
