import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Sparkles, ArrowUp, Send, Check, Loader2 } from 'lucide-react';
import { CompanyConfig } from '../types';
import { company } from '../config/company';
import { submitToFormspree } from '../services/formspree';

interface FooterProps {
  onNavClick: (viewId: string) => void;
  onFilterService: (serviceName: string) => void;
  companyConfig?: CompanyConfig | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, companyConfig }) => {
  const currentCompany = companyConfig || company;
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;

    setNewsletterSubmitting(true);
    const result = await submitToFormspree({
      form_type: 'VIP Newsletter / Off-Market Listings Subscription',
      email: newsletterEmail.trim(),
    });
    setNewsletterSubmitting(false);

    if (result.success) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  return (
    <footer id="main-footer" className="bg-[#0B1F3A] text-white pt-16 pb-12 border-t border-[#D4A84F]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: Brand, Tagline, Socials */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-xl bg-white/5 p-1 flex items-center justify-center border border-[#D4A84F]/30 shadow-md">
                <img
                  src={currentCompany.logo}
                  alt={`${currentCompany.name} Logo`}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display text-2xl font-bold tracking-wider text-white">
                  {currentCompany.name}
                </span>
                <p className="text-[10px] tracking-widest text-[#D4A84F] uppercase font-semibold -mt-1">
                  Real Estate Nigeria
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              "{currentCompany.tagline}"
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {currentCompany.name} is Nigeria’s trusted luxury real estate company, assisting discerning buyers, tenants, and investors with premier residential and commercial properties.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#D4A84F] uppercase tracking-wider block mb-2">
                Follow {currentCompany.name.split(' ')[0] || 'Galaxy'}
              </span>
              <div className="flex items-center space-x-2">
                {/* Facebook */}
                <a
                  href={currentCompany.socials?.facebook || company.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center border border-white/10 transition"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={currentCompany.socials?.instagram || company.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center border border-white/10 transition"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={currentCompany.socials?.linkedin || company.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center border border-white/10 transition"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href={currentCompany.socials?.tiktok || company.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white flex items-center justify-center border border-white/10 transition"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.47c-.01 2.25-.8 4.54-2.39 6.17-1.84 1.95-4.63 2.91-7.37 2.5-2.48-.35-4.78-1.84-6.1-3.99-1.35-2.15-1.56-4.9-.59-7.22.95-2.31 3.05-3.99 5.54-4.41.97-.17 1.96-.13 2.93.11v4.19c-.64-.23-1.34-.28-2.01-.15-1.09.2-2.03.96-2.43 1.99-.44 1.11-.21 2.44.57 3.32.78.9 2.05 1.25 3.19.89 1.12-.34 1.9-1.41 1.93-2.58v-16.7zm0 0"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D4A84F] pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {['Home', 'Properties', 'Gallery', 'Services', 'About', 'Contact'].map((nav) => (
                <li key={nav}>
                  <button
                    onClick={() => onNavClick(nav.toLowerCase())}
                    className="hover:text-[#D4A84F] transition-colors"
                  >
                    {nav}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavClick('admin')}
                  className="text-[#D4A84F] hover:underline font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D4A84F] pl-2">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavClick('services')} className="hover:text-[#D4A84F] transition-colors text-left">
                  Property Sales
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('services')} className="hover:text-[#D4A84F] transition-colors text-left">
                  Property Rentals
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('services')} className="hover:text-[#D4A84F] transition-colors text-left">
                  Property Management
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('services')} className="hover:text-[#D4A84F] transition-colors text-left">
                  Real Estate Investment
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info & Newsletter */}
          <div className="space-y-4">
            <div>
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-[#D4A84F] pl-2">
                Contact Info
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A84F] shrink-0 mt-0.5" />
                  <span>{currentCompany.address}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#D4A84F] shrink-0" />
                  <a href={`tel:${currentCompany.phone}`} className="hover:text-white transition">
                    {currentCompany.phone}
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#D4A84F] shrink-0" />
                  <a href={`mailto:${currentCompany.email}`} className="hover:text-white transition">
                    {currentCompany.email}
                  </a>
                </li>
              </ul>
            </div>

            {/* VIP Off-Market Newsletter Form */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#D4A84F] uppercase tracking-wider block mb-1">
                VIP Off-Market Alerts
              </span>
              <p className="text-[11px] text-slate-400 mb-2 leading-tight">
                Receive prime off-market listings directly in your inbox.
              </p>
              {newsletterSuccess ? (
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Subscribed! Thank you.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-1.5">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A84F]"
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="p-2.5 rounded-xl bg-[#D4A84F] hover:bg-[#c49842] text-[#0B1F3A] font-bold transition disabled:opacity-50 shrink-0"
                    title="Subscribe"
                  >
                    {newsletterSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} {currentCompany.name}. All Rights Reserved.</p>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => onNavClick('admin')}
              className="text-slate-400 hover:text-[#D4A84F] transition"
            >
              Staff Admin Portal
            </button>
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 text-slate-300 hover:text-[#D4A84F] transition"
            aria-label="Scroll to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
