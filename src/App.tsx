import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedProperties } from './components/FeaturedProperties';
import { StatsSection } from './components/StatsSection';
import { PropertiesPage } from './components/PropertiesPage';
import { GalleryPage } from './components/GalleryPage';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AboutSection } from './components/AboutSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { MortgageCalculator } from './components/MortgageCalculator';
import { CTASection } from './components/CTASection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PROPERTIES_DATA } from './data/properties';
import { Property, FilterState, FilterCriteria, HomepageContent, AboutContent, ServiceItem, Testimonial, CompanyConfig } from './types';
import { formatNaira } from './utils/formatters';
import { api } from './services/api';

export function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState<'home' | 'properties' | 'gallery' | 'services' | 'about' | 'contact' | 'admin'>('home');
  
  // Dynamic properties dataset (initialized with static fallback)
  const [properties, setProperties] = useState<Property[]>(PROPERTIES_DATA);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Dynamic CMS Content from MongoDB
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);

  // Selected Property for Full Details Modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Schedule Viewing Modal
  const [scheduleViewingProperty, setScheduleViewingProperty] = useState<Property | null>(null);

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('galaxy_favorite_properties');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  // Filter state (can be populated from Hero Search and sent into Properties view)
  const [searchFilters, setSearchFilters] = useState<Partial<FilterCriteria>>({});

  // Comprehensive data loader for properties + all CMS content
  const loadLiveProperties = async () => {
    try {
      setLoadingProperties(true);
      const res = await api.properties.getPublished();
      if (res.data && res.data.length > 0) {
        setProperties(res.data);
      }
    } catch (err) {
      console.warn('Using seeded catalog while loading backend:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadAllCmsContent = async () => {
    loadLiveProperties();
    try {
      const [homeRes, aboutRes, servicesRes, testRes, compRes] = await Promise.allSettled([
        api.content.getHomepage(),
        api.content.getAbout(),
        api.content.getServices(),
        api.content.getTestimonials(),
        api.settings.get(),
      ]);

      if (homeRes.status === 'fulfilled' && homeRes.value.data) {
        setHomepageContent(homeRes.value.data);
      }
      if (aboutRes.status === 'fulfilled' && aboutRes.value.data) {
        setAboutContent(aboutRes.value.data);
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value.data && servicesRes.value.data.length > 0) {
        setServices(servicesRes.value.data);
      }
      if (testRes.status === 'fulfilled' && testRes.value.data && testRes.value.data.length > 0) {
        setTestimonials(testRes.value.data);
      }
      if (compRes.status === 'fulfilled' && compRes.value.data) {
        setCompanyConfig(compRes.value.data);
      }
    } catch (err) {
      console.warn('Error fetching dynamic CMS data:', err);
    }
  };

  // Initial load + reactive listener for whenever admin saves changes in the dashboard
  useEffect(() => {
    loadAllCmsContent();

    const handleContentUpdated = () => {
      loadAllCmsContent();
    };

    window.addEventListener('galaxy_content_updated', handleContentUpdated);
    return () => {
      window.removeEventListener('galaxy_content_updated', handleContentUpdated);
    };
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('galaxy_favorite_properties', JSON.stringify(favorites));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [favorites]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleClearFavorites = () => {
    setFavorites([]);
  };

  const handleHeroSearch = (filters: FilterState) => {
    setSearchFilters(filters);
    setActiveView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (viewId: string) => {
    if (viewId === 'admin') {
      setActiveView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (viewId === 'properties') {
      setActiveView('properties');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'gallery') {
      setActiveView('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'home') {
      setActiveView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If we are on properties, gallery, or admin page and user clicks about/services/contact, switch to home then scroll to section
      if (activeView === 'properties' || activeView === 'gallery' || activeView === 'admin') {
        setActiveView('home');
        setTimeout(() => {
          const el = document.getElementById(viewId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(viewId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const favoritePropertiesList = properties.filter((p) => favorites.includes(p.id));

  // If Admin View is active, render the complete full-stack Admin Suite
  if (activeView === 'admin') {
    return (
      <AdminDashboard
        onViewPublicSite={() => {
          setActiveView('home');
          loadLiveProperties();
        }}
        onPreviewProperty={(property) => {
          setSelectedProperty(property);
          setActiveView('home');
        }}
        formatNaira={formatNaira}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans flex flex-col selection:bg-[#D4A84F] selection:text-[#0B1F3A]">
      
      {/* Navigation Bar */}
      <Navbar
        currentView={activeView}
        setCurrentView={handleNavigate}
        favoritesCount={favorites.length}
        openFavoritesDrawer={() => setIsFavoritesDrawerOpen(true)}
        onFindPropertyClick={() => handleNavigate('properties')}
        onAdminClick={() => handleNavigate('admin')}
        companyConfig={companyConfig}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* Cinematic Hero Section with Search */}
            <Hero
              onSearch={handleHeroSearch}
              onExploreClick={() => handleNavigate('properties')}
              onContactClick={() => handleNavigate('contact')}
              content={homepageContent}
              companyConfig={companyConfig}
            />

            {/* Featured Properties Showcase */}
            <FeaturedProperties
              properties={properties}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
              onViewAllClick={() => handleNavigate('properties')}
            />

            {/* Statistics Section (immediately below Featured Properties) */}
            <StatsSection
              content={homepageContent}
              companyConfig={companyConfig}
            />

            {/* Services Section */}
            <ServicesSection
              onContactClick={() => handleNavigate('contact')}
              services={services}
            />

            {/* Why Choose Galaxy + Statistics */}
            <WhyChooseUs
              content={homepageContent}
              companyConfig={companyConfig}
            />

            {/* Financial Calculator */}
            <MortgageCalculator />

            {/* About Galaxy Section */}
            <AboutSection
              onContactClick={() => handleNavigate('contact')}
              onExploreClick={() => handleNavigate('properties')}
              content={aboutContent}
              companyConfig={companyConfig}
            />

            {/* Client Testimonials */}
            <TestimonialsSection
              testimonials={testimonials}
            />

            {/* Call To Action */}
            <CTASection
              onBrowseProperties={() => handleNavigate('properties')}
              onTalkToAgent={() => handleNavigate('contact')}
              content={homepageContent}
            />

            {/* Contact Section */}
            <ContactSection companyConfig={companyConfig} />
          </>
        )}

        {activeView === 'properties' && (
          /* Full Properties Directory Page */
          <PropertiesPage
            properties={properties}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            initialFilters={searchFilters}
          />
        )}

        {activeView === 'gallery' && (
          /* Separate Architectural Gallery Page */
          <GalleryPage
            properties={properties}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateContact={() => handleNavigate('contact')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavClick={handleNavigate}
        onFilterService={() => handleNavigate('services')}
        companyConfig={companyConfig}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloatingButton />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={toggleFavorite}
          onOpenScheduleModal={(prop) => setScheduleViewingProperty(prop)}
        />
      )}

      {/* Schedule Viewing Modal */}
      {scheduleViewingProperty && (
        <ScheduleViewingModal
          property={scheduleViewingProperty}
          onClose={() => setScheduleViewingProperty(null)}
        />
      )}

      {/* Saved Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favoritePropertiesList}
        onRemoveFavorite={toggleFavorite}
        onSelectProperty={(prop) => setSelectedProperty(prop)}
        onClearAll={handleClearFavorites}
      />

    </div>
  );
}
export default App;
