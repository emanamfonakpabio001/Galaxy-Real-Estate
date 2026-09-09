import React from 'react';
import { 
  CheckCircle2, ShieldCheck, Users, Scale, MapPinned, 
  UserCheck, TrendingUp, Sparkles, KeyRound, Headphones, Award 
} from 'lucide-react';
import { HomepageContent, CompanyConfig } from '../types';
import { company } from '../config/company';

interface WhyChooseUsProps {
  content?: HomepageContent | null;
  companyConfig?: CompanyConfig | null;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ content, companyConfig }) => {
  const currentCompany = companyConfig || company;

  const defaultPoints = [
    {
      icon: ShieldCheck,
      title: 'Verified Properties',
      description: 'Every property in our portfolio undergoes rigorous legal due diligence, title search, and physical structural verification before listing.',
    },
    {
      icon: Users,
      title: 'Professional Agents',
      description: 'Our licensed, seasoned property advisors provide objective market analysis and discreet representation throughout your acquisition.',
    },
    {
      icon: Scale,
      title: 'Transparent Transactions',
      description: 'No hidden agency fees or surprise legal caveats. We champion straightforward escrow protocols and transparent billing.',
    },
    {
      icon: MapPinned,
      title: 'Local Market Expertise',
      description: 'Deep on-the-ground intelligence across key growth corridors in Abuja, Lagos Island & Mainland, and emerging economic hubs.',
    },
    {
      icon: UserCheck,
      title: 'Personalized Service',
      description: 'Tailored property sourcing matching your exact architectural tastes, family lifestyle requirements, and financial milestones.',
    },
    {
      icon: TrendingUp,
      title: 'Investment Guidance',
      description: 'Strategic portfolio advisory maximizing rental yield, off-plan appreciation, and safe capital preservation against inflation.',
    },
  ];

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'KeyRound': return KeyRound;
      case 'Headphones': return Headphones;
      case 'TrendingUp': return TrendingUp;
      case 'Users': return Users;
      case 'Award': return Award;
      default: return ShieldCheck;
    }
  };

  const rawPoints = (Array.isArray(content?.whyChoose) && content.whyChoose.length > 0)
    ? content.whyChoose
    : (Array.isArray((content as any)?.whyChoosePoints) && (content as any).whyChoosePoints.length > 0)
    ? (content as any).whyChoosePoints
    : defaultPoints;

  const dynamicPoints = rawPoints.map((p: any) => ({
    icon: getIconComponent(p.icon),
    title: p.title,
    description: p.description,
  }));

  const sectionHeading = content?.whyChooseHeading || `Why Choose ${currentCompany.name}?`;
  const sectionDesc = content?.whyChooseDescription || "We combine high-level institutional rigor with personal touch to deliver unmatched real estate experiences in Nigeria.";

  const hasArrayStats = Array.isArray(content?.stats) && content.stats.length > 0;
  const statListed = (content?.stats as any)?.propertiesBrokered || currentCompany.stats?.propertiesListed || "500+";
  const statClients = (content?.stats as any)?.satisfiedClients || currentCompany.stats?.happyClients || "1,200+";
  const statYears = (content?.stats as any)?.yearsExcellence || currentCompany.stats?.yearsExperience || "10+";
  const statSatisfaction = currentCompany.stats?.clientSatisfaction || "99.4%";

  return (
    <section id="why-choose-us" className="py-20 bg-[#0B1F3A] text-white relative overflow-hidden">
      {/* Background subtle geometric accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D4A84F]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-[#D4A84F]/40 text-[#D4A84F] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The {currentCompany.name} Standard</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {sectionHeading}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            {sectionDesc}
          </p>
        </div>

        {/* Key Strengths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicPoints.map((pt: any, idx: number) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4A84F]/40 rounded-2xl p-6 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4A84F]/15 border border-[#D4A84F]/30 flex items-center justify-center text-[#D4A84F] mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-display text-lg font-bold text-white">
                    {pt.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
