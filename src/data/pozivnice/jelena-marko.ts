import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "minimal_sage", // Options: "classic_rose" | "modern_mono" | "minimal_sage" | "luxury_gold" | "warm_terracotta"
  scriptFont: "parisienne", // Options: "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura" | "marck-script"

  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSebuARXf1ZQAAVnkkdxf6nvQZ7eGjWWT-f3WZENM_kioI-NuA/formResponse",
  entry_IDs: {
    name: "entry.1765465417",
    attending: "entry.1547193122",
    plusOnes: "entry.812322593",
    details: "entry.220510672",
  },
  useCyrillic: false,
  couple_names: {
    bride: "Jelena",
    groom: "Marko",
    full_display: "Jelena & Marko",
  },

  event_date: "2026-05-09T13:00:00",
  submit_until: "15. april 2026.",
  tagline:
    "Sa radošću vas pozivamo da budete deo dana koji će zauvek ostati u našim srcima.",

  locations: [
    {
      name: "Manastir Krusedol",
      time: "13:00",
      address: "Manastir Krušedol, Fruška gora",
      type: "church",
    },
    {
      name: "Vila Aurora",
      time: "17:00",
      address: "Put za Popovicu 12, Sremska Kamenica",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2810.5792000465503!2d19.848093376458802!3d45.21585007107096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b055a38bff881%3A0xeac8f00b8bb8dae9!2sAURORA!5e0!3m2!1ssr!2srs!4v1770119169188!5m2!1ssr!2srs",
      type: "hall",
    },
  ],

  timeline: [
    {
      title: "Crkveno venčanje",
      time: "13:00",
      description: "Manastir Krušedol",
      icon: "Church",
    },
    {
      title: "Okupljanje gostiju",
      time: "16:30",
      description: "Vila Aurora",
      icon: "HouseHeart",
    },
    {
      title: "Građansko venčanje",
      time: "17:00",
      description: "Vila Aurora",
      icon: "CalendarHeart",
    },
    {
      title: "Svečana večera i slavlje",
      time: "19:00",
      description: "Vila Aurora",
      icon: "PartyPopper",
    },
  ],

  countdown_enabled: true,
  map_enabled: false,
};

export default weddingData;
