import type { Vendor, VendorCategory, VendorCategoryMeta } from "./types";

export const CITIES = [
  "Beograd",
  "Novi Sad",
  "Subotica",
  "Čačak",
  "Kragujevac",
  "Niš",
] as const;

export type City = (typeof CITIES)[number];

export const VENDOR_CATEGORIES: VendorCategoryMeta[] = [
  { id: "venue", label: "Sala", labelPlural: "Sale", count: 50 },
  { id: "music", label: "Muzika", labelPlural: "Bendovi & DJ", count: 42 },
  {
    id: "photo-video",
    label: "Foto/Video",
    labelPlural: "Foto & Video",
    count: 30,
  },
  { id: "cake", label: "Torta", labelPlural: "Torte", count: 22 },
  {
    id: "decoration",
    label: "Dekoracija",
    labelPlural: "Dekoracije",
    count: 18,
  },
  { id: "flowers", label: "Cveće", labelPlural: "Cveće", count: 20 },
  { id: "fireworks", label: "Vatromet", labelPlural: "Efekti", count: 18 },
  { id: "dress", label: "Venčanica", labelPlural: "Venčanice", count: 25 },
  { id: "makeup", label: "Šminka", labelPlural: "MakeUp", count: 12 },
  { id: "rings", label: "Burme", labelPlural: "Burme", count: 16 },
  { id: "gifts", label: "Pokloni", labelPlural: "Pokloni", count: 10 },
];

