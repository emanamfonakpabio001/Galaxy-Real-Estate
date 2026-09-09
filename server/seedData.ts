import { SAMPLE_PROPERTIES } from '../src/data/properties';
import { SAMPLE_SERVICES, SAMPLE_TESTIMONIALS } from '../src/data/servicesAndTestimonials';
import { company } from '../src/config/company';

export const initialAdmin = {
  email: 'admin@galaxyrealestate.com',
  name: 'Galaxy Administrator',
  role: 'superadmin',
  avatar: 'https://i.imgur.com/uHj7q5k.png',
  createdAt: new Date().toISOString(),
};

export const initialHomepage = {
  heroHeading: 'Discover Exclusive Luxury Properties in Nigeria',
  heroSubtitle: 'Connecting high-net-worth individuals, diaspora investors, and modern families with verified premium homes, luxury villas, and high-yield real estate assets.',
  heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
  heroButtonText: 'Explore Portfolio',
  heroButtonLink: '#properties',
  hero: {
    badge: 'Nigeria’s Premier Luxury Real Estate Marketplace',
    title: 'Find a Place You’ll Love To Call Home.',
    subtitleAccent: 'Curated for the Discerning Elite',
    subtitle: 'Connecting high-net-worth individuals, diaspora investors, and modern families with verified premium homes, luxury villas, and high-yield real estate assets.',
    backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85',
    exploreButtonText: 'Explore Properties',
    contactButtonText: 'Contact an Agent',
  },
  whyChooseHeading: 'Why Discerning Clients Choose Galaxy Real Estate',
  whyChooseDescription: 'With over a decade of verified real estate transactions in Abuja, Lagos, and high-growth Nigerian capitals, Galaxy Real Estate provides unmatched discretion, legal safety, and architectural excellence.',
  whyChoosePoints: [
    {
      title: '100% Verified Legal Titles',
      description: 'Every property in our portfolio undergoes rigorous title searches at Lands Registry, AGIS, and State Land Ministries to ensure zero encumbrances or third-party disputes.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Direct Developer & Owner Access',
      description: 'Avoid inflated intermediary markups with direct access to prime architectural developments, private estates, and luxury penthouses.',
      icon: 'KeyRound',
    },
    {
      title: 'Dedicated Client Care & Concierge',
      description: 'From physical and live virtual walkthroughs to legal closing and keys handover, your personal Galaxy advisor is available around the clock.',
      icon: 'Headphones',
    },
    {
      title: 'High Capital Appreciation Corridors',
      description: 'We curate properties situated in top-tier growth zones in Maitama, Ikoyi, Banana Island, Guzape, and Eko Atlantic City with proven annual ROI.',
      icon: 'TrendingUp',
    },
  ],
  whyChoose: [
    {
      title: '100% Verified Legal Titles',
      description: 'Every property in our portfolio undergoes rigorous title searches at Lands Registry, AGIS, and State Land Ministries to ensure zero encumbrances or third-party disputes.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Direct Developer & Owner Access',
      description: 'Avoid inflated intermediary markups with direct access to prime architectural developments, private estates, and luxury penthouses.',
      icon: 'KeyRound',
    },
    {
      title: 'Dedicated Client Care & Concierge',
      description: 'From physical and live virtual walkthroughs to legal closing and keys handover, your personal Galaxy advisor is available around the clock.',
      icon: 'Headphones',
    },
    {
      title: 'High Capital Appreciation Corridors',
      description: 'We curate properties situated in top-tier growth zones in Maitama, Ikoyi, Banana Island, Guzape, and Eko Atlantic City with proven annual ROI.',
      icon: 'TrendingUp',
    },
  ],
  ctaHeading: 'Ready to Acquire Your Next Luxury Property in Nigeria?',
  ctaDescription: 'Speak with our senior luxury property specialists today for bespoke private viewings, off-market opportunities, or personalized property investment advisory.',
  ctaButtonText: 'Schedule Private Consultation',
  ctaButtonLink: '#contact',
  ctaSection: {
    title: 'Ready to Acquire Your Next Luxury Property in Nigeria?',
    subtitle: 'Speak with our senior luxury property specialists today for bespoke private viewings, off-market opportunities, or personalized property investment advisory.',
    buttonText: 'Schedule Private Consultation',
    buttonLink: '#contact',
  },
  stats: [
    { label: 'Active Listings', value: '500+' },
    { label: 'Properties Brokered', value: '₦45B+' },
    { label: 'Satisfied Clients', value: '1,200+' },
    { label: 'Years of Excellence', value: '10+' },
  ],
};

