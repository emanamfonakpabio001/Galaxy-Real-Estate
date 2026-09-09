export type PropertyType = 
  | 'Villa'
  | 'Apartment'
  | 'Terrace Duplex'
  | 'Penthouse'
  | 'Detached Mansion'
  | 'House'
  | 'Duplex'
  | 'Land'
  | 'Commercial Property'
  | 'Commercial Office'
  | 'Office'
  | 'Warehouse'
  | 'Shop'
  | 'Other';

export type ListingStatus = 'For Sale' | 'For Rent' | 'Sold' | 'Rented' | 'Pending' | 'Draft';
export type TransactionType = 'For Sale' | 'For Rent' | 'Lease';

export interface PropertyAgent {
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  avatar: string;
  verified: boolean;
}

export interface PropertyImageRef {
  fileId: string; // GridFS file ID or URL
  url: string;    // Stream URL e.g. /api/media/:fileId or external URL
  filename?: string;
  altText?: string;
  caption?: string;
  isMain?: boolean;
}

export interface Property {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  location: {
    address: string;
    city: string;
    state: string;
    neighborhood: string;
    country: string;
  };
  price: number;
  currency?: string; // default NGN '₦'
  period?: 'year' | 'month'; // for rentals
  status: ListingStatus;
  type: PropertyType;
  transactionType?: TransactionType;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  sizeSqm: number;
  featured: boolean;
  published?: boolean;
  verified: boolean;
  shortDescription: string;
  fullDescription: string;
  images: string[]; // List of URLs or /api/media/:fileId
  imageDetails?: PropertyImageRef[];
  mainImage?: string;
  features: string[];
  yearBuilt?: number;
  agent: PropertyAgent;
  virtualTourAvailable?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  benefits: string[];
  image?: string;
  displayOrder?: number;
  published?: boolean;
}

export interface Testimonial {
  id: string;
  _id?: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  propertyPurchased?: string;
  date?: string;
  displayOrder?: number;
  published?: boolean;
}

export interface Branch {
  city: string;
  address: string;
  phone: string;
}

export interface CompanyConfig {
  name: string;
  logo: string;
  mobileLogo?: string;
  favicon?: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  defaultWhatsAppMessage?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  googleMapsLink?: string;
  branches: Branch[];
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  stats: {
    propertiesListed: string;
    happyClients: string;
    yearsExperience: string;
    clientSatisfaction: string;
    totalTransactions: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
    twitter: string;
  };
  footerText?: string;
  copyrightText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  formspreeEndpoint?: string;
}

export interface HomepageHero {
  badge?: string;
  title: string;
  subtitleAccent?: string;
  subtitle: string;
  backgroundImage: string;
  exploreButtonText?: string;
  contactButtonText?: string;
}

export interface HomepageStatItem {
  label: string;
  value: string;
}

export interface HomepageWhyChooseItem {
  title: string;
  description: string;
  icon?: string;
}

export interface HomepageCTA {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
}

export interface HomepageContent {
  heroHeading?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  hero: HomepageHero;
  whyChooseHeading?: string;
  whyChooseDescription?: string;
  whyChoosePoints?: HomepageWhyChooseItem[];
  whyChoose: HomepageWhyChooseItem[];
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaSection: HomepageCTA;
  stats: HomepageStatItem[];
}

export interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  coreValues?: {
    title: string;
    description: string;
  }[];
  values: {
    title: string;
    description: string;
  }[];
  image?: string;
  images: string[];
  additionalSections?: {
    id: string;
    heading: string;
    content: string;
    image?: string;
  }[];
}

export interface SEOConfig {
  websiteTitle?: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  defaultKeywords?: string;
  keywords: string[];
  propertySeoTitle: string;
  propertySeoDescription: string;
  socialSharingImage?: string;
}

export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed';

export interface Inquiry {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertySlug?: string;
  status: InquiryStatus;
  date: string;
  createdAt: string;
  notes?: string;
}

export interface ActivityLogItem {
  id: string;
  _id?: string;
  action: string;
  user: string;
  timestamp: string;
  date: string;
  time: string;
  affectedItem?: string;
  details?: string;
}

export interface MediaFileMetadata {
  id: string;
  _id?: string;
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: string;
  category: 'Property' | 'Homepage' | 'About' | 'Services' | 'Testimonials' | 'Logo' | 'Favicon' | 'Other';
  altText?: string;
  caption?: string;
  propertyId?: string;
  originalFileId?: string;
  editedFromFileId?: string;
  url: string;
  usedBy?: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor';
  avatar?: string;
  lastLogin?: string;
}

export interface NavigationItem {
  id: string;
  _id?: string;
  label: string;
  url: string;
  displayOrder: number;
  visible: boolean;
  externalLink: boolean;
}

export interface FilterCriteria {
  searchTerm: string;
  city: string;
  propertyType: string;
  status: string; // 'all' | 'For Sale' | 'For Rent'
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // 'all' | '1' | '2' | '3' | '4' | '5+'
  bathrooms: string; // 'all' | '1' | '2' | '3+'
  amenities: string[];
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bedrooms';
}

export type FilterState = Partial<FilterCriteria>;
