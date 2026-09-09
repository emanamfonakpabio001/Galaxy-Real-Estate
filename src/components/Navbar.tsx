import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, Phone, Building, Compass, Sparkles, Shield } from 'lucide-react';
import { CompanyConfig } from '../types';
import { company } from '../config/company';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  favoritesCount: number;
  openFavoritesDrawer: () => void;
  onFindPropertyClick: () => void;
  onAdminClick?: () => void;
  companyConfig?: CompanyConfig | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  favoritesCount,
  openFavoritesDrawer,
  onFindPropertyClick,
  onAdminClick,
  companyConfig,
}) => {
  const currentCompany = companyConfig || company;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Properties', id: 'properties' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Services', id: 'services' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    // Smooth scroll to top or target section if on home
    if (viewId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(viewId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg h-[72px] border-b border-[#D4A84F]/30'
          : 'bg-[#0B1F3A] h-[72px] border-b border-[#D4A84F]/30'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 group text-left focus:outline-none cursor-pointer"
            aria-label={`${currentCompany.name} Home`}
          >
            <div className="h-10 w-10 flex items-center justify-center rounded overflow-hidden group-hover:scale-105 transition-transform bg-white/5 p-0.5 border border-[#D4A84F]/30">
              <img
                src={currentCompany.logo}
                alt={`${currentCompany.name} Logo`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold text-2xl tracking-tight uppercase font-display">
                {currentCompany.name.split(' ')[0] || 'Galaxy'}
              </span>
              <span className="hidden sm:inline text-[10px] tracking-widest text-[#D4A84F] uppercase font-semibold">
                {currentCompany.name.split(' ').slice(1).join(' ') || 'Real Estate'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-white/90 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`transition-colors duration-200 py-1 ${
                    isActive
                      ? 'text-[#D4A84F] border-b-2 border-[#D4A84F] pb-1'
                      : 'hover:text-[#D4A84F]'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Favorites Icon Button */}
            <button
              id="navbar-favorites-btn"
              onClick={openFavoritesDrawer}
              className="relative p-2 rounded bg-white/5 hover:bg-white/10 text-white hover:text-[#D4A84F] border border-white/10 transition"
              title="Saved Properties"
              aria-label="View Saved Favorites"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4A84F] text-[#0B1F3A] text-[10px] font-bold flex items-center justify-center shadow-md">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Direct Phone / Contact shortcut */}
            <a
              href={`tel:${company.phone}`}
              className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 hover:text-white bg-white/5 px-3 py-2 rounded border border-white/10 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4A84F]" />
              <span className="font-medium">{company.phone}</span>
            </a>

            {/* Admin Portal Shortcut */}
            <button
              id="navbar-admin-btn"
              onClick={onAdminClick || (() => handleNavClick('admin'))}
              className="p-2 rounded bg-white/5 hover:bg-[#D4A84F]/20 text-white/80 hover:text-[#D4A84F] border border-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Admin Portal"
            >
              <Shield className="w-4 h-4 text-[#D4A84F]" />
              <span className="hidden xl:inline">Admin</span>
            </button>

            {/* Primary "Find a Property" CTA */}
            <button
              id="navbar-find-property-btn"
              onClick={onFindPropertyClick}
              className="bg-[#D4A84F] text-[#0B1F3A] px-5 py-2.5 rounded text-sm font-bold hover:brightness-110 uppercase tracking-wide transition-all shadow-sm"
            >
              Find a Property
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={openFavoritesDrawer}
              className="relative p-2 rounded bg-white/10 text-white text-sm"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4A84F] text-[#0B1F3A] text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded bg-white/10 text-white hover:bg-white/20 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className="sm:hidden bg-[#0B1F3A] border-b border-[#D4A84F]/30 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200"
        >
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition ${
                  currentView === link.id
                    ? 'bg-[#D4A84F]/15 text-[#D4A84F] font-semibold border-l-4 border-[#D4A84F]'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onFindPropertyClick();
              }}
              className="w-full py-3 rounded-xl bg-[#D4A84F] hover:bg-[#c49842] text-[#0B1F3A] font-bold text-center flex items-center justify-center space-x-2 shadow-md"
            >
              <Compass className="w-5 h-5" />
              <span>Find a Property</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onAdminClick) onAdminClick();
                else handleNavClick('admin');
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium flex items-center justify-center space-x-2 border border-white/10"
            >
              <Shield className="w-4 h-4 text-[#D4A84F]" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
