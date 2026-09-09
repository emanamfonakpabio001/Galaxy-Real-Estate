import { CompanyConfig } from '../types';

export const company: CompanyConfig = {
  name: "GALAXY",
  logo: "https://imgur.com/uHj7q5k.png",
  tagline: "Find Your Space. Build Your Future.",
  phone: "08066154568",
  email: "info@galaxyrealestate.com",
  whatsapp: "2348066154568",
  address: "Plot 1408, Maitama District, Abuja, Nigeria",
  branches: [
    {
      city: "Abuja (HQ)",
      address: "Plot 1408, Aguiyi Ironsi Way, Maitama, Abuja",
      phone: "08066154568",
    },
    {
      city: "Lagos Office",
      address: "18A Ozumba Mbadiwe Avenue, Victoria Island, Lagos",
      phone: "08066154568",
    },
    {
      city: "Uyo Branch",
      address: "24 Ewet Housing Estate Road, Uyo, Akwa Ibom",
      phone: "08066154568",
    }
  ],
  businessHours: {
    weekdays: "Monday – Friday: 8:00 AM – 6:00 PM",
    saturday: "Saturday: 9:00 AM – 4:00 PM",
    sunday: "Sunday: Closed (Emergency Agent on Call)",
  },
  stats: {
    propertiesListed: "500+",
    happyClients: "350+",
    yearsExperience: "10+",
    clientSatisfaction: "95%",
    totalTransactions: "₦45B+",
  },
  socials: {
    facebook: "https://facebook.com/galaxyrealestateng",
    instagram: "https://instagram.com/galaxyrealestateng",
    linkedin: "https://linkedin.com/company/galaxy-real-estate-nigeria",
    tiktok: "https://tiktok.com/@galaxyrealestateng",
    twitter: "https://twitter.com/galaxyrealestateng",
  },
  formspreeEndpoint: "https://formspree.io/f/xkjnrqjn",
};

export const DEFAULT_WHATSAPP_MESSAGE = "Hello Galaxy, I am interested in your properties and would like to speak with an agent.";