// Venues backfilled from research doc, other categories still placeholder
export const VENDORS: Vendor[] = [
  // ── Venues: Beograd (13) ──
  { id: "v-beolido", name: "Beolido Event Centar", category: "venue", city: "Beograd", capacity: "400-580", phone: "+381 69 1090910", website: "beolido.rs", instagram: "@beolidorivereventclub" },
  { id: "v-event-s", name: "Event Centar S", category: "venue", city: "Beograd", capacity: "200-450", website: "eventcentars.rs", instagram: "@event.centar.s" },
  { id: "v-azzaro-black", name: "Azzaro Black Club", category: "venue", city: "Beograd", capacity: "280", website: "azzaroclub.rs", instagram: "@azzaroclubs" },
  { id: "v-azzaro-white", name: "Azzaro White Club", category: "venue", city: "Beograd", capacity: "150", website: "azzaroclub.rs", instagram: "@azzaroclubs" },
  { id: "v-azzaro-red", name: "Azzaro RED Club", category: "venue", city: "Beograd", capacity: "200", website: "azzaroclub.rs", instagram: "@azzaroclubs" },
  { id: "v-belgrade-hills", name: "Belgrade Hills Villa", category: "venue", city: "Beograd", capacity: "160-310", phone: "+381 11 299 20 24", website: "belgradehill.rs", instagram: "@thebelgradehills" },
  { id: "v-sest-topola", name: "Restoran Šest Topola", category: "venue", city: "Beograd", capacity: "220", phone: "+381 61 30 20 300", website: "sesttopola.rs", instagram: "@sest_topola" },
  { id: "v-imperium", name: "Imperium Hall", category: "venue", city: "Beograd", capacity: "150-400", phone: "063/300-558", website: "imperiumhall.rs", instagram: "@imperium.hall" },
  { id: "v-stadion", name: "Restoran Stadion", category: "venue", city: "Beograd", capacity: "300+", phone: "+381 62 212112", website: "restoranstadion.com", instagram: "@restoranstadion" },
  { id: "v-filmski-grad", name: "Filmski Grad", category: "venue", city: "Beograd", capacity: "260-380", phone: "+381 11 3559 180", website: "filmskigrad.rs", instagram: "@filmski_grad_filmska_zvezda" },
  { id: "v-cotier", name: "Cotier", category: "venue", city: "Beograd", capacity: "200-350", phone: "+381 69 688988", website: "cotier.rs", instagram: "@cotier.events" },
  { id: "v-glamoure", name: "Glamoure Event Center", category: "venue", city: "Beograd", capacity: "300", phone: "+381 65 3330085", website: "glamoure.rs", instagram: "@glamoure_event_center" },
  { id: "v-fors", name: "Restoran ForS", category: "venue", city: "Beograd", capacity: "350-500", website: "fors.rs" },
  // ── Venues: Novi Sad (8) ──
  { id: "v-zlatna-dvorana", name: "Zlatna Dvorana", category: "venue", city: "Novi Sad", capacity: "350-400", phone: "+381 64 82 00 600", website: "zlatnadvorana.com", instagram: "@zlatna_dvorana_salazavencanja" },
  { id: "v-villa-palace", name: "Villa Palace", category: "venue", city: "Novi Sad", capacity: "300", phone: "+381 21 300 5838", website: "villapalace.org", instagram: "@villapalace" },
  { id: "v-baron-castel", name: "Baron Castel", category: "venue", city: "Novi Sad", capacity: "250", phone: "+381 63 416 216", website: "baron.rs", instagram: "@baronfashion_wedding" },
  { id: "v-exclusive-ns", name: "Exclusive NS", category: "venue", city: "Novi Sad", capacity: "380", phone: "+381 63 10 17 017", website: "exclusivens.com", instagram: "@ekskluzivns" },
  { id: "v-dva-galeba", name: "Dva Galeba", category: "venue", city: "Novi Sad", capacity: "200", phone: "065/5257700", website: "dvagaleba.com", instagram: "@dva_galeba" },
  { id: "v-markovi-konaci", name: "Etno selo Markovi Konaci", category: "venue", city: "Novi Sad", capacity: "300+", phone: "063222483", website: "etnoselomarkovikonaci.rs", instagram: "@markovikonaci" },
  { id: "v-salas-137", name: "Salaš 137", category: "venue", city: "Novi Sad", capacity: "90-300", phone: "+381 62 773 137", website: "salas137.rs", instagram: "@salas137" },
  { id: "v-petlov-salas", name: "Petlov Salaš", category: "venue", city: "Novi Sad", capacity: "100-200", phone: "+381 66 364664", website: "petlovsalas.rs", instagram: "@restoran_petlov_salas" },
  // ── Venues: Subotica (8) ──
  { id: "v-zvonko-bogdan", name: "Vinarija Zvonko Bogdan", category: "venue", city: "Subotica", capacity: "220-280", phone: "+381 66 633 0333", website: "vinarijazvonkobogdan.com", instagram: "@salaszvonkobogdan" },
  { id: "v-sala-zorica", name: "Sala Zorica", category: "venue", city: "Subotica", capacity: "380-400", phone: "+381 64 416 6530", website: "salazorica.rs", instagram: "@salazorica" },
  { id: "v-sala-jelena", name: "Sala Jelena", category: "venue", city: "Subotica", capacity: "230", phone: "+381 24 555 397" },
  { id: "v-mirage", name: "Mirage Sala", category: "venue", city: "Subotica", capacity: "130-230", phone: "+381 64 113 3797" },
  { id: "v-salas-101", name: "Salaš 101", category: "venue", city: "Subotica", capacity: "80", phone: "060/55-88-451", instagram: "@salas101kelebija" },
  { id: "v-elitte-palic", name: "Elitte Palić", category: "venue", city: "Subotica", capacity: "500+", phone: "+381 24 753 245", website: "elittepalic.rs", instagram: "@elittepalic" },
  { id: "v-paligo-palata", name: "PaligoPalata", category: "venue", city: "Subotica", phone: "+381 66 6530381", website: "paligopalata.rs", instagram: "@paligo.palata" },
  { id: "v-ergela-kelebija", name: "Ergela Kelebija", category: "venue", city: "Subotica", capacity: "80-220", phone: "+381 24 789 034", website: "ergelakelebija.rs", instagram: "@ergela.kelebija" },
  // ── Venues: Čačak (7) ──
  { id: "v-morava", name: "Restoran Morava", category: "venue", city: "Čačak", capacity: "600", phone: "+381 32 333 991", website: "moravacacak.com", instagram: "@moravacacak" },
  { id: "v-royal-residence", name: "Royal Residence", category: "venue", city: "Čačak", capacity: "1000", phone: "+381 69 363 1330", website: "royalresidence.rs", instagram: "@hotelroyalresidence" },
  { id: "v-habanera", name: "Habanera Luks", category: "venue", city: "Čačak", capacity: "800-1100", phone: "064 15 72 383" },
  { id: "v-rajicic", name: "Restoran Rajičić", category: "venue", city: "Čačak", capacity: "340-790", phone: "+381 61 723 0618" },
  { id: "v-radovanje", name: "Radovanje", category: "venue", city: "Čačak", capacity: "400-560", phone: "069 1183009", website: "radovanje.rs", instagram: "@restoran.radovanje" },
  { id: "v-petrovic-ca", name: "Restoran Petrović", category: "venue", city: "Čačak", capacity: "150-270", phone: "032/55-90-333", website: "restoran-petrovic.rs", instagram: "@petrovicrestoran" },
  { id: "v-babic", name: "Ugostiteljski centar Babić", category: "venue", city: "Čačak", capacity: "370", phone: "+381 32 365 030", instagram: "@restoran_babic" },
  // ── Venues: Kragujevac (7) ──
  { id: "v-zeneva-lux", name: "Hotel Ženeva Lux", category: "venue", city: "Kragujevac", capacity: "650", phone: "+381 34 330 605", website: "zenevalux.com", instagram: "@zeneva_lux" },
  { id: "v-exclusive-kg", name: "Exclusive Event Center", category: "venue", city: "Kragujevac", capacity: "270-800", phone: "+381 63 318 700", website: "exclusive-event.rs", instagram: "@exclusiveeventcenter" },
  { id: "v-sumarice", name: "Hotel Šumarice", category: "venue", city: "Kragujevac", capacity: "280-500", phone: "+381 34 336 449", website: "hotelsumarice.com", instagram: "@hotel_sumarice" },
  { id: "v-woodland", name: "Woodland Resort", category: "venue", city: "Kragujevac", phone: "063 396 806", website: "woodland.rs", instagram: "@woodland.resort" },
  { id: "v-jezero-kg", name: "Restoran Jezero", category: "venue", city: "Kragujevac", capacity: "320-350", phone: "060 610 1920", website: "restoranjezero.rs", instagram: "@restoranjezero.kg" },
  { id: "v-pink-sala", name: "Pink Sala", category: "venue", city: "Kragujevac", capacity: "50-530", phone: "+381 64 660 1345", website: "pinksala.rs" },
  { id: "v-hotel-kg", name: "Hotel Kragujevac", category: "venue", city: "Kragujevac", capacity: "120-400", phone: "+381 34 335-811", website: "hotelkragujevac.com", instagram: "@hotelkragujevackg" },
  // ── Venues: Niš (7) ──
  { id: "v-perla", name: "Restoran Perla", category: "venue", city: "Niš", capacity: "420+", phone: "063 415 400", website: "perla.rs", instagram: "@restoran_perla" },
  { id: "v-mesecev-konak", name: "Mesečev Konak", category: "venue", city: "Niš", capacity: "400", phone: "+381 63 899 0038", website: "mesecevkonak.com", instagram: "@restoran_mesecev_konak" },
  { id: "v-vidikovac", name: "Hotel Vidikovac", category: "venue", city: "Niš", capacity: "350+", phone: "+381 18 459 1336", website: "hotelvidikovac.rs", instagram: "@vidikovac.hotel" },
  { id: "v-svajcarija", name: "Restoran Švajcarija", category: "venue", city: "Niš", capacity: "240-250", phone: "018/259 999", website: "svajcarija.rs", instagram: "@restoransvajcarija" },
  { id: "v-malca", name: "Vinski Podrum Malča", category: "venue", city: "Niš", capacity: "250", phone: "060 601 5747", website: "vinskipodrummalca.com", instagram: "@restoranvinarijemalca" },
  { id: "v-marica", name: "Hotel Marica", category: "venue", city: "Niš", capacity: "90", phone: "+381 18 562 333", website: "hotel-marica.com", instagram: "@hotel.restoran.marica" },
  { id: "v-dusanov-konak", name: "Etno restoran Dušanov Konak", category: "venue", city: "Niš", capacity: "200", phone: "018 333 44 68", website: "dusanovkonak.com", instagram: "@dusanovkonak2019" },
  // ── Music: Beograd Bendovi (10) ──
  { id: "m-laguna", name: "Laguna Band", category: "music", city: "Beograd", musicType: "Bend", phone: "063 859 0635", website: "lagunabend.com", instagram: "@lagunabend" },
  { id: "m-chegi", name: "CHEGI & Braća Bluz", category: "music", city: "Beograd", musicType: "Orkestar", phone: "066/418-034", website: "chegi-bend.rs", instagram: "@chegi.music" },
  { id: "m-bajka", name: "Bajka Bend", category: "music", city: "Beograd", musicType: "Bend", phone: "064 271 5391", website: "bajkabend.com", instagram: "@bajkabend" },
  { id: "m-splendid", name: "Splendid Band", category: "music", city: "Beograd", musicType: "Bend", website: "splendidband.com", instagram: "@splendid_music" },
  { id: "m-get-lucky", name: "Get Lucky Band", category: "music", city: "Beograd", musicType: "Bend", phone: "063 84 74 936", website: "getluckyband.net", instagram: "@get_lucky_band" },
  { id: "m-party-time", name: "Party Time Band", category: "music", city: "Beograd", musicType: "Bend", phone: "063 84 74 936", website: "partytimeband.rs" },
  { id: "m-aria", name: "Aria Bend", category: "music", city: "Beograd", musicType: "Bend", phone: "065 558 4465", website: "ariabend.com", instagram: "@aria_bend" },
  { id: "m-republika", name: "Republika Bend", category: "music", city: "Beograd", musicType: "Bend", website: "republikabend.rs", instagram: "@republika_bend_official" },
  { id: "m-showtime", name: "Showtime Bend", category: "music", city: "Beograd", musicType: "Bend", website: "showtimebend.com", instagram: "@showtimebend" },
  { id: "m-slamnig", name: "Nikola Slamnig", category: "music", city: "Beograd", musicType: "Solo/Bend", phone: "060 718 7326", website: "muzikazaproslave.in.rs", instagram: "@nikola_slamnig" },
  // ── Music: Beograd DJ (4) ──
  { id: "m-dj-proslave", name: "DJ za Proslave", category: "music", city: "Beograd", musicType: "DJ", phone: "065/440-2070", website: "djzaproslave.rs", instagram: "@djzaproslave" },
  { id: "m-dj-svadbe", name: "DJ Svadbe", category: "music", city: "Beograd", musicType: "DJ", phone: "063/337-993", website: "djsvadbe.rs", instagram: "@djsvadbe" },
  { id: "m-wedding-dj", name: "Wedding DJ", category: "music", city: "Beograd", musicType: "DJ", phone: "062 181 1910", instagram: "@wedding.dj" },
  { id: "m-saxngroove", name: "Sax 'n' Groove", category: "music", city: "Beograd", musicType: "DJ + Sax", phone: "060 44 55 820", website: "saxngroove.com", instagram: "@saxngroove_official" },
  // ── Music: Novi Sad Bendovi (9) ──
  { id: "m-mandarina", name: "Mandarina Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063 500 913", website: "mandarinabend.rs", instagram: "@mandarinabend" },
  { id: "m-talasna", name: "Talasna Dužina", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063/349-282", website: "bendtalasnaduzina.com", instagram: "@talasnaduzina" },
  { id: "m-tiktak", name: "Tik Tak Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063 887 9634", website: "bendzasvadbe.rs", instagram: "@tik_tak_bend" },
  { id: "m-pozitiv", name: "Pozitiv Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063 666 556", instagram: "@pozitivbend" },
  { id: "m-kupidon", name: "Kupidon Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063-866-0844", website: "kupidonbend.rs", instagram: "@nikola.djelic_kupidon.bend" },
  { id: "m-simpatico", name: "Simpatico Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "060 558 8912", website: "simpaticobend.com", instagram: "@simpaticobend" },
  { id: "m-lila", name: "Lila Bend", category: "music", city: "Novi Sad", musicType: "Bend", phone: "063 500 443", website: "lilabend.com", instagram: "@lilabendnovisad" },
  { id: "m-macak-misa", name: "Mačak Miša", category: "music", city: "Novi Sad", musicType: "Bend + Show", phone: "063 500 443", website: "macakmisa.com", instagram: "@macakmisa_bend" },
  { id: "m-pasadena", name: "Pasadena Bend", category: "music", city: "Novi Sad", musicType: "Bend + Sax + DJ", phone: "060/13-34-069", website: "pasadenabend.rs", instagram: "@pasadenabend" },
  // ── Music: Novi Sad DJ (2) ──
  { id: "m-ns-party", name: "NS Party Team", category: "music", city: "Novi Sad", musicType: "DJ", phone: "063 120 4169", website: "nspartyteam.com", instagram: "@nspartyteam" },
  { id: "m-dj-bera", name: "DJ Bera", category: "music", city: "Novi Sad", musicType: "DJ", phone: "060 600 2443", website: "djberaa.com", instagram: "@dj_beraa" },
  // ── Music: Subotica (4) ──
  { id: "m-topic", name: "Topic Band", category: "music", city: "Subotica", musicType: "Bend", website: "topicband.rs", instagram: "@topicband" },
  { id: "m-chick-norris", name: "Chick Norris Band", category: "music", city: "Subotica", musicType: "Bend", phone: "060 389 2150" },
  { id: "m-online", name: "Online Band", category: "music", city: "Subotica", musicType: "Bend", phone: "069 277 3140", instagram: "@online.band" },
  { id: "m-ringeraja", name: "Ringeraja Bend", category: "music", city: "Subotica", musicType: "Bend", website: "ringerajabend.rs", instagram: "@ringeraja.rs" },
  // ── Music: Čačak (2) ──
  { id: "m-fenix", name: "Fenix Band", category: "music", city: "Čačak", musicType: "Orkestar", phone: "065 37 18 370", website: "fenixbandcacak.com", instagram: "@fenixbandcacak_official_" },
  { id: "m-acoustic", name: "Acoustic Band", category: "music", city: "Čačak", musicType: "Bend", phone: "060/383-6192", website: "acousticbandcacak.com", instagram: "@acousticbandcacak" },
  // ── Music: Kragujevac (6) ──
  { id: "m-optimistic", name: "Optimistic Bend", category: "music", city: "Kragujevac", musicType: "Bend", website: "optimisticbend.rs", instagram: "@optimisticbend" },
  { id: "m-tikataka", name: "Tika Taka Bend", category: "music", city: "Kragujevac", musicType: "Bend", phone: "064 070 7027", instagram: "@tikatakabendd" },
  { id: "m-maximus", name: "Maximus Bend", category: "music", city: "Kragujevac", musicType: "Bend", phone: "066 543 3088", instagram: "@maximusbendkg" },
  { id: "m-exclusive-kg", name: "Exclusive Band KG", category: "music", city: "Kragujevac", musicType: "Bend", website: "exclusiveband.net", instagram: "@exclusive_band_kg" },
  { id: "m-alternativa", name: "Grupa Alternativa", category: "music", city: "Kragujevac", musicType: "Bend", website: "grupaalternativa.com", instagram: "@grupaalternativa" },
  { id: "m-saxocrew", name: "SaxoCrew", category: "music", city: "Kragujevac", musicType: "DJ + Sax", phone: "066 543 3088", instagram: "@saxocrew_kg" },
  // ── Music: Niš (4) ──
  { id: "m-dolcevita", name: "Dolce Vita Bend", category: "music", city: "Niš", musicType: "Bend", phone: "069 863 0148", website: "dolcevitabend.rs", instagram: "@dolcevitabend" },
  { id: "m-fiesta", name: "Fiesta Bend", category: "music", city: "Niš", musicType: "Bend", instagram: "@fiestabendnis" },
  { id: "m-kameleon", name: "Kameleon Bend", category: "music", city: "Niš", musicType: "Bend", phone: "063 440 880", website: "kameleonbend.com", instagram: "@kameleon_bend" },
  { id: "m-milagro", name: "Bend Milagro", category: "music", city: "Niš", musicType: "Bend", website: "bendmilagro.rs", instagram: "@milagrobendnis" },
  // ── Photo/Video: Beograd (11) ──
  { id: "pv-rudic", name: "Nikola Rudić", category: "photo-video", city: "Beograd", serviceType: "Foto", website: "nikolarudic.com" },
  { id: "pv-fototajna", name: "Foto Tajna", category: "photo-video", city: "Beograd", serviceType: "Foto + Video", website: "fototajna.com", instagram: "@fototajna_beograd" },
  { id: "pv-randjelovic", name: "Ranđelović Photography", category: "photo-video", city: "Beograd", serviceType: "Foto + Video", website: "randjelovicphotography.rs", instagram: "@randjelovicphotography" },
  { id: "pv-matijasevic", name: "Nemanja Matijašević", category: "photo-video", city: "Beograd", serviceType: "Foto", website: "nemanjamatijasevic.com", instagram: "@matijasevicphotography" },
  { id: "pv-spomenar", name: "Foto Spomenar", category: "photo-video", city: "Beograd", serviceType: "Foto", website: "fotospomenar.com", instagram: "@fotospomenar" },
  { id: "pv-stancic", name: "Mile Stančić", category: "photo-video", city: "Beograd", serviceType: "Foto + Video", website: "milestancic.com", instagram: "@mile_stancic" },
  { id: "pv-nikmatic", name: "Nikola Matić", category: "photo-video", city: "Beograd", serviceType: "Video", website: "nikolamatic.rs", instagram: "@nikmatic" },
  { id: "pv-spvideo", name: "SP Video", category: "photo-video", city: "Beograd", serviceType: "Video", website: "spvideo.rs" },
  { id: "pv-boban", name: "Boban Video", category: "photo-video", city: "Beograd", serviceType: "Video", website: "bobanvideo.com" },
  { id: "pv-flymedia", name: "FLY Media", category: "photo-video", city: "Beograd", serviceType: "Foto + Video", website: "flymedia.rs", instagram: "@flymedia.inc" },
  { id: "pv-industrija", name: "Industrija Studio", category: "photo-video", city: "Beograd", serviceType: "Foto + Video", website: "industrijastudio.rs", instagram: "@industrija.studio" },
  // ── Photo/Video: Novi Sad (6) ──
  { id: "pv-rakic", name: "Dejan Rakić", category: "photo-video", city: "Novi Sad", serviceType: "Foto", website: "dejanrakic.com", instagram: "@dejanrakicfot" },
  { id: "pv-rajic", name: "Foto Rajić", category: "photo-video", city: "Novi Sad", serviceType: "Foto", website: "fotorajic.com" },
  { id: "pv-bedov", name: "Aleksandar Bedov", category: "photo-video", city: "Novi Sad", serviceType: "Foto + Video", website: "abedov.com", instagram: "@aleksandarbedov" },
  { id: "pv-raskovic", name: "Saša Rašković", category: "photo-video", city: "Novi Sad", serviceType: "Foto", website: "sasaraskovic.com", instagram: "@sssashaa" },
  { id: "pv-vesic", name: "Monika Vesić", category: "photo-video", city: "Novi Sad", serviceType: "Foto", website: "monikavesic.rs", instagram: "@foto_monika" },
  { id: "pv-magic", name: "Magic Moments", category: "photo-video", city: "Novi Sad", serviceType: "Foto + Video", website: "magicmoments.rs", instagram: "@magic_moments_content" },
  // ── Photo/Video: Subotica (5) ──
  { id: "pv-danna", name: "Danna Slađana", category: "photo-video", city: "Subotica", serviceType: "Foto", website: "dannasladjana.com", instagram: "@dannasladjana" },
  { id: "pv-rafai", name: "Robert Rafai", category: "photo-video", city: "Subotica", serviceType: "Foto", website: "robertrafai.com", instagram: "@robertrafai" },
  { id: "pv-vasic", name: "Novica Vasić", category: "photo-video", city: "Subotica", serviceType: "Foto", website: "novicavasic.rs", instagram: "@novica.vasic" },
  { id: "pv-sokolovic", name: "Bojan Sokolović", category: "photo-video", city: "Subotica", serviceType: "Foto", website: "bojansokolovic.com", instagram: "@bojan_sokolovic" },
  { id: "pv-foto-svadbi-su", name: "Fotografisanje Svadbi SU", category: "photo-video", city: "Subotica", serviceType: "Foto", website: "fotografisanjesvadbisubotica.com" },
  // ── Photo/Video: Čačak (2) ──
  { id: "pv-samson", name: "Samson Studio", category: "photo-video", city: "Čačak", serviceType: "Foto + Video", website: "samsonmedia.rs", instagram: "@samsonprofilms" },
  { id: "pv-matrix", name: "Studio Matrix", category: "photo-video", city: "Čačak", serviceType: "Video", website: "matrixstudio.rs" },
  // ── Photo/Video: Kragujevac (4) ──
  { id: "pv-iris-kg", name: "IRIS Photo & Video", category: "photo-video", city: "Kragujevac", serviceType: "Foto + Video", website: "irisphotoandvideo.rs", instagram: "@irisphoto.art" },
  { id: "pv-art-kg", name: "Photo Studio ART", category: "photo-video", city: "Kragujevac", serviceType: "Foto" },
  { id: "pv-ivanovic", name: "Ivanović Photography", category: "photo-video", city: "Kragujevac", serviceType: "Foto + Video", website: "ivanovicphotography.com" },
  { id: "pv-creative", name: "Creative Vision", category: "photo-video", city: "Kragujevac", serviceType: "Foto + Video", website: "creativevision.rs", instagram: "@creativevisionprodukcija" },
  // ── Photo/Video: Niš (6) ──
  { id: "pv-gojkovic", name: "Jovan Gojković", category: "photo-video", city: "Niš", serviceType: "Foto", website: "mywed.com/jovangojkovic", instagram: "@jovan.gojkovic" },
  { id: "pv-mihajlo", name: "Photo by Mihajlo", category: "photo-video", city: "Niš", serviceType: "Foto", website: "photobymihajlo.rs", instagram: "@mihajlo.fotograf" },
  { id: "pv-iris-nis", name: "IRIS Photo Studio", category: "photo-video", city: "Niš", serviceType: "Foto + Video", website: "irisphotoandvideo.rs" },
  { id: "pv-vuckovic", name: "Pedja Vučković", category: "photo-video", city: "Niš", serviceType: "Foto", website: "pedjavuckovic.com", instagram: "@predragvuckovic" },
  { id: "pv-davinci", name: "Da Vinci Studios", category: "photo-video", city: "Niš", serviceType: "Foto + Video", website: "davincistudios.rs", instagram: "@da.vinci.studios" },
  { id: "pv-budimir", name: "Foto Video Budimir", category: "photo-video", city: "Niš", serviceType: "Foto + Video", website: "fotobudimir.com" },
  // ── Cakes: Beograd (5) ──
  { id: "c-tatina", name: "Tatina Slatka Kuća", category: "cake", city: "Beograd", phone: "064 7010260", website: "tatinaslatkakuca.rs", instagram: "@tatina_slatka_kuca" },
  { id: "c-dzoova", name: "Džoova Poslastičarnica", category: "cake", city: "Beograd", phone: "064/44-25-144", website: "dzoovaposlasticarnica.co.rs" },
  { id: "c-suzana", name: "Pekara Suzana", category: "cake", city: "Beograd", phone: "063 462 105", website: "pekarasuzana.rs", instagram: "@poslasticarnicasuzana1" },
  { id: "c-halo-torta", name: "Halo Torta", category: "cake", city: "Beograd", phone: "062 9756 078", website: "halotorta.com", instagram: "@halo_torta" },
  { id: "c-as-torte", name: "AS Torte", category: "cake", city: "Beograd", phone: "064/372-1121", website: "astorte.com", instagram: "@as_torte_official" },
  // ── Cakes: Novi Sad (5) ──
  { id: "c-valentino", name: "Valentino", category: "cake", city: "Novi Sad", phone: "062-175-78-34", website: "valentinotorte.com" },
  { id: "c-vremeplov", name: "Vremeplov Kolarijum", category: "cake", city: "Novi Sad", phone: "063-517-502", website: "vremeplov.net", instagram: "@vremeplov_kolacarijum" },
  { id: "c-021", name: "Poslastičarnica 021", category: "cake", city: "Novi Sad", phone: "066/864-2031", website: "poslasticarnica021.rs" },
  { id: "c-break4cake", name: "Break4Cake", category: "cake", city: "Novi Sad", phone: "063/860-12-43", website: "break4cake.rs", instagram: "@break_4_cake" },
  { id: "c-cecina-ns", name: "Cecina", category: "cake", city: "Novi Sad", phone: "063-860-8559", website: "cecina.rs", instagram: "@cecina_poslasticarnica_ns" },
  // ── Cakes: Subotica (3) ──
  { id: "c-cecina-su", name: "Cecina", category: "cake", city: "Subotica", phone: "063 860 8559", website: "cecina.rs", instagram: "@cecina_poslasticarnica" },
  { id: "c-madjarica", name: "Mađarica", category: "cake", city: "Subotica", phone: "060 5412280", website: "madjarica.com", instagram: "@madjaricadomacetorteikolaci" },
  { id: "c-dadine", name: "Dadine Poslastice", category: "cake", city: "Subotica", website: "dadineposlastice.com", instagram: "@dadine_poslastice" },
  // ── Cakes: Čačak (3) ──
  { id: "c-ignjo", name: "Torte Ignjo", category: "cake", city: "Čačak", phone: "064-126-2111", website: "tortecacak.com" },
  { id: "c-andjelcic", name: "Anđelčić", category: "cake", city: "Čačak", phone: "032 334 488", website: "andjelcic.rs" },
  { id: "c-dessert-ca", name: "Dessert Čačak", category: "cake", city: "Čačak", phone: "+381 32 311 300", website: "dessertcacak.rs", instagram: "@dessertcacak" },
  // ── Cakes: Kragujevac (3) ──
  { id: "c-nadalina", name: "Nadalina", category: "cake", city: "Kragujevac", phone: "+381 64 140 17 69", website: "nadalina.co.rs", instagram: "@nadalinakg" },
  { id: "c-fineti", name: "Fineti Premium", category: "cake", city: "Kragujevac", phone: "065/55-444-66", website: "fineti.net", instagram: "@finetislatkakuca" },
  { id: "c-srce", name: "Srce Sweets", category: "cake", city: "Kragujevac", phone: "+381 34 331 659", website: "srce-sweets.co.rs", instagram: "@srcekg" },
  // ── Cakes: Niš (4) ──
  { id: "c-mozart", name: "Mozart Torte", category: "cake", city: "Niš", phone: "+381 18 250777", website: "mozarttorte.co.rs", instagram: "@mozarttorte" },
  { id: "c-flert", name: "Torte Flert", category: "cake", city: "Niš", phone: "+381 60 0 22 66 77", website: "torteflert.rs", instagram: "@torteflert.nis" },
  { id: "c-dragana", name: "Dragana Torte", category: "cake", city: "Niš", website: "draganatorte.com", instagram: "@dragana_torte_matejevac" },
  { id: "c-lotos", name: "Caffe Poslastičara Lotos", category: "cake", city: "Niš", phone: "+381 18 565 565", website: "hotellotos.rs/torte-nis", instagram: "@lotos_caffeposlasticara" },
  // ── Flowers: Beograd (4) ──
  { id: "f-esperanca", name: "Cvećara Esperanca", category: "flowers", city: "Beograd", phone: "+381 66 645 46 44", website: "cvecaraesperanca.rs", instagram: "@cvecaraesperanca" },
  { id: "f-elite", name: "Cvećara Elite", category: "flowers", city: "Beograd", phone: "011/3165988", website: "cvecaraelite.rs", instagram: "@cvecara_elite" },
  { id: "f-sve-za-ljubav", name: "Sve Za Ljubav", category: "flowers", city: "Beograd", phone: "+381 63 8901-694" },
  { id: "f-dunjin-cvet", name: "Dunjin Cvet", category: "flowers", city: "Beograd", phone: "+381 11 268 2208", website: "dunjincvet.com" },
  // ── Flowers: Novi Sad (3) ──
  { id: "f-imela", name: "Cvećara Imela Dekor", category: "flowers", city: "Novi Sad", website: "imeladekor.rs" },
  { id: "f-florentin", name: "Cvećara Florentin", category: "flowers", city: "Novi Sad", phone: "+381 65 8050789", website: "florentin.rs", instagram: "@florentin.rs" },
  { id: "f-smokva", name: "Smokva Flower", category: "flowers", city: "Novi Sad", phone: "+381 63 7529962", website: "cvecarasmokva.rs" },
  // ── Flowers: Subotica (3) ──
  { id: "f-viola", name: "Cvećara Viola", category: "flowers", city: "Subotica", phone: "+381 24 522 360", website: "viola.rs", instagram: "@viola_flowers__" },
  { id: "f-buket", name: "Buket i Paket", category: "flowers", city: "Subotica", phone: "+381 24 580315", website: "buketipaket.com", instagram: "@buketipaket_su" },
  { id: "f-ikebana", name: "Cvećara Ikebana", category: "flowers", city: "Subotica", phone: "+381 24 558 221", website: "ikebana-subotica.rs" },
  // ── Flowers: Kragujevac (3) ──
  { id: "f-madame", name: "Cvećara Madame", category: "flowers", city: "Kragujevac", phone: "062/894-71-95", website: "cvecaramadame.rs", instagram: "@cvecara.madame" },
  { id: "f-oaza", name: "Cvećara Oaza", category: "flowers", city: "Kragujevac", phone: "0695012600", website: "cvecaraoaza.co.rs", instagram: "@cvecaraoaza" },
  { id: "f-exclusive-kg", name: "Cvetni Studio Exclusive", category: "flowers", city: "Kragujevac", phone: "+381 60 3801090" },
  // ── Flowers: Niš (3) ──
  { id: "f-agava", name: "Cvećara Agava", category: "flowers", city: "Niš", phone: "+381 18 521 682", website: "cvecaraagava.rs", instagram: "@cvecara_agava" },
  { id: "f-bello-fiore", name: "Bello Fiore", category: "flowers", city: "Niš", phone: "061 102 670 4", instagram: "@bellofiorenis" },
  { id: "f-fiori", name: "Cvećara Fiori", category: "flowers", city: "Niš", phone: "+381 62 549 744", instagram: "@fioriflowershop" },
  // ── Decoration: Beograd (7) ──
  { id: "d-tiki", name: "Tiki Dekoracije", category: "decoration", city: "Beograd", phone: "061 3456 774", website: "dekoracijezavencanja.rs", instagram: "@pozivnice_i_dekoracije" },
  { id: "d-myday", name: "Dekoracija My Day", category: "decoration", city: "Beograd", website: "dekoracijamyday.rs" },
  { id: "d-perlita", name: "Perlita", category: "decoration", city: "Beograd", website: "dekoracijavencanja.net" },
  { id: "d-bloom", name: "Bloom Design Studio", category: "decoration", city: "Beograd", phone: "+381 65 54 90 440", website: "bloomdesign.rs", instagram: "@bloomdesign_studio" },
  { id: "d-provansa", name: "Provansa Dekor", category: "decoration", city: "Beograd", phone: "+381 64 011 4422", website: "provansadekor.rs", instagram: "@provansadekor" },
  { id: "d-angie", name: "Angie Flowers Studio", category: "decoration", city: "Beograd", website: "angieflowers.rs", instagram: "@angie_flowers_studio" },
  { id: "d-mademoiselle", name: "Mademoiselle", category: "decoration", city: "Beograd", phone: "065/3536440", website: "mademoisellein.com" },
  // ── Decoration: Novi Sad (4) ──
  { id: "d-stem", name: "Studio STEM", category: "decoration", city: "Novi Sad", phone: "+381 63 541 151", website: "dekoracijestem.com", instagram: "@stem_weddings" },
  { id: "d-jana", name: "Studio Jana", category: "decoration", city: "Novi Sad", phone: "+381 64 004 4994", website: "studiojana.com", instagram: "@ph.studio.jana" },
  { id: "d-dream-lena", name: "Dream Wedding by Lena", category: "decoration", city: "Novi Sad", phone: "+381 63 536 542", website: "dreamweddingbylena.com", instagram: "@dreamweddingbylena" },
  { id: "d-artstyle", name: "Artstyle Dekoracije", category: "decoration", city: "Novi Sad" },
  // ── Decoration: Subotica (2) ──
  { id: "d-inamorana", name: "Inamorana", category: "decoration", city: "Subotica", phone: "+381 24 410-2682" },
  { id: "d-nika", name: "Nika Events", category: "decoration", city: "Subotica", phone: "024/670067", website: "nikaevents.rs", instagram: "@nikaevents.rs" },
  // ── Decoration: Čačak (2) ──
  { id: "d-arkadia", name: "Arkadia", category: "decoration", city: "Čačak", website: "arkadia.rs", instagram: "@arkadia.events" },
  { id: "d-arnika", name: "Cvećara Arnika", category: "decoration", city: "Čačak", phone: "0600 358 392", instagram: "@cvecara_arnika" },
  // ── Decoration: Kragujevac (1) ──
  { id: "d-sofijina", name: "Sofijina Dekoracija", category: "decoration", city: "Kragujevac", phone: "061 6395 762" },
  // ── Decoration: Niš (2) ──
  { id: "d-sirena", name: "Dekoracije Sirena", category: "decoration", city: "Niš", website: "dekoracije-sirena.com", instagram: "@dekoracijesirena.nis" },
  { id: "d-velvet", name: "Velvet Decor", category: "decoration", city: "Niš", phone: "0642670100", website: "velvetdecor.rs", instagram: "@velvet__decor" },
  // ── Fireworks: National (4) ──
  { id: "fx-pyro", name: "PYRO-TEAM", category: "fireworks", city: "Beograd", phone: "+381 64 50 15 888", website: "vatromet.rs", instagram: "@vatromet.rs" },
  { id: "fx-pirotehnika", name: "Pirotehnika Beograd", category: "fireworks", city: "Beograd", phone: "011/3166351", website: "beograd-pirotehnika.com", instagram: "@beogradpirotehnika" },
  { id: "fx-mirnovec", name: "Mirnovec", category: "fireworks", city: "Beograd", phone: "022 610 690", website: "mirnovec.rs", instagram: "@mirnovec_pirotehnika_" },
  { id: "fx-vatromet-shop", name: "Vatromet Shop", category: "fireworks", city: "Novi Sad", phone: "+381 64 11 96 577", website: "vatrometshop.com", instagram: "@vatromet_shop_novisad" },
  // ── Fireworks: Beograd effects (6) ──
  { id: "fx-bgsound", name: "BG Sound", category: "fireworks", city: "Beograd", phone: "069/398 43-58", website: "bgsound.net", instagram: "@bg.sound" },
  { id: "fx-demarko", name: "De Marko Light & Sound", category: "fireworks", city: "Beograd", phone: "063 77 20 662" },
  { id: "fx-exclusive-st", name: "Exclusive Studio", category: "fireworks", city: "Beograd", website: "exclusivestudio.rs" },
  { id: "fx-royal", name: "Royal Effects", category: "fireworks", city: "Beograd", website: "royaleffects.rs" },
  { id: "fx-specifik", name: "Specifik Design", category: "fireworks", city: "Beograd", website: "specifik.rs" },
  { id: "fx-ledena", name: "Ledena Fantazija", category: "fireworks", city: "Kragujevac", website: "ledenafantazija.rs" },
  // ── Fireworks: Novi Sad (3) ──
  { id: "fx-efekti-ns", name: "Specijalni Efekti NS", category: "fireworks", city: "Novi Sad", phone: "069 22 97 063", instagram: "@specijalni_efekti_dimnis" },
  { id: "fx-bws", name: "BWS Efekti", category: "fireworks", city: "Novi Sad", phone: "062 801 5049", instagram: "@baneweddingstudio" },
  { id: "fx-sime", name: "Sime doo", category: "fireworks", city: "Novi Sad", website: "sime.rs" },
  // ── Fireworks: Kragujevac (3) ──
  { id: "fx-efekti-kg", name: "Specijalni Efekti KR", category: "fireworks", city: "Kragujevac", phone: "065 702 296" },
  { id: "fx-bane", name: "Bane Wedding Studio", category: "fireworks", city: "Kragujevac", phone: "063 737 5382" },
  { id: "fx-gemini", name: "Gemini Special Effects", category: "fireworks", city: "Kragujevac", phone: "064/579 1446" },
  // ── Fireworks: Niš (1) ──
  { id: "fx-niski-dim", name: "Niški Dim", category: "fireworks", city: "Niš", phone: "066/649-003", website: "niskidimbl.com", instagram: "@niskidimbl" },
  // ── Dress: Beograd (9) ──
  { id: "dr-dar", name: "Salon Venčanica Dar", category: "dress", city: "Beograd", phone: "+381 62 515-987", website: "vencanice-dar.com", instagram: "@vencanice_dar" },
  { id: "dr-pepeljuga", name: "Pepeljuga", category: "dress", city: "Beograd", phone: "063 758 4149", website: "pepeljugavencanice.com", instagram: "@vencanice_pepeljuga" },
  { id: "dr-lovely", name: "LOVELY Bride", category: "dress", city: "Beograd", phone: "+381 64 5121 221", website: "lovelybridebeograd.com", instagram: "@lovely_concept_store" },
  { id: "dr-madam", name: "Salon MADAM", category: "dress", city: "Beograd", website: "vencanicemadam.com" },
  { id: "dr-odiva", name: "ODIVA", category: "dress", city: "Beograd", phone: "064 644 34 91", website: "vencanice.com", instagram: "@vencaniceodiva" },
  { id: "dr-bridal", name: "Bridal Boutique", category: "dress", city: "Beograd", phone: "060 1444 155", website: "bridalboutiquebeograd.com", instagram: "@bridalboutique_beograd" },
  { id: "dr-ramonda", name: "Venčanice Ramonda", category: "dress", city: "Beograd", phone: "063 11 01 739", website: "vencaniceramonda.com" },
  { id: "dr-lola", name: "Lola Venčanice", category: "dress", city: "Beograd", phone: "060 5070 270", website: "lolavencanice.rs", instagram: "@lola.vencanice" },
  { id: "dr-reina", name: "Reina en Ti", category: "dress", city: "Beograd", phone: "065 895-95-99", website: "reinaenti.rs" },
  // ── Dress: Novi Sad (3) ──
  { id: "dr-bella-ns", name: "Bella", category: "dress", city: "Novi Sad", phone: "021 520 779", website: "bella.rs", instagram: "@vencanicebella" },
  { id: "dr-en", name: "En Venčanice", category: "dress", city: "Novi Sad", phone: "064 299 4265", website: "en-vencanice.rs", instagram: "@en.vencanice" },
  { id: "dr-white-black", name: "White and Black", category: "dress", city: "Novi Sad" },
  // ── Dress: Subotica (2) ──
  { id: "dr-queenb", name: "Queen B", category: "dress", city: "Subotica", phone: "+381 69 611 911", website: "queenb.rs", instagram: "@vencanice_queen_b" },
  { id: "dr-donna", name: "Donna Butik", category: "dress", city: "Subotica", phone: "+381 24 531 135", website: "donnabutik.rs" },
  // ── Dress: Čačak (2) ──
  { id: "dr-bella-ca", name: "Bella (filijala)", category: "dress", city: "Čačak", phone: "021 520 779", website: "bella.rs", instagram: "@vencanicebella" },
  { id: "dr-bella-mia", name: "Bella Mia", category: "dress", city: "Čačak", phone: "064/309-1314" },
  // ── Dress: Kragujevac (3) ──
  { id: "dr-mariage", name: "MARIAGE", category: "dress", city: "Kragujevac", phone: "065 566 77 00", website: "mariage.rs", instagram: "@vencanice_mariage" },
  { id: "dr-blanche", name: "Blanche", category: "dress", city: "Kragujevac", website: "blanche.rs" },
  { id: "dr-glamour", name: "Glamour", category: "dress", city: "Kragujevac", instagram: "@vencanice_glamour" },
  // ── Dress: Niš (5) ──
  { id: "dr-ido", name: "I Do Salon", category: "dress", city: "Niš", phone: "067 7313 394", website: "ido.rs", instagram: "@i_do_salon_vencanica" },
  { id: "dr-lazaro", name: "Lazaro Venčanice", category: "dress", city: "Niš", phone: "069 5043 200", website: "lazarovencanice.rs", instagram: "@lazarovencanice" },
  { id: "dr-lily", name: "Lily Rose", category: "dress", city: "Niš", phone: "065/66-444-26" },
  { id: "dr-wedding-n", name: "Wedding Studio N", category: "dress", city: "Niš", website: "weddingstudion.com" },
  { id: "dr-blanche-ni", name: "Blanche (filijala)", category: "dress", city: "Niš", website: "blanche.rs" },
  // ── Makeup (12) ──
  { id: "mu-makeup-house", name: "Makeup House", category: "makeup", city: "Beograd", website: "makeuphouse.rs", instagram: "@makeuphousebgd" },
  { id: "mu-makeover", name: "Makeover Studio", category: "makeup", city: "Beograd", phone: "+381 65 22 88 588", website: "makeover.rs", instagram: "@makeover.rs" },
  { id: "mu-milena", name: "Milena Stević", category: "makeup", city: "Beograd", phone: "+381 69 2288588", website: "milenastevic.com", instagram: "@milenastevicmua" },
  { id: "mu-visnja", name: "Višnja Mikan", category: "makeup", city: "Novi Sad", phone: "064 300 8049", website: "sminkanjenovisad.com" },
  { id: "mu-mary", name: "Mary Makeup Studio", category: "makeup", city: "Novi Sad", phone: "060 4960664", website: "studiomary.rs", instagram: "@makeup____mary" },
  { id: "mu-sladjana", name: "Slađana Mikić", category: "makeup", city: "Novi Sad", phone: "063 168 0668" },
  { id: "mu-jelena", name: "Jelena Đurnić", category: "makeup", city: "Novi Sad" },
  { id: "mu-lazarevic", name: "Makeup Lazarević", category: "makeup", city: "Subotica", instagram: "@makeup_lazarevic" },
  { id: "mu-mr-beauty", name: "M.R. Beauty", category: "makeup", city: "Kragujevac", phone: "065 274 70 77", website: "mrbeautyconcept.com", instagram: "@marijaradovanovic_mrbeauty" },
  { id: "mu-stil", name: "Makeup Studio Stil", category: "makeup", city: "Niš", phone: "+381 18 217000", website: "frizerskisalonstil.rs", instagram: "@frizerskisalonstil" },
  { id: "mu-nikol", name: "Nikol Makeup", category: "makeup", city: "Niš", instagram: "@nikol.make.up" },
  { id: "mu-sminkanje-nis", name: "Šminkanje Niš", category: "makeup", city: "Niš", instagram: "@sminkanje.nis" },
  // ── Rings (17) ──
  { id: "r-babic", name: "Zlatara Babić", category: "rings", city: "Beograd", phone: "+381 11 354-44-22", website: "zlatarababic.rs", instagram: "@zlatarababic" },
  { id: "r-tanaskovic", name: "Zlatara Tanasković", category: "rings", city: "Beograd", phone: "+381 60 3731005", website: "zlataratanaskovic.com", instagram: "@zlatara.tanaskovic" },
  { id: "r-vuckovic", name: "Zlatara Vučković", category: "rings", city: "Beograd", website: "najlepseburme.rs" },
  { id: "r-personal", name: "Zlatara Personal", category: "rings", city: "Beograd", website: "personalzlatara.rs" },
  { id: "r-fiera", name: "Zlatara Fiera", category: "rings", city: "Beograd", website: "zlatarafiera.rs" },
  { id: "r-mitic-bg", name: "Zlatara Mitić", category: "rings", city: "Beograd", website: "miticdiamonds.rs" },
  { id: "r-siket", name: "Zlatara Siket", category: "rings", city: "Novi Sad", phone: "+381 21 6546-875", website: "zlatarasiket.com", instagram: "@zlatara_siket" },
  { id: "r-as", name: "Zlatara AS", category: "rings", city: "Novi Sad", website: "zlatara-as.rs" },
  { id: "r-stefanovic-ns", name: "Zlatara Stefanović 1886", category: "rings", city: "Novi Sad", website: "stefanovic1886.com" },
  { id: "r-rubin", name: "Zlatara Rubin", category: "rings", city: "Subotica", phone: "+381 65 533-532-5", website: "zlatararubin.com" },
  { id: "r-koral", name: "Koral Zlatara", category: "rings", city: "Subotica", phone: "024/551-153" },
  { id: "r-goldart", name: "Zlatara Gold Art", category: "rings", city: "Subotica", phone: "024 531338" },
  { id: "r-nenad", name: "Zlatara Nenad", category: "rings", city: "Čačak", phone: "066/344-471", website: "zlataranenad.rs", instagram: "@zlatara_nenad" },
  { id: "r-stefanovic-kg", name: "Zlatara Stefanović 1886", category: "rings", city: "Kragujevac", website: "stefanovic1886.com" },
  { id: "r-ljubic", name: "Zlatara Ljubić", category: "rings", city: "Kragujevac" },
  { id: "r-mitic-ni", name: "Zlatara Mitić", category: "rings", city: "Niš", website: "zlataramitic.rs" },
  { id: "r-unca", name: "Zlatara Unca", category: "rings", city: "Niš", website: "zlataraunca.rs" },
  // ── Gifts (10) ──
  { id: "g-concept", name: "Concept Beograd", category: "gifts", city: "Beograd", phone: "+381 62 269622", website: "conceptbeograd.com", instagram: "@concept.beograd" },
  { id: "g-giftic", name: "Giftic", category: "gifts", city: "Beograd", phone: "+381 617333890", website: "gifticbeograd.com", instagram: "@gift.icpokloni" },
  { id: "g-tiki", name: "Tiki Dekoracije", category: "gifts", city: "Beograd", phone: "061 3456 774", website: "dekoracijezavencanja.rs", instagram: "@pozivnice_i_dekoracije" },
  { id: "g-darlina", name: "Darlina", category: "gifts", city: "Beograd", website: "darlina.rs", instagram: "@darlina_pokloncici" },
  { id: "g-lotos", name: "Dekoracije Lotos", category: "gifts", city: "Beograd", website: "dekoracijelotos.rs" },
  { id: "g-arkadia", name: "Arkadia", category: "gifts", city: "Beograd", website: "arkadia.rs", instagram: "@arkadia.events" },
  { id: "g-pokloni-com", name: "Pokloni.COM", category: "gifts", city: "Subotica", website: "pokloni.com" },
  { id: "g-royal-su", name: "Royal Wedding Studio", category: "gifts", city: "Subotica", website: "royalsubotica.com" },
  { id: "g-pandora", name: "Pandora Srbija", category: "gifts", city: "Beograd", website: "pandorashop.rs" },
  { id: "g-sunmoon", name: "Sun, Moon & Stars", category: "gifts", city: "Beograd", website: "sunmoon-stars.com" },
];

export function getVendorsByCategory(category: VendorCategory): Vendor[] {
  return VENDORS.filter((v) => v.category === category);
}

export function getVendorsByCategoryAndCity(
  category: VendorCategory,
  city: string,
): Vendor[] {
  return VENDORS.filter((v) => v.category === category && v.city === city);
}

export function getCitiesForCategory(category: VendorCategory): string[] {
  const cities = new Set(
    VENDORS.filter((v) => v.category === category).map((v) => v.city),
  );
  return [...cities].sort();
}
