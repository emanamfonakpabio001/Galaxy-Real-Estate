import React from 'react';
import { ArrowRight, PhoneCall, ShieldCheck, Award, Sparkles, Building2 } from 'lucide-react';
import { PropertySearch } from './PropertySearch';
import { FilterCriteria, HomepageContent, CompanyConfig } from '../types';
import { company } from '../config/company';

interface HeroProps {
  onSearch: (filters: Partial<FilterCriteria>) => void;
  onExploreClick: () => void;
  onContactClick: () => void;
  content?: HomepageContent | null;
  companyConfig?: CompanyConfig | null;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onExploreClick,
  onContactClick,
  content,
  companyConfig,
}) => {
  const currentCompany = companyConfig || company;
  
  // Dynamic fields with graceful fallbacks
  const bgImage = content?.hero?.backgroundImage || content?.heroImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85";
  const badgeText = content?.hero?.badge || currentCompany.tagline || "Nigeria’s Premier Luxury Real Estate Marketplace";
  const headline = content?.hero?.title || content?.heroHeading || "Find a Place You'll Love To Call Home.";
  const subtitleAccent = content?.hero?.subtitleAccent || "";
  const subtitle = content?.hero?.subtitle || content?.heroSubtitle || "Discover exceptional properties, premium homes, and investment opportunities with Galaxy.";
  const exploreBtnText = content?.hero?.exploreButtonText || content?.heroButtonText || "Explore Properties";
  const contactBtnText = content?.hero?.contactButtonText || "Contact an Agent";

  // Dynamic extraction of stats from content
  const getStatValue = (labelKeyword: string, fallback: string): string => {
    if (Array.isArray(content?.stats)) {
      const match = content.stats.find(s => s.label.toLowerCase().includes(labelKeyword.toLowerCase()));
      if (match && match.value) return match.value;
    } else if (content?.stats && typeof content.stats === 'object') {
      const obj = content.stats as any;
      if (obj[labelKeyword]) return obj[labelKeyword];
    }
    return fallback;
  };

  const statListings = getStatValue('listing', currentCompany.stats?.propertiesListed || "500+");
  const statYears = getStatValue('year', currentCompany.stats?.yearsExperience || "10+");
  const statBrokered = getStatValue('broker', "Over ₦45B Brokered");

  return (
    <section 
      id="hero"
      className="relative min-h-[90vh] lg:min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col justify-center bg-[#0B1F3A] overflow-hidden"
    >
      {/* Background Image with Dark Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Luxury modern architectural residence by Galaxy Real Estate"
          className="w-full h-full object-cover object-center transition-all duration-700"
        />
        {/* Layered cinematic overlays: deep navy tint and readability contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/85 to-[#0B1F3A]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-[#0B1F3A]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top Tagline Eyebrow from Professional Polish Design */}
        <div className="mb-4">
          <span className="inline-block text-[#D4A84F] font-bold tracking-widest uppercase text-xs mb-3 border-l-2 border-[#D4A84F] pl-3">
            {badgeText}
          </span>
        </div>

        {/* Hero Headline & Supporting Text */}
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4">
            {headline}
          </h1>

          {subtitleAccent && (
            <p className="text-lg sm:text-xl font-medium text-[#D4A84F] tracking-wide mb-6">
              {subtitleAccent}
            </p>
          )}

          <p className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-xl">
            {subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="bg-[#D4A84F] text-[#0B1F3A] px-8 py-3.5 rounded font-bold hover:brightness-110 uppercase tracking-wide transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <span>{exploreBtnText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-contact-agent-btn"
              onClick={onContactClick}
              className="border-2 border-white/30 text-white px-8 py-3.5 rounded font-bold hover:bg-white/10 uppercase tracking-wide transition duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#D4A84F]" />
              <span>{contactBtnText}</span>
            </button>
          </div>
        </div>

        {/* Embedded Property Search Panel */}
        <div className="w-full">
          <PropertySearch onSearch={onSearch} />
        </div>

        {/* Bottom Trust Indicators with Professional Polish metrics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-white/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-white/5 border border-white/10 text-[#D4A84F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">100% Verified Titles</p>
              <p className="text-[11px] text-slate-300">C of O & Governor's Consent</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-white/5 border border-white/10 text-[#D4A84F]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">{statListings} Luxury Listings</p>
              <p className="text-[11px] text-slate-300">Abuja, Lagos, Uyo</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-white/5 border border-white/10 text-[#D4A84F]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">{statYears} Excellence</p>
              <p className="text-[11px] text-slate-300">{statBrokered}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-white/5 border border-white/10 text-[#D4A84F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">Direct WhatsApp Desk</p>
              <p className="text-[11px] text-slate-300">Instant Advisory & Tours</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
