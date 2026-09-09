import React, { useState } from 'react';
import { Heart, MapPin, BedDouble, Bath, Maximize2, ShieldCheck, ArrowRight, Eye, Car, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Property } from '../types';
import { formatNaira } from '../utils/formatters';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onScheduleViewing?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  onSelectProperty,
}) => {
  const isRental = property.status === 'For Rent';
  const [activeIdx, setActiveIdx] = useState(0);
  const images = property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c'];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      className="group bg-white border border-[#F5F7FA] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={images[activeIdx] || images[0]}
            alt={property.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Carousel On-Hover Arrow Controls */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
                aria-label="Next photo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
                  isRental
                    ? 'bg-[#0B1F3A] text-[#D4A84F]'
                    : 'bg-[#D4A84F] text-[#0B1F3A]'
                }`}
              >
                {property.status}
              </span>

              {property.featured && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/90 text-[#0B1F3A] shadow-sm">
                  Featured
                </span>
              )}
            </div>

            {/* Favorite Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              className={`p-2.5 sm:p-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 flex items-center justify-center min-w-[36px] min-h-[36px] ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-label={`Favorite ${property.title}`}
            >
              <Heart className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom image metadata badge: Property Type */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center space-x-2">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
              {property.type}
            </span>
            {property.verified && (
              <span className="bg-[#0B1F3A]/80 backdrop-blur-md text-[#D4A84F] text-[10px] font-bold px-2 py-0.5 rounded border border-[#D4A84F]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4A84F]" />
                VERIFIED
              </span>
            )}
          </div>

          {/* Bottom-right carousel indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center space-x-1">
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                <Images className="w-3 h-3 text-[#D4A84F]" />
                {activeIdx + 1}/{images.length}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-display text-base font-bold text-[#0B1F3A] leading-tight line-clamp-1 mb-1">
            {property.title}
          </h3>

          {/* Location */}
          <p className="flex items-center text-[10px] text-[#667085] mb-2 font-medium">
            <MapPin className="w-3 h-3 text-[#D4A84F] shrink-0 mr-1" />
            <span className="truncate">{property.location.neighborhood}, {property.location.city}</span>
          </p>

          {/* Price */}
          <p className="text-[#D4A84F] font-bold text-lg font-display mb-3">
            {formatNaira(property.price, isRental, property.period)}
          </p>

          {/* Short Description */}
          <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed mb-4">
            {property.shortDescription}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Specifications Bar */}
        <div className="flex items-center justify-between text-[10px] text-[#667085] pt-2 pb-3 border-t border-[#F5F7FA]">
          <span className="flex items-center gap-1 font-semibold text-[#172033]">
            <BedDouble className="w-3.5 h-3.5 text-[#D4A84F]" />
            {property.bedrooms > 0 ? `${property.bedrooms} Bed` : 'Studio'}
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#172033]">
            <Bath className="w-3.5 h-3.5 text-[#D4A84F]" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#172033]">
            <Maximize2 className="w-3.5 h-3.5 text-[#D4A84F]" />
            {property.sizeSqm} sqm
          </span>
        </div>

        {/* Action Button */}
        <button
          id={`view-details-btn-${property.id}`}
          type="button"
          onClick={() => onSelectProperty(property)}
          className="w-full py-2.5 px-4 rounded bg-[#0B1F3A] hover:bg-[#142d52] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition duration-200 uppercase tracking-wide group"
        >
          <Eye className="w-3.5 h-3.5 text-[#D4A84F]" />
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#D4A84F] transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
