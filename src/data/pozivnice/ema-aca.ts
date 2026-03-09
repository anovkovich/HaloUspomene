import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "romance_wine",
  scriptFont: "caveat",
  useCyrillic: true,
  rsvp_form_url: "TODO",
  entry_IDs: {
    name: "entry.TODO",
    attending: "entry.TODO",
    plusOnes: "entry.TODO",
    details: "entry.TODO",
  },
  couple_names: { bride: "Ema", groom: "Aca", full_display: "Ema & Aca" },
  event_date: "2026-08-29T16:00",
  submit_until: "2. Avgusta 2026.",
  tagline: "Otvorimo novo poglavlje na najlepsi nacin",
  thankYouFooter: "Hvala sto ulepsavate nase vencanje!",
  locations: [
    {
      name: "Restroran Lovac",
      time: "16:00",
      address: "",
      map_url: "TODO",
      type: "hall",
    },
  ],
  timeline: [
    {
      title: "Manastir Mileseva",
      time: "13:00",
      description: "",
      icon: "Church",
    },
    { title: "Restoran Lovac", time: "17:30", description: "", icon: "Heart" },
    {
      title: "Restroran Lovac",
      time: "16:00",
      description: "",
      icon: "Utensils",
    },
  ],
  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
