import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "classic", // Options: "classic" | "modern" | "minimal" | "luxury"
  scriptFont: "marck-script", // Options: "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura" | "marck-script"

  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSebuARXf1ZQAAVnkkdxf6nvQZ7eGjWWT-f3WZENM_kioI-NuA/formResponse",
  entry_IDs: {
    name: "entry.1765465417",
    attending: "entry.1547193122",
    plusOnes: "entry.812322593",
    details: "entry.220510672",
  },

  useCyrillic: true,
  couple_names: {
    bride: "Анастасија",
    groom: "Јован",
    full_display: "Анастасија & Јован",
  },
  event_date: "2026-09-13T16:00:00",
  submit_until: "31. Августа 2026.",
  tagline: "Започнимо наше ново животно поглавље уз ваше присуство и осмехе!",
  locations: [
    {
      name: "Арена Илић",
      time: "16:00",
      address: "Жарка Зрењанина 119А, Бачка Паланка",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2808.486728927188!2d19.385624776497636!3d45.25817097107139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b7b8f1d1d791b%3A0x458fdc942b1327f2!2sArena%20Ili%C4%87!5e0!3m2!1ssr!2srs!4v1770064113473!5m2!1ssr!2srs",
      type: "hall",
    },
  ],
  timeline: [
    // {
    //   title: "Okupljanje svatova",
    //   time: "12:00",
    //   description: "Kod mladoženje",
    //   icon: "Users",
    // },
    {
      title: "Скуп сватова у свечаној сали",
      time: "16:00",
      description: "Арена Илић",
      icon: "HouseHeart",
    },
    {
      title: "Градско венчање",
      time: "17:30",
      description: "Арена Илић",
      icon: "CalendarHeart",
    },
  ],
  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
