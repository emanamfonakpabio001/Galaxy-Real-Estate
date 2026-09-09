import { ServiceItem } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'property-sales',
    title: 'Property Sales',
    subtitle: 'Acquire verified prime real estate across Nigeria with complete legal security.',
    description: 'We guide individuals, families, and corporate investors through the process of acquiring premium residential and commercial properties with verified land titles, Governor’s Consent, and clear C of O (Certificate of Occupancy).',
    iconName: 'Building2',
    benefits: [
      'Comprehensive title verification & due diligence',
      'Exclusive access to off-market luxury listings',
      'End-to-end legal conveyancing & deed transfer',
      'Negotiation advocacy ensuring best market rates',
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'property-rentals',
    title: 'Property Rentals',
    subtitle: 'Connecting discerning tenants with quality residential and commercial spaces.',
    description: 'From executive waterfront penthouses in Ikoyi to serene family villas in Maitama and high-traffic corporate offices in Victoria Island, we match clients with premium leased properties that suit their lifestyle and operational needs.',
    iconName: 'KeyRound',
    benefits: [
      'Curated selection of serviced & secured residences',
      'Transparent tenancy agreements & inventory checks',
      'Fast-track vetting & instant move-in coordination',
      'Corporate lease structuring for expatriates & firms',
    ],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'property-management',
    title: 'Property Management',
    subtitle: 'Comprehensive asset care and yield optimization for property owners and diaspora investors.',
    description: 'We relieve property owners and international diaspora investors of the daily operational burden. Our turnkey management services protect asset value, ensure steady rental cash flow, and maintain pristine property condition.',
    iconName: 'ShieldCheck',
    benefits: [
      'Rigorous tenant screening & prompt rent remittance',
      'Routine maintenance, facility repairs & utility management',
      'Quarterly detailed financial & physical inspection reports',
      '24/7 on-call emergency facility support team',
    ],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'real-estate-investment',
    title: 'Real Estate Investment',
    subtitle: 'High-yield opportunities and strategic capital growth advisory in Nigeria’s fastest-growing corridors.',
    description: 'Our research-driven investment advisory identifies high-appreciation land, off-plan residential developments, and commercial real estate assets in high-growth corridors across Abuja, Lagos, and emerging urban hubs.',
    iconName: 'TrendingUp',
    benefits: [
      'Data-driven feasibility studies & cash flow projections',
      'Fractional & joint-venture syndicate opportunities',
      'Guaranteed high-capital appreciation & rental yield advisory',
      'Exit strategy formulation & asset portfolio restructuring',
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
];
