import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "minimal",

  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSeAhevdOrCIPXGvvOU-fmwm8g5BHFK-7uU-PuA97aYZMLbSBQ/formResponse",
  entry_IDs: {
    name: "entry.390802369",
    attending: "entry.1092075394",
    plusOnes: "entry.201124745",
    details: "entry.934802230",
  },

  couple_names: {
    bride: "Anastasija",
    groom: "Jovan",
    full_display: "Anastasija & Jovan",
  },
  event_date: "2026-06-06T15:00:00",
  tagline: "Započnimo naše zajedničko poglavlje uz vaše prisustvo i osmehe.",
  locations: [
    {
      name: "Restoran 'Zlatni Venac'",
      time: "17:00",
      address: "Bulevar Kralja Aleksandra 123, Beograd",
      lat: 44.8125,
      lng: 20.4612,
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.222728952445!2d20.4612!3d44.8125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475a7ab45347394d%3A0xc34a65a78280f2d4!2sBelgrade!5e0!3m2!1sen!2srs!4v1690000000000!5m2!1sen!2srs",
      type: "hall",
    },
  ],
  timeline: [
    {
      title: "Okupljanje svatova",
      time: "12:00",
      description: "Kod mladoženje",
      icon: "Users",
    },
    {
      title: "Crkveno venčanje",
      time: "15:00",
      description: "Hram Svetog Save",
      icon: "Church",
    },
    {
      title: "Svečana večera i proslava",
      time: "18:00",
      description: "Prvi ples i zabava do zore",
      icon: "Music",
    },
  ],
  countdown_enabled: true,
  map_enabled: true,
};

export default weddingData;
