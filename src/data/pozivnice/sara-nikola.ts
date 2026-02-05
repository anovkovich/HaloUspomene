import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "classic", // Options: "classic" | "modern" | "minimal" | "luxury"
  scriptFont: "great-vibes", // Options: "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura" | "marck-script" | "caveat" | "bad-script"

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
    bride: "Sara",
    groom: "Nikola",
    full_display: "Sara & Nikola",
  },
  event_date: "2026-05-16T16:30:00",
  submit_until: "1. Maj 2026.",
  tagline:
    "Radujemo se da zajedno sa vama proslavimo početak našeg zajedničkog puta.",

  locations: [
    {
      name: "Sala Exclusive NS",
      time: "16:30",
      address: "Bulevar vojvode Stepe 52, Novi Sad",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44937.85761618806!2d19.717111587524425!3d45.25555527789208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b11c735e2984f%3A0x8e392f6165dae5e!2sExclusive%20NS!5e0!3m2!1ssr!2srs!4v1770118655831!5m2!1ssr!2srs",
      type: "hall",
    },
  ],

  timeline: [
    {
      title: "Okupljanje gostiju",
      time: "16:30",
      description: "Sala Elegance",
      icon: "HouseHeart",
    },
    {
      title: "Građansko venčanje",
      time: "18:00",
      description: "Sala Elegance",
      icon: "CalendarHeart",
    },
    {
      title: "Svečana večera i slavlje",
      time: "19:00",
      description: "Sala Elegance",
      icon: "PartyPopper",
    },
  ],

  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
