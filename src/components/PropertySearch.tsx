import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, BedDouble, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FilterCriteria } from '../types';

interface PropertySearchProps {
  onSearch: (filters: Partial<FilterCriteria>) => void;
  initialFilters?: Partial<FilterCriteria>;
  compact?: boolean;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onSearch,
  initialFilters,
  compact = false,
}) => {
  const [status, setStatus] = useState<string>(initialFilters?.status || 'all');
  const [city, setCity] = useState<string>(initialFilters?.city || 'all');
  const [propertyType, setPropertyType] = useState<string>(initialFilters?.propertyType || 'all');
  const [bedrooms, setBedrooms] = useState<string>(initialFilters?.bedrooms || 'all');
  const [priceBracket, setPriceBracket] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters?.searchTerm || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let minPrice = 0;
    let maxPrice = 2000000000;

    if (priceBracket === 'under-100m' || priceBracket === 'under-50m') {
      maxPrice = 100000000;
    } else if (priceBracket === '100m-300m' || priceBracket === '50m-100m') {
      minPrice = 100000000;
      maxPrice = 300000000;
    } else if (priceBracket === '300m-700m' || priceBracket === '100m-250m') {
      minPrice = 300000000;
      maxPrice = 700000000;
    } else if (priceBracket === '700m-plus' || priceBracket === '250m-plus') {
      minPrice = 700000000;
      maxPrice = 3000000000;
    } else if (priceBracket === 'rent-under-15m') {
      maxPrice = 15000000;
    } else if (priceBracket === 'rent-15m-50m') {
      minPrice = 15000000;
      maxPrice = 50000000;
    } else if (priceBracket === 'rent-50m-plus' || priceBracket === 'rent-15m-plus') {
      minPrice = 50000000;
      maxPrice = 500000000;
    }

    onSearch({
      status,
      city,
      propertyType,
      bedrooms,
      searchTerm,
      minPrice,
      maxPrice,
    });
  };

  return (
    <div 
      id="property-search-panel"
      className="bg-white rounded-lg shadow-2xl p-6 border border-slate-100 relative z-20"
    >
      {/* Top Listing Status Tabs (All / For Sale / For Rent) */}
      <div className="flex items-center justify-between border-b border-[#F5F7FA] pb-4 mb-5">
        <div className="flex items-center space-x-1 bg-[#F5F7FA] p-1 rounded">
          <button
            type="button"
            onClick={() => setStatus('all')}
            className={`px-3 sm:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              status === 'all'
                ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            All Listings
          </button>
          <button
            type="button"
            onClick={() => setStatus('For Sale')}
            className={`px-3 sm:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              status === 'For Sale'
                ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => setStatus('For Rent')}
            className={`px-3 sm:px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              status === 'For Rent'
                ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            For Rent
          </button>
        </div>

        <span className="hidden sm:flex items-center text-xs font-bold text-[#D4A84F] gap-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Properties
        </span>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          {/* Location / City */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#667085] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#D4A84F]" /> Location
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-slate-200/80 text-sm p-2.5 rounded outline-none font-medium focus:border-[#D4A84F]"
            >
              <option value="all">All Locations (Nigeria)</option>
              <option value="Abuja">Abuja (Maitama, Guzape, Asokoro, Katampe)</option>
              <option value="Lagos">Lagos (Ikoyi, Banana Is., Lekki, VI, Eko Atlantic)</option>
              <option value="Port Harcourt">Port Harcourt (Old GRA, Peter Odili)</option>
              <option value="Uyo">Uyo (Ewet Housing, Shelter Afrique)</option>
              <option value="Ibadan">Ibadan (Iyaganku GRA, Bodija)</option>
              <option value="Calabar">Calabar (State Housing, Marina)</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#667085] flex items-center gap-1">
              <Home className="w-3 h-3 text-[#D4A84F]" /> Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-slate-200/80 text-sm p-2.5 rounded outline-none font-medium focus:border-[#D4A84F]"
            >
              <option value="all">All Property Types</option>
              <option value="Villa">Luxury Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Apartment">Modern Apartment</option>
              <option value="Terrace Duplex">Terrace Duplex</option>
              <option value="Detached Mansion">Detached Mansion</option>
              <option value="Land">Prime Land / Plot</option>
              <option value="Commercial Office">Commercial Office</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#667085] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#D4A84F]" /> Price Range
            </label>
            <select
              value={priceBracket}
              onChange={(e) => setPriceBracket(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-slate-200/80 text-sm p-2.5 rounded outline-none font-medium focus:border-[#D4A84F]"
            >
              <option value="all">Any Price Range</option>
              {status === 'For Rent' ? (
                <>
                  <option value="rent-under-15m">Under ₦15,000,000 /yr</option>
                  <option value="rent-15m-50m">₦15M – ₦50,000,000 /yr</option>
                  <option value="rent-50m-plus">₦50,000,000+ /yr</option>
                </>
              ) : (
                <>
                  <option value="under-100m">Under ₦100,000,000</option>
                  <option value="100m-300m">₦100M – ₦300,000,000</option>
                  <option value="300m-700m">₦300M – ₦700,000,000</option>
                  <option value="700m-plus">₦700,000,000+</option>
                </>
              )}
            </select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#667085] flex items-center gap-1">
              <BedDouble className="w-3 h-3 text-[#D4A84F]" /> Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-slate-200/80 text-sm p-2.5 rounded outline-none font-medium focus:border-[#D4A84F]"
            >
              <option value="all">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5+">5+ Bedrooms</option>
            </select>
          </div>

          {/* Search Button */}
          <div>
            <button
              id="hero-search-submit-btn"
              type="submit"
              className="w-full h-11 bg-[#0B1F3A] hover:bg-black text-[#D4A84F] font-bold text-xs rounded transition-colors flex items-center justify-center space-x-2 uppercase tracking-wide"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search Properties</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
