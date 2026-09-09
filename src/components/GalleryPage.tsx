import React, { useState, useMemo, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Filter, 
  Search, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  MessageSquare, 
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Layers,
  Sparkles,
  Home,
  CheckCircle2,
  Building2,
  Info
} from 'lucide-react';
import { GALLERY_PHOTOS, GalleryPhoto, GalleryCategory } from '../data/gallery';
import { Property } from '../types';
import { company } from '../config/company';
import { formatNaira } from '../utils/formatters';

interface GalleryPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onNavigateHome: () => void;
  onNavigateContact: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  properties,
  onSelectProperty,
  onNavigateHome,
  onNavigateContact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid' | 'large'>('masonry');
  
  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Category Configuration
  const categories: { id: GalleryCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Photos', count: GALLERY_PHOTOS.length },
    { id: 'exterior', label: 'Exteriors & Architecture', count: GALLERY_PHOTOS.filter(p => p.category === 'exterior').length },
    { id: 'living', label: 'Living & Lounges', count: GALLERY_PHOTOS.filter(p => p.category === 'living').length },
    { id: 'kitchen', label: 'Kitchens & Dining', count: GALLERY_PHOTOS.filter(p => p.category === 'kitchen').length },
    { id: 'bedroom', label: 'Master Suites & Bedrooms', count: GALLERY_PHOTOS.filter(p => p.category === 'bedroom').length },
    { id: 'pool_outdoor', label: 'Pools & Terraces', count: GALLERY_PHOTOS.filter(p => p.category === 'pool_outdoor').length },
    { id: 'bathroom', label: 'Spa Bathrooms', count: GALLERY_PHOTOS.filter(p => p.category === 'bathroom').length },
  ];

  const cities = ['all', 'Abuja', 'Lagos', 'Uyo'];

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    return GALLERY_PHOTOS.filter((photo) => {
      const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || photo.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesQuery = 
        !searchQuery.trim() ||
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesCity && matchesQuery;
    });
  }, [selectedCategory, selectedCity, searchQuery]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;

      if (e.key === 'Escape') {
        setActivePhotoIndex(null);
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setIsZoomed(false);
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex === null || filteredPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev! + 1) % filteredPhotos.length);
    setIsZoomed(false);
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null || filteredPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
    setIsZoomed(false);
  };

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  // Find linked property object
  const linkedProperty = useMemo(() => {
    if (!activePhoto?.propertyId) return null;
    return properties.find(p => p.id === activePhoto.propertyId) || null;
  }, [activePhoto, properties]);

  const handleViewPropertyFromGallery = (propertyId?: string) => {
    if (!propertyId) return;
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      setActivePhotoIndex(null);
      onSelectProperty(prop);
    }
  };

  const handleWhatsAppInquiry = (photo: GalleryPhoto) => {
    const text = encodeURIComponent(
      `Hello Galaxy Real Estate, I am inquiring about the property space featured in your gallery: "${photo.title}" located at ${photo.location}. I would like to receive more information or book a private inspection.`
    );
    window.open(`https://wa.me/${company.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="pt-24 pb-20 bg-[#F5F7FA] min-h-screen">
      
      {/* Page Header & Breadcrumb */}
      <div className="bg-[#0B1F3A] text-white border-b border-[#D4A84F]/30 py-12 md:py-16 relative overflow-hidden">
        {/* Background Subtle Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A84F]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-4" aria-label="Breadcrumb">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#D4A84F] transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-[#D4A84F] font-semibold">Architectural Gallery</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84F]/15 border border-[#D4A84F]/30 text-[#D4A84F] text-xs font-bold uppercase tracking-wider mb-3">
                <Camera className="w-3.5 h-3.5" />
                <span>Visual Portfolio & Architectural Stills</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                Property Visual Gallery
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Explore real, high-resolution photography showcasing Galaxy’s luxury villas, waterfront apartments, gourmet kitchens, sky penthouses, and private estates across Nigeria.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-sm shrink-0">
              <div className="px-3 py-1 border-r border-white/10 text-center">
                <span className="block font-display text-xl font-bold text-[#D4A84F]">
                  {GALLERY_PHOTOS.length}+
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Photos
                </span>
              </div>
              <div className="px-3 py-1 border-r border-white/10 text-center">
                <span className="block font-display text-xl font-bold text-white">
                  3
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Major Hubs
                </span>
              </div>
              <div className="px-3 py-1 text-center">
                <span className="block font-display text-xl font-bold text-emerald-400">
                  100%
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Real Stills
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Controls Bar */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Filter Tabs (Horizontal Scrollable) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm border border-[#D4A84F]/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === cat.id
                      ? 'bg-[#D4A84F] text-[#0B1F3A]'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Controls: Search, City Filter & Layout Switcher */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search space, villa, pool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* City Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1.5 rounded-lg capitalize font-medium transition ${
                      selectedCity === city
                        ? 'bg-white text-[#0B1F3A] font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {city === 'all' ? 'All Cities' : city}
                  </button>
                ))}
              </div>

              {/* Layout Mode Toggles */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setLayoutMode('masonry')}
                  title="Dynamic Masonry View"
                  className={`p-1.5 rounded-lg transition ${
                    layoutMode === 'masonry'
                      ? 'bg-white text-[#0B1F3A] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Masonry layout"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  title="3-Column Grid"
                  className={`p-1.5 rounded-lg transition ${
                    layoutMode === 'grid'
                      ? 'bg-white text-[#0B1F3A] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Grid layout"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('large')}
                  title="Showcase Cards"
                  className={`p-1.5 rounded-lg transition ${
                    layoutMode === 'large'
                      ? 'bg-white text-[#0B1F3A] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Large cards layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Main Gallery Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        
        {/* Results Counter & Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-xs sm:text-sm text-slate-600">
            Showing <span className="font-bold text-[#0B1F3A]">{filteredPhotos.length}</span> architectural {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            {selectedCategory !== 'all' && (
              <span className="ml-1 text-slate-500">
                in <strong className="text-[#0B1F3A]">{categories.find(c => c.id === selectedCategory)?.label}</strong>
              </span>
            )}
            {selectedCity !== 'all' && (
              <span className="ml-1 text-slate-500">
                in <strong className="text-[#0B1F3A]">{selectedCity}</strong>
              </span>
            )}
          </div>

          {(selectedCategory !== 'all' || selectedCity !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#D4A84F] hover:text-[#b38834] font-semibold flex items-center gap-1 underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
              No gallery images found
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              We couldn't find any property pictures matching your current filter criteria. Try selecting another category or resetting the search term.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#152e52] transition shadow-sm"
            >
              Show All Photos
            </button>
          </div>
        )}

        {/* MASONRY / GRID LAYOUT */}
        {filteredPhotos.length > 0 && (
          <div 
            className={
              layoutMode === 'masonry'
                ? 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6'
                : layoutMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid grid-cols-1 md:grid-cols-2 gap-8'
            }
          >
            {filteredPhotos.map((photo, index) => {
              const matchedProp = photo.propertyId ? properties.find(p => p.id === photo.propertyId) : null;
              
              return (
                <div
                  key={photo.id}
                  className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${
                    layoutMode === 'masonry' ? 'break-inside-avoid' : ''
                  }`}
                >
                  {/* Image Container */}
                  <div 
                    className={`relative overflow-hidden cursor-pointer ${
                      layoutMode === 'grid'
                        ? 'h-64'
                        : layoutMode === 'large'
                        ? 'h-80'
                        : photo.aspectRatio === 'portrait'
                        ? 'h-96'
                        : photo.aspectRatio === 'square'
                        ? 'h-72'
                        : 'h-64 sm:h-72'
                    }`}
                    onClick={() => handleOpenLightbox(index)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                      
                      {/* Top Action Tags */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-[#0B1F3A]/80 backdrop-blur-md border border-[#D4A84F]/40 text-[#D4A84F] text-[11px] font-bold uppercase tracking-wider">
                          {photo.categoryLabel}
                        </span>
                        
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4A84F] hover:text-[#0B1F3A] transition">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Bottom Caption on Hover */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4A84F]" />
                          <span>{photo.location}</span>
                        </div>
                        <h4 className="font-display text-base font-bold text-white line-clamp-1">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                          {photo.subtitle}
                        </p>
                      </div>

                    </div>

                    {/* Permanent Category Pill (Non-hover) */}
                    <div className="absolute top-3 left-3 group-hover:opacity-0 transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B1F3A]/85 backdrop-blur-md text-[#D4A84F] text-[11px] font-bold uppercase tracking-wider border border-[#D4A84F]/30 shadow-sm">
                        {photo.categoryLabel}
                      </span>
                    </div>

                    {/* Price / Status Badge if Available */}
                    {photo.propertyPrice && (
                      <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                          {formatNaira(photo.propertyPrice)}
                          {photo.propertyStatus === 'For Rent' ? '/yr' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D4A84F]" />
                          {photo.location}
                        </span>
                        {photo.propertyType && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {photo.propertyType}
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => handleOpenLightbox(index)}
                        className="font-display text-base font-bold text-[#0B1F3A] hover:text-[#D4A84F] transition-colors cursor-pointer line-clamp-1"
                      >
                        {photo.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                        {photo.subtitle}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenLightbox(index)}
                        className="text-xs font-bold text-[#0B1F3A] hover:text-[#D4A84F] transition flex items-center gap-1.5 py-1"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#D4A84F]" />
                        <span>Enlarge Photo</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        {matchedProp && (
                          <button
                            onClick={() => onSelectProperty(matchedProp)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] text-xs font-semibold transition flex items-center gap-1"
                            title="View Full Listing Details"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => handleWhatsAppInquiry(photo)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition"
                          title="Inquire on WhatsApp about this space"
                          aria-label="Inquire on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar */}
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between text-white border-b border-white/10 z-20 bg-[#0B1F3A]/80">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#D4A84F] text-[#0B1F3A] font-bold text-xs uppercase tracking-wider">
                {activePhoto.categoryLabel}
              </span>
              <div className="hidden sm:block">
                <h3 className="font-display text-sm md:text-base font-bold text-white">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4A84F]" />
                  {activePhoto.location}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono mr-2">
                {activePhotoIndex! + 1} / {filteredPhotos.length}
              </span>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1"
                title={isZoomed ? "Original Size" : "Zoom Image"}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline">{isZoomed ? "Fit" : "Zoom"}</span>
              </button>

              <button
                onClick={() => {
                  setActivePhotoIndex(null);
                  setIsZoomed(false);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500 hover:text-white text-white transition"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewing Area with Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            
            {/* Prev Button */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 sm:bg-white/10 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition shadow-xl active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Active Image */}
            <div 
              className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-300 ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[60vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 sm:bg-white/10 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition shadow-xl active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

          </div>

          {/* Bottom Information & Filmstrip Tray */}
          <div className="px-4 sm:px-6 py-4 bg-[#0B1F3A]/90 border-t border-white/10 z-20 text-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Photo Description & Details */}
              <div className="text-left w-full md:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-base font-bold text-white">
                    {activePhoto.title}
                  </h4>
                  {activePhoto.propertyPrice && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      {formatNaira(activePhoto.propertyPrice)}
                      {activePhoto.propertyStatus === 'For Rent' ? '/yr' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {activePhoto.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                {linkedProperty && (
                  <button
                    onClick={() => {
                      handleViewPropertyFromGallery(linkedProperty.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#0B1F3A] font-bold text-xs sm:text-sm transition flex items-center gap-1.5 border border-white/20"
                  >
                    <span>Inspect Full Listing</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleWhatsAppInquiry(activePhoto)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-br from-[#0B1F3A] to-[#152e52] rounded-3xl p-8 sm:p-12 text-white border border-[#D4A84F]/30 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A84F]">
                Tailored Property Tours
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold">
                Like what you see in our gallery?
              </h3>
              <p className="text-slate-300 text-sm max-w-xl">
                Schedule a private in-person or live video inspection of any property. Our luxury advisory team is ready to guide your purchase or lease.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onNavigateContact}
                className="px-6 py-3.5 rounded-xl bg-[#D4A84F] hover:bg-[#c49842] text-[#0B1F3A] font-bold text-sm transition shadow-lg"
              >
                Book Inspection
              </button>
              <a
                href={`tel:${company.phone}`}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20"
              >
                Call Advisory
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
