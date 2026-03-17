import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  paid_for_raspored: true, // Unlocks full seating chart (default: false = demo, 1 seat only)
  theme: "luxury_gold", // Options: "classic_rose" | "modern_mono" | "minimal_sage" | "luxury_gold" | "warm_terracotta"
  scriptFont: "alex-brush", // Options: "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura"
  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSeAhevdOrCIPXGvvOU-fmwm8g5BHFK-7uU-PuA97aYZMLbSBQ/formResponse",
  responses_spreadsheet_id: "1VtyQwaXLGLO_ZwifmBa90XPd03IR3sArAkD89hwQioU",
  potvrde_password: "Aleksa2908",
  entry_IDs: {
    name: "entry.390802369",
    attending: "entry.1092075394",
    plusOnes: "entry.201124745",
    details: "entry.934802230",
  },
  couple_names: {
    bride: "Ana",
    groom: "Dejan",
    full_display: "Ana & Dejan",
  },
  event_date: "2026-05-10T16:00:00",
  submit_until: "2026-03-17",
  tagline: "Započnimo naše zajedničko poglavlje uz vaše prisustvo i osmehe.",
  locations: [
    {
      name: "Restoran Beli Dvori",
      time: "16:00",
      address: "Veternik, Novi Sad",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31780.086267101422!2d19.731947039943478!3d45.24800886962036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b11e4aa078d07%3A0xb1249b145a24970f!2sRestoran%20Beli%20Dvori!5e0!3m2!1ssr!2srs!4v1773758419653!5m2!1ssr!2srs",
      type: "hall",
    },
  ],
  timeline: [
    {
      title: "Okupljanje svatova",
      time: "13:00",
      description: "Kod mladoženjine kuće",
      icon: "Users",
    },
    {
      title: "Crkveno venčanje",
      time: "15:00",
      description: "Crkva Ćirila i Metodija",
      icon: "Church",
    },
    {
      title: "Skup svatova u svečanoj sali",
      time: "16:00",
      description: "Restoran 'Beli Dvori'",
      icon: "CalendarHeart",
    },
    {
      title: "Građansko venčanje",
      time: "17:00",
      description: "Restoran 'Beli Dvori'",
      icon: "Heart",
    },
  ],
  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
