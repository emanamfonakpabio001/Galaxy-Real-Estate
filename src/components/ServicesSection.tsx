import React from 'react';
import { 
  Building2, 
  KeyRound, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  ArrowRight, 
  Sparkles,
  Home,
  Layers,
  Key,
  FileCheck,
  Briefcase,
  Award,
  Headphones,
  MapPin,
  Search
} from 'lucide-react';
import { ServiceItem } from '../types';
import { SERVICES_DATA } from '../data/services';
import { createWhatsAppUrl } from '../utils/formatters';

interface ServicesSectionProps {
  onContactClick: () => void;
  services?: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onContactClick, services }) => {
  const activeServices = (services && services.length > 0) ? services : SERVICES_DATA;

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Building2':
        return <Building2 className="w-6 h-6 text-[#D4A84F]" />;
      case 'KeyRound':
      case 'Key':
        return <KeyRound className="w-6 h-6 text-[#D4A84F]" />;
      case 'ShieldCheck':
      case 'FileCheck':
        return <ShieldCheck className="w-6 h-6 text-[#D4A84F]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-[#D4A84F]" />;
      case 'Home':
        return <Home className="w-6 h-6 text-[#D4A84F]" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-[#D4A84F]" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-[#D4A84F]" />;
      case 'Award':
        return <Award className="w-6 h-6 text-[#D4A84F]" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-[#D4A84F]" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-[#D4A84F]" />;
      case 'Search':
        return <Search className="w-6 h-6 text-[#D4A84F]" />;
      default:
        return <Building2 className="w-6 h-6 text-[#D4A84F]" />;
    }
  };

  const handleServiceWhatsApp = (serviceTitle: string) => {
    const msg = `Hello Galaxy, I am interested in learning more about your *${serviceTitle}* service and would like to speak with a specialist.`;
    window.open(createWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
            <span>Comprehensive Solutions</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            Our Services
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667085] leading-relaxed">
            From luxury property acquisitions to hands-off asset management and strategic investment advisory across Nigeria.
          </p>
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeServices.map((service, index) => {
            const rawBenefits = (service as any).benefits;
            const benefitsList: string[] = Array.isArray(rawBenefits) 
              ? rawBenefits 
              : (service as any).features || [];

            return (
              <div
                key={service.id || index}
                id={`service-card-${service.id || index}`}
                className="group bg-[#F5F7FA] rounded-3xl p-6 sm:p-8 border border-slate-200/80 hover:border-[#D4A84F]/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B1F3A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {getIcon((service as any).iconName || (service as any).icon)}
                  </div>
                  <span className="font-display text-3xl font-extrabold text-slate-300 group-hover:text-[#D4A84F] transition-colors">
                    0{index + 1}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-[#0B1F3A] mb-2 group-hover:text-[#0B1F3A]">
                    {service.title}
                  </h3>
                  {(service as any).subtitle && (
                    <p className="text-xs font-semibold text-[#D4A84F] mb-3">
                      {(service as any).subtitle}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Key Benefits List */}
                  {benefitsList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {benefitsList.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                          <div className="w-4 h-4 rounded-full bg-[#D4A84F]/20 flex items-center justify-center text-[#D4A84F] shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleServiceWhatsApp(service.title)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#142d52] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition duration-200 cursor-pointer"
                  >
                    <span>Enquire via WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A84F]" />
                  </button>

                  <button
                    type="button"
                    onClick={onContactClick}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    Contact Desk
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
