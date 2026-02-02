import { WeddingData } from "@/app/pozivnica/[slug]/types";

const weddingData: WeddingData = {
  theme: "luxury",
  rsvp_form_url:
    "https://docs.google.com/forms/d/e/1FAIpQLSeAhevdOrCIPXGvvOU-fmwm8g5BHFK-7uU-PuA97aYZMLbSBQ/formResponse",
  entry_IDs: {
    name: "entry.390802369",
    attending: "entry.1092075394",
    plusOnes: "entry.201124745",
    details: "entry.934802230",
  },
  couple_names: {
    bride: "Emilija",
    groom: "Aleksa",
    full_display: "Emilija & Aleksa",
  },
  event_date: "2026-08-29T16:00:00",
  tagline: "Započnimo naše zajedničko poglavlje uz vaše prisustvo i osmehe.",
  locations: [
    {
      name: "Restoran 'Lovac'",
      time: "16:00",
      address: "Bijelopoljski put, Prijepolje",
      lat: 43.3589103,
      lng: 19.6318782,
      map_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4375.355971607174!2d19.631878159032006!3d43.35891031491742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4757ff3567435da5%3A0x15e675dba5eb705c!2sRestoran%20Lovac!5e0!3m2!1sen!2srs!4v1770037670815!5m2!1sen!2srs",
      type: "hall",
    },
  ],
  timeline: [
    {
      title: "Okupljanje svatova",
      time: "12:00",
      description: "Kod kuće",
      icon: "Users",
    },
    {
      title: "Crkveno venčanje",
      time: "13:00",
      description: "manastir Mileševa",
      icon: "Church",
    },
    {
      title: "Građansko venčanje",
      time: "16:00",
      description: "Restoran 'Lovac'",
      icon: "Heart",
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
