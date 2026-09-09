import React from 'react';
import { Star, Quote, Sparkles, ShieldCheck } from 'lucide-react';
import { Testimonial } from '../types';
import { TESTIMONIALS_DATA } from '../data/testimonials';

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const activeTestimonials = (testimonials && testimonials.length > 0) ? testimonials : TESTIMONIALS_DATA;

  return (
    <section id="testimonials" className="py-20 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
            <span>Verified Client Experiences</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            What Our Clients Say
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667085] leading-relaxed">
            Read firsthand accounts from homeowners, diaspora buyers, and commercial investors who trust Galaxy.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTestimonials.map((t) => {
            const avatarImg = t.avatar || (t as any).image || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0B1F3A&color=D4A84F`;
            const clientRole = t.role || (t as any).occupation || (t as any).location || 'Verified Homeowner';
            const clientLocation = (t as any).propertyPurchased || (t as any).location || 'Nigeria';

            return (
              <div
                key={t.id}
                id={`testimonial-card-${t.id}`}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Rating Stars and Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-1 text-[#D4A84F]">
                      {Array.from({ length: Math.min(5, Math.max(1, t.rating || 5)) }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-[#D4A84F]/20 group-hover:text-[#D4A84F]/40 transition-colors" />
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{t.comment}"
                  </p>
                </div>

                {/* Client Profile */}
                <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                  <img
                    src={avatarImg}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4A84F]/50 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="font-display text-sm font-bold text-[#0B1F3A] truncate flex items-center gap-1">
                      {t.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{clientRole}</p>
                    <p className="text-[10px] text-[#D4A84F] font-semibold truncate">{clientLocation}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
