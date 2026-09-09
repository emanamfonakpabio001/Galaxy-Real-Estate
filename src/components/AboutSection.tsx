import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AboutContent, CompanyConfig } from '../types';
import { company } from '../config/company';

interface AboutSectionProps {
  onContactClick: () => void;
  onExploreClick: () => void;
  content?: AboutContent | null;
  companyConfig?: CompanyConfig | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  onContactClick, 
  onExploreClick,
  content,
  companyConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'values'>('mission');
  const currentCompany = companyConfig || company;

  // Dynamic values with elegant fallbacks
  const mainImage = content?.image || content?.images?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80";
  const sectionTitle = content?.title || "Building Better Futures Through Real Estate.";
  const sectionDesc = content?.description || content?.introText || "Galaxy is a premier, customer-focused real estate company dedicated to helping individuals, families, businesses, and investors discover and secure prime properties across Nigeria.";
  const missionText = content?.mission || "To simplify property acquisition in Nigeria through bulletproof legal due diligence, transparent transaction advisory, and curated luxury listings tailored to long-term wealth creation.";
  const visionText = content?.vision || "To be Nigeria's most trusted and admired luxury real-estate firm, establishing the gold standard in client advocacy, property management, and strategic development.";
  const coreValues = Array.isArray(content?.values) && content.values.length > 0 
    ? content.values 
    : ['Absolute Integrity', 'Verified Transparency', 'Client Advocacy', 'Market Innovation'];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image Collage */}
          <div className="relative">
            {/* Main Office Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#F5F7FA]">
              <img
                src={mainImage}
                alt="Galaxy Real Estate Modern Executive Headquarters"
                className="w-full aspect-[4/3] object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-display text-lg font-bold text-white">{currentCompany.name} Corporate Headquarters</p>
                <p className="text-xs text-slate-200">Maitama, Abuja • Victoria Island, Lagos</p>
              </div>
            </div>

            {/* Floating Trust Card Overlay */}
            <div className="relative -mt-8 mx-3 sm:mx-0 sm:mt-0 sm:absolute sm:-bottom-8 sm:-right-8 bg-[#0B1F3A] text-white p-5 sm:p-6 rounded-2xl shadow-2xl border border-[#D4A84F]/40 max-w-xs z-10">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-[#D4A84F]/40 shadow-md shrink-0">
                  <img
                    src={currentCompany.logo}
                    alt="Galaxy Emblem"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white leading-tight">Customer First</h4>
                  <p className="text-[10px] text-[#D4A84F] font-semibold">Integrity • Transparency</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated real-estate advisors assisting diaspora and local clients with end-to-end guidance.
              </p>
            </div>
          </div>

          {/* Right Column: Copy & Interactive Value Tabs */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
              <span>About {currentCompany.name}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-tight mb-6">
              {sectionTitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
              {sectionDesc}
            </p>

            {/* Interactive Tabs (Mission, Vision, Values) */}
            <div className="bg-[#F5F7FA] p-1.5 rounded-xl flex space-x-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('mission')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'mission'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Our Mission
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vision')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'vision'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Our Vision
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('values')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'values'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Core Values
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-[#F5F7FA] rounded-2xl p-5 border border-slate-200 mb-8 min-h-[120px] flex items-center">
              {activeTab === 'mission' && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <strong className="text-[#0B1F3A] font-bold">Mission:</strong> {missionText}
                </p>
              )}
              {activeTab === 'vision' && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <strong className="text-[#0B1F3A] font-bold">Vision:</strong> {visionText}
                </p>
              )}
              {activeTab === 'values' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 w-full font-medium">
                  {coreValues.map((val: any, idx: number) => {
                    const title = typeof val === 'string' ? val : (val.title || val.name || '');
                    const desc = typeof val === 'object' ? val.description : '';
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A84F] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#0B1F3A]">{title}</span>
                          {desc && <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="about-learn-more-btn"
                onClick={onContactClick}
                className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#142d52] text-white font-bold text-xs shadow-md transition flex items-center space-x-2 group cursor-pointer"
              >
                <span>Speak With Our Leadership</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A84F] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                View Properties
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
