import React, { useState } from 'react';
import { 
  Menu, 
  ExternalLink, 
  Lock, 
  Bell, 
  Search, 
  Sparkles, 
  Building, 
  PlusCircle, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminUser, Property } from '../../types';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLockDashboard: () => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  user: AdminUser;
  unreadInquiriesCount: number;
  onOpenPreview?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onLockDashboard,
  onLogout,
  onViewPublicSite,
  user,
  unreadInquiriesCount,
  onOpenPreview,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'dashboard': return 'Command Dashboard';
      case 'properties': return 'Property Catalog';
      case 'add-property': return 'Publish New Property';
      case 'media': return 'Media & GridFS Asset Library';
      case 'homepage': return 'Homepage Content Editor';
      case 'about': return 'About Us Company Profile';
      case 'services': return 'Real Estate Services';
      case 'testimonials': return 'Client Reviews & Testimonials';
      case 'inquiries': return 'Customer Inquiries & Leads';
      case 'contact': return 'Contact & Office Locations';
      case 'whatsapp': return 'WhatsApp Desk & Routing';
      case 'seo': return 'SEO & Meta Tag Optimization';
      case 'settings': return 'Global Brand & Website Settings';
      case 'profile': return 'Admin Security & Credentials';
      case 'activity': return 'Audit & Activity Timeline';
      case 'backup': return 'System Backup & Recovery';
      default: return 'Admin Console';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col lg:flex-row antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onLockDashboard={onLockDashboard}
        onLogout={onLogout}
        onViewPublicSite={onViewPublicSite}
        unreadInquiriesCount={unreadInquiriesCount}
        user={user}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] uppercase font-extrabold text-[#D4A84F] tracking-widest">
                Galaxy Management System
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#0B1F3A] tracking-tight">
                {getTabTitle(activeTab)}
              </h1>
            </div>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Add Property Shortcut */}
            {activeTab !== 'add-property' && (
              <button
                type="button"
                onClick={() => onSelectTab('add-property')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#0B1F3A] hover:bg-[#132c4e] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D4A84F]" />
                <span>Add Property</span>
              </button>
            )}

            {/* Inquiries Notification Bell */}
            <button
              type="button"
              onClick={() => onSelectTab('inquiries')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 transition"
              title="View Inquiries"
            >
              <Bell className="w-4 h-4" />
              {unreadInquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Live Website Preview Button */}
            <button
              type="button"
              onClick={onViewPublicSite}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#D4A84F]/15 hover:bg-[#D4A84F]/25 text-[#0B1F3A] border border-[#D4A84F]/30 rounded-xl text-xs font-bold transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4A84F]" />
              <span className="hidden md:inline">View Public Website</span>
              <span className="md:hidden">Website</span>
            </button>

            {/* Lock Shortcut */}
            <button
              type="button"
              onClick={onLockDashboard}
              title="Lock Dashboard Session"
              className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
            >
              <Lock className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Dynamic Tab Body Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