export const initialAbout = {
  title: 'Pioneering Luxury Real Estate Across Nigeria',
  subtitle: 'Galaxy Real Estate is a premier real estate brokerage and development advisory firm committed to redefining modern living standards in West Africa.',
  description: 'Founded with a vision to deliver world-class real estate experiences, Galaxy Real Estate has grown into one of Nigeria’s most trusted real estate companies. Headquartered in Abuja with offices in Lagos and Uyo, our multidisciplinary team of property specialists, architects, surveyors, and legal advisors brings profound market intelligence and integrity to every transaction.',
  mission: 'To deliver transparent, seamless, and high-yield real estate solutions that empower individuals and institutions to build generational wealth and enjoy unmatched living comfort.',
  vision: 'To be Africa’s premier luxury real estate ecosystem, recognized globally for architectural distinction, ethical brokerage, and client-first excellence.',
  coreValues: [
    {
      title: 'Integrity & Transparency',
      description: 'We prioritize honest advisory and zero hidden costs in all our property transactions and valuation assessments.',
    },
    {
      title: 'Architectural Excellence',
      description: 'We exclusively list properties characterized by superior structural integrity, modern aesthetics, and top-tier finishes.',
    },
    {
      title: 'Client Discretion',
      description: 'High-net-worth individuals, diplomatic corps, and corporate institutions trust us for utmost privacy and security.',
    },
    {
      title: 'Innovation & Smart Living',
      description: 'We champion sustainable, solar-integrated, and smart-automated homes designed for 21st-century comfort.',
    },
  ],
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  additionalSections: [
    {
      id: 'sec-1',
      heading: 'Our Nationwide Presence',
      content: 'With strategic hubs in Abuja (Federal Capital Territory), Lagos (Commercial Financial Epicenter), and Uyo (South-South Energy Hub), we provide localized insight with institutional-grade standards.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    },
  ],
};

export const initialSettings = {
  name: company.name,
  logo: company.logo,
  mobileLogo: company.logo,
  favicon: '/favicon.ico',
  tagline: company.tagline,
  phone: company.phone,
  email: company.email,
  whatsapp: company.whatsapp,
  defaultWhatsAppMessage: 'Hello Galaxy Real Estate, I am interested in one of your properties and would like to speak with an agent.',
  address: company.address,
  city: 'Abuja',
  state: 'FCT',
  country: 'Nigeria',
  googleMapsLink: 'https://maps.google.com/?q=Maitama+Abuja+Nigeria',
  branches: company.branches,
  businessHours: company.businessHours,
  stats: company.stats,
  socials: company.socials,
  footerText: 'Galaxy Real Estate is Nigeria’s leading luxury property brokerage and investment firm, delivering exceptional residential and commercial real estate solutions.',
  copyrightText: `© ${new Date().getFullYear()} Galaxy Real Estate. All rights reserved.`,
  primaryColor: '#0B1F3A',
  secondaryColor: '#D4A84F',
};

export const initialSEO = {
  websiteTitle: 'Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria',
  metaTitle: 'Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria',
  metaDescription: 'Browse verified luxury houses, modern penthouses, villas, and prime plots of land for sale and rent in Abuja, Lagos, Port Harcourt, and Uyo with Galaxy Real Estate.',
  ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  defaultKeywords: 'real estate nigeria, luxury homes abuja, lagos penthouses, property for sale nigeria, maitama villa, banana island mansion, galaxy real estate',
  keywords: ['real estate nigeria', 'luxury homes abuja', 'lagos penthouses', 'property for sale nigeria', 'maitama villa', 'banana island mansion', 'galaxy real estate', 'abuja luxury real estate', 'nigeria property investment'],
  propertySeoTitle: '{title} | Galaxy Real Estate Nigeria',
  propertySeoDescription: '{shortDescription} Located in {city}, Nigeria. Listed at {price}. Contact Galaxy Real Estate for viewing.',
  socialSharingImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
};

export const initialNavigation = [
  { id: 'nav-1', label: 'Home', url: '/', displayOrder: 1, visible: true, externalLink: false },
  { id: 'nav-2', label: 'Properties', url: '/#properties', displayOrder: 2, visible: true, externalLink: false },
  { id: 'nav-3', label: 'About Us', url: '/#about', displayOrder: 3, visible: true, externalLink: false },
  { id: 'nav-4', label: 'Services', url: '/#services', displayOrder: 4, visible: true, externalLink: false },
  { id: 'nav-5', label: 'Testimonials', url: '/#testimonials', displayOrder: 5, visible: true, externalLink: false },
  { id: 'nav-6', label: 'Contact', url: '/#contact', displayOrder: 6, visible: true, externalLink: false },
];

export const initialProperties = SAMPLE_PROPERTIES.map(p => ({
  ...p,
  currency: '₦',
  transactionType: p.status === 'For Rent' ? 'For Rent' : 'For Sale',
  published: true,
  mainImage: p.images[0] || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const initialServices = SAMPLE_SERVICES.map((s, idx) => ({
  ...s,
  displayOrder: idx + 1,
  published: true,
}));

export const initialTestimonials = SAMPLE_TESTIMONIALS.map((t, idx) => ({
  ...t,
  displayOrder: idx + 1,
  published: true,
}));
