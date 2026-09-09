import React from 'react';
import { X, Heart, Trash2, ArrowRight, Eye, Building, MessageSquare } from 'lucide-react';
import { Property } from '../types';
import { formatNaira, createWhatsAppUrl } from '../utils/formatters';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Property[];
  onRemoveFavorite: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onClearAll: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProperty,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const handleInquireAllWhatsApp = () => {
    if (favorites.length === 0) return;
    const propTitles = favorites.map((p, i) => `${i + 1}. ${p.title} (${p.location.city} - ${formatNaira(p.price)})`).join('\n');
    const msg = `Hello Galaxy, I have shortlisted the following ${favorites.length} properties from your website and would like details/viewing slots:\n\n${propTitles}`;
    window.open(createWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#D4A84F]/30">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-400 fill-current" />
              <h3 className="font-display text-lg font-bold">Saved Properties</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#D4A84F] text-[#0B1F3A] text-xs font-bold">
                {favorites.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              aria-label="Close saved properties"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-300" />
                <h4 className="font-bold text-slate-700 text-sm mb-1">No Saved Properties Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click the heart icon on any property card to save your favorites for easy comparison.
                </p>
              </div>
            ) : (
              favorites.map((prop) => (
                <div
                  key={prop.id}
                  className="flex gap-3 bg-[#F5F7FA] p-3 rounded-2xl border border-slate-200 hover:border-[#D4A84F]/40 transition group"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h5 className="font-display text-xs font-bold text-[#0B1F3A] truncate group-hover:text-[#D4A84F] transition-colors">
                        {prop.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 truncate">{prop.location.neighborhood}, {prop.location.city}</p>
                      <p className="font-display text-xs font-extrabold text-[#0B1F3A] mt-0.5">
                        {formatNaira(prop.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          onSelectProperty(prop);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-[#0B1F3A] hover:text-[#D4A84F] flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>

                      <button
                        onClick={() => onRemoveFavorite(prop.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {favorites.length > 0 && (
            <div className="p-6 bg-[#F5F7FA] border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={handleInquireAllWhatsApp}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire All on WhatsApp ({favorites.length})</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="w-full py-2 text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Clear All Favorites
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
