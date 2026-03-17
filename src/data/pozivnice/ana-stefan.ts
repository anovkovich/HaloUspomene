import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "classic_rose",
  scriptFont: "bad-script", // great-vibes, dancing-script, alex-brush, parisienne, allura, marck-script
  useCyrillic: true,
  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSdiQ1LSoOJ9nb1oATP2qbC2hv2US3wjZ28JNpSIbpKG3VCjuQ/formResponse",
  responses_spreadsheet_id: "1LBi98SA4HoKnNnwAlODo7toA9H0hn5dWIhJvI0rp9Bk",
  potvrde_password: "Stefan1503",
  entry_IDs: {
    name: "entry.390802369",
    attending: "entry.1092075394",
    plusOnes: "entry.201124745",
    details: "entry.934802230",
  },
  couple_names: { bride: "Ана", groom: "Стефан", full_display: "Ана & Стефан" },
  event_date: "2026-06-06T15:30",
  submit_until: "2026-05-15",
  tagline:
    "Најлепши тренуци су они које делимо са драгим људима – зато желимо да будете део нашег посебног дана.",
  thankYouFooter: "Хвала Вам што сте део наше среће",
  locations: [
    {
      name: "Кристал",
      time: "15:30",
      address: "Иве Лоле Рибара 4a, Ветерник",
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2808.9092041555573!2d19.748903776467852!3d45.24962877107129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b1201f2d37955%3A0xcd9734f26bc780fc!2sSve%C4%8Dana%20sala%20Kristal!5e0!3m2!1ssr!2srs!4v1773348392624!5m2!1ssr!2srs",
      type: "hall",
    },
  ],
  timeline: [
    {
      title: "Скуп сватова код младожење",
      time: "11h",
      description: "",
      icon: "Home",
    },
    {
      title: "Скуп сватова код младе",
      time: "12h",
      description: "",
      icon: "Home",
    },
    {
      title: "Црква Светог апостола Петра и Павла",
      time: "14h",
      description: "Rumenka, Novi Sad",
      icon: "Church",
    },
    {
      title: "Свечана сала - Кристал",
      time: "15:30",
      description: "Иве Лоле Рибара 4a, Ветерник",
      icon: "Utensils",
    },
  ],
  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
