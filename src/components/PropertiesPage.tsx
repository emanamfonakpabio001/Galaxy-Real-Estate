import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Grid, List, RotateCcw, 
  MapPin, Home, DollarSign, BedDouble, Bath, Sparkles, Filter, X 
} from 'lucide-react';
import { Property, FilterCriteria } from '../types';
import { PropertyCard } from './PropertyCard';
import { formatNaira } from '../utils/formatters';

interface PropertiesPageProps {
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  initialFilters?: Partial<FilterCriteria>;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  initialFilters,
}) => {
  const normalizeInitial = (val?: string) => {
    if (!val || val.toLowerCase() === 'all') return 'all';
    return val;
  };

  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [city, setCity] = useState(normalizeInitial(initialFilters?.city));
  const [propertyType, setPropertyType] = useState(normalizeInitial(initialFilters?.propertyType));
  const [status, setStatus] = useState(normalizeInitial(initialFilters?.status));
  const [bedrooms, setBedrooms] = useState(normalizeInitial(initialFilters?.bedrooms));
  const [bathrooms, setBathrooms] = useState(normalizeInitial(initialFilters?.bathrooms));
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 5000000000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if initialFilters prop changes
  React.useEffect(() => {
    if (initialFilters) {
      if (initialFilters.searchTerm !== undefined) setSearchTerm(initialFilters.searchTerm);
      if (initialFilters.city !== undefined) setCity(normalizeInitial(initialFilters.city));
      if (initialFilters.propertyType !== undefined) setPropertyType(normalizeInitial(initialFilters.propertyType));
      if (initialFilters.status !== undefined) setStatus(normalizeInitial(initialFilters.status));
      if (initialFilters.bedrooms !== undefined) setBedrooms(normalizeInitial(initialFilters.bedrooms));
      if (initialFilters.bathrooms !== undefined) setBathrooms(normalizeInitial(initialFilters.bathrooms));
      if (initialFilters.minPrice !== undefined) setMinPrice(initialFilters.minPrice);
      if (initialFilters.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice);
    }
  }, [initialFilters]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCity('all');
    setPropertyType('all');
    setStatus('all');
    setBedrooms('all');
    setBathrooms('all');
    setMinPrice(0);
    setMaxPrice(5000000000);
    setSortBy('featured');
  };

  // Filter and sort calculation
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCity = item.location.city.toLowerCase().includes(query);
        const matchesNeighborhood = item.location.neighborhood.toLowerCase().includes(query);
        const matchesAddress = item.location.address.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCity && !matchesNeighborhood && !matchesAddress && !matchesType) {
          return false;
        }
      }

      // City
      if (city !== 'all' && item.location.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }

      // Property Type
      if (propertyType !== 'all' && item.type.toLowerCase() !== propertyType.toLowerCase()) {
        return false;
      }

      // Status
      if (status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      // Bedrooms
      if (bedrooms !== 'all') {
        if (bedrooms === '5+') {
          if (item.bedrooms < 5) return false;
        } else {
          if (item.bedrooms !== parseInt(bedrooms, 10)) return false;
        }
      }

      // Bathrooms
      if (bathrooms !== 'all') {
        if (bathrooms === '3+') {
          if (item.bathrooms < 3) return false;
        } else {
          if (item.bathrooms !== parseInt(bathrooms, 10)) return false;
        }
      }

      // Price
      if (item.price < minPrice || item.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.yearBuilt || 2024) - (a.yearBuilt || 2024);
      // default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [properties, searchTerm, city, propertyType, status, bedrooms, bathrooms, minPrice, maxPrice, sortBy]);

  const activeFilterCount = [
    city !== 'all',
    propertyType !== 'all',
    status !== 'all',
    bedrooms !== 'all',
    bathrooms !== 'all',
    minPrice > 0,
    maxPrice < 5000000000,
    searchTerm !== '',
  ].filter(Boolean).length;

  return (
    <div id="properties-directory" className="py-24 bg-[#F5F7FA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
            <span>Galaxy Property Marketplace</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">
            Discover Premium Properties
          </h1>
          <p className="text-sm sm:text-base text-[#667085] mt-1">
            Browse verified luxury villas, modern apartments, family homes and prime commercial spaces in Nigeria.
          </p>
        </div>

        {/* Top Control Bar: Search input, Sort options, View Toggle & Mobile Filter trigger */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Keyword Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search address, city, villa..."
              className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick status tabs */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'For Sale', 'For Rent'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === st
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Sort By & View toggles */}
          <div className="flex items-center justify-between w-full md:w-auto space-x-3">
            {/* Mobile filter button */}
            <button
              id="mobile-filter-open-btn"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 min-h-[44px]"
            >
              <Filter className="w-4 h-4 text-[#D4A84F]" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort selector */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="property-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F5F7FA] border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#D4A84F]"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Main 2-Column Layout: Sidebar Filters + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#D4A84F]" />
                  <h3 className="font-display font-bold text-sm text-[#0B1F3A] uppercase tracking-wider">
                    Filters
                  </h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Listing Type</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['all', 'For Sale', 'For Rent'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                        status === st ? 'bg-[#0B1F3A] text-white' : 'text-slate-600 hover:text-[#0B1F3A]'
                      }`}
                    >
                      {st === 'all' ? 'All' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A84F]" /> Location / City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                >
                  <option value="all">All Cities (Abuja, Lagos, PH, Uyo, etc.)</option>
                  <option value="Abuja">Abuja (Maitama, Guzape, Asokoro, Katampe)</option>
                  <option value="Lagos">Lagos (Ikoyi, Banana Is., Lekki, VI, Eko Atlantic)</option>
                  <option value="Port Harcourt">Port Harcourt (Old GRA)</option>
                  <option value="Uyo">Uyo (Ewet Housing)</option>
                  <option value="Ibadan">Ibadan (Iyaganku GRA)</option>
                  <option value="Calabar">Calabar (State Housing)</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-[#D4A84F]" /> Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                >
                  <option value="all">All Types</option>
                  <option value="Villa">Luxury Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Apartment">Modern Apartment</option>
                  <option value="Terrace Duplex">Terrace Duplex</option>
                  <option value="Detached Mansion">Detached Mansion</option>
                  <option value="Land">Prime Land / Plot</option>
                  <option value="Commercial Office">Commercial Office</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-[#D4A84F]" /> Bedrooms
                </label>
                <div className="grid grid-cols-6 gap-1 bg-slate-100 p-1 rounded-xl">
                  {['all', '1', '2', '3', '4', '5+'].map((bed) => (
                    <button
                      key={bed}
                      type="button"
                      onClick={() => setBedrooms(bed)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                        bedrooms === bed ? 'bg-[#0B1F3A] text-white' : 'text-slate-600 hover:text-[#0B1F3A]'
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-[#D4A84F]" /> Bathrooms
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                  {['all', '1', '2', '3+'].map((bath) => (
                    <button
                      key={bath}
                      type="button"
                      onClick={() => setBathrooms(bath)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                        bathrooms === bath ? 'bg-[#0B1F3A] text-white' : 'text-slate-600 hover:text-[#0B1F3A]'
                      }`}
                    >
                      {bath}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Cap Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Max Budget</label>
                  <span className="text-xs font-extrabold text-[#0B1F3A]">
                    {maxPrice >= 3000000000 ? 'Any Budget' : formatNaira(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000000"
                  max="3000000000"
                  step="25000000"
                  value={maxPrice > 3000000000 ? 3000000000 : maxPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxPrice(val >= 3000000000 ? 5000000000 : val);
                  }}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₦10M</span>
                  <span>₦1B</span>
                  <span>₦3B+ (Any)</span>
                </div>
              </div>

              {/* Quick Reset All */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Clear All Filters
              </button>

            </div>
          </aside>

          {/* Results Grid / List */}
          <main className="lg:col-span-3">
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Showing <span className="text-[#0B1F3A] font-bold">{filteredProperties.length}</span> properties matching your search
              </p>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#0B1F3A] hover:text-[#D4A84F] font-bold underline"
                >
                  Clear {activeFilterCount} active filter(s)
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-2">
                  No Matching Properties Found
                </h3>
                <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
                  We couldn't find any properties matching your exact criteria. Try adjusting your filters or clearing search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] text-[#D4A84F] font-bold text-xs shadow-md hover:bg-[#142d52] transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Grid of cards */
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelectProperty={onSelectProperty}
                  />
                ))}
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-display font-bold text-base text-[#0B1F3A]">Filter Properties</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="all">All</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="all">All Cities</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Uyo">Uyo</option>
                  <option value="Ibadan">Ibadan</option>
                  <option value="Calabar">Calabar</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="Villa">Luxury Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Apartment">Modern Apartment</option>
                  <option value="Terrace Duplex">Terrace Duplex</option>
                  <option value="Detached Mansion">Detached Mansion</option>
                  <option value="Land">Prime Land / Plot</option>
                  <option value="Commercial Office">Commercial Office</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="all">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#0B1F3A] text-[#D4A84F] font-bold text-xs"
              >
                Apply Filters ({filteredProperties.length} Results)
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl text-slate-500 text-xs font-medium hover:bg-slate-50"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
