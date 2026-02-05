import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "luxury", // Options: "classic" | "modern" | "minimal" | "luxury"
  scriptFont: "bad-script", // Options: "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura" | "marck-script" | "caveat" | "bad-script"

  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSebuARXf1ZQAAVnkkdxf6nvQZ7eGjWWT-f3WZENM_kioI-tTt/formResponse",
  entry_IDs: {
    name: "entry.1765465417",
    attending: "entry.1547193122",
    plusOnes: "entry.812322593",
    details: "entry.220510672",
  },

  useCyrillic: true,
  couple_names: {
    bride: "Марина",
    groom: "Александар",
    full_display: "Марина & Александар",
  },

  event_date: "2026-06-06T14:00:00",
  submit_until: "20. август 2026.",
  tagline:
    "Са великом радошћу вас позивамо да својим присуством увеличате почетак нашег заједничког живота.",

  locations: [
    {
      name: "Манастир Гргетег",
      time: "14:00",
      address: "Манастир Гргетег, Фрушка гора",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1dexampleGrgeteg123!2d19.733214!3d45.145678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xexample!2sМанастир%20Гргетег!5e0!3m2!1ssr!2srs!4v1666666666666",
      type: "church",
    },
    {
      name: "Етно сала Златни брег",
      time: "18:00",
      address: "Пут за Поповицу 45, Сремска Каменица",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1dexampleHall999!2d19.842345!3d45.229876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xexample!2sЗлатни%20брег!5e0!3m2!1ssr!2srs!4v1555555555555",
      type: "hall",
    },
  ],

  timeline: [
    {
      title: "Црквено венчање",
      time: "14:00",
      description: "Манастир Гргетег",
      icon: "Church",
    },
    {
      title: "Долазак гостију",
      time: "17:00",
      description: "Етно сала Златни брег",
      icon: "HouseHeart",
    },
    {
      title: "Грађанско венчање",
      time: "18:00",
      description: "Етно сала Златни брег",
      icon: "CalendarHeart",
    },
    {
      title: "Свечана прослава",
      time: "20:00",
      description: "Етно сала Златни брег",
      icon: "PartyPopper",
    },
  ],

  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
