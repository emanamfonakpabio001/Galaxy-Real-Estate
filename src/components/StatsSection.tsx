import React from 'react';
import { HomepageContent, CompanyConfig } from '../types';

interface StatsSectionProps {
  content?: HomepageContent | null;
  companyConfig?: CompanyConfig | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ content, companyConfig }) => {
  const statsList = Array.isArray(content?.stats) && content.stats.length >= 4
    ? [
        {
          value: content.stats[0]?.value || '1234+',
          label: content.stats[0]?.label || 'Active Listings',
          subtext: 'Verified active listings',
        },
        {
          value: content.stats[1]?.value || '₦45B+',
          label: content.stats[1]?.label || 'Properties Brokered',
          subtext: 'High-yield assets brokered',
        },
        {
          value: content.stats[2]?.value || '879+',
          label: content.stats[2]?.label || 'Satisfied Clients',
          subtext: 'Homeowners & investors',
        },
        {
          value: content.stats[3]?.value || '5+',
          label: content.stats[3]?.label || 'Years of Excellence',
          subtext: 'Proven luxury track record',
        },
      ]
    : [
        {
          value: '1234+',
          label: 'Active Listings',
          subtext: 'Verified active listings',
        },
        {
          value: '₦45B+',
          label: 'Properties Brokered',
          subtext: 'High-yield assets brokered',
        },
        {
          value: '879+',
          label: 'Satisfied Clients',
          subtext: 'Homeowners & investors',
        },
        {
          value: '5+',
          label: 'Years of Excellence',
          subtext: 'Proven luxury track record',
        },
      ];

  return (
    <section id="stats-section" className="bg-[#0B1F3A] text-white py-12 relative overflow-hidden border-y border-[#D4A84F]/20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-32 bg-[#D4A84F]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-32 bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          {statsList.map((stat, idx) => (
            <div key={idx} className={`flex flex-col items-center justify-center ${idx > 0 ? 'pt-6 md:pt-0 md:pl-4' : 'md:pr-4'}`}>
              <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#D4A84F] tracking-tight mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-1">
                {stat.label}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-normal">
                {stat.subtext}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
