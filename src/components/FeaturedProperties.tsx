import React, { useState } from 'react';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface FeaturedPropertiesProps {
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onViewAllClick: () => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onViewAllClick,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'For Sale' | 'For Rent' | 'Abuja' | 'Lagos'>('all');

  const filtered = properties.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'For Sale') return p.status === 'For Sale';
    if (activeTab === 'For Rent') return p.status === 'For Rent';
    if (activeTab === 'Abuja') return p.location.city === 'Abuja';
    if (activeTab === 'Lagos') return p.location.city === 'Lagos';
    return true;
  });

  return (
    <section id="featured-properties-section" className="py-20 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Professional Polish typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D4A84F] tracking-widest block mb-1">
              Handpicked Portfolio
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1F3A]">
              Featured Properties
            </h2>
            <p className="text-sm text-[#667085] mt-1">
              Finest properties selected for comfort, quality, and investment value.
            </p>
          </div>

          {/* Filter Pills and See All link */}
          <div className="mt-4 md:mt-0 flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap">
            {(['all', 'For Sale', 'For Rent', 'Abuja', 'Lagos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap min-h-[38px] flex items-center ${
                  activeTab === tab
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                    : 'bg-white text-[#667085] hover:text-[#0B1F3A] border border-slate-200'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}

            <button
              onClick={onViewAllClick}
              className="ml-auto sm:ml-2 text-xs font-bold text-[#D4A84F] hover:text-[#b88c3a] underline underline-offset-4 uppercase tracking-wider whitespace-nowrap py-2 px-1"
            >
              See All
            </button>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProperty={onSelectProperty}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
