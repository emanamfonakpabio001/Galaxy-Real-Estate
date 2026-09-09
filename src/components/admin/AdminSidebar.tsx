import React from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Image as ImageIcon,
  Home,
  Info,
  Briefcase,
  Quote,
  Inbox,
  PhoneCall,
  MessageCircle,
  Globe,
  Settings,
  User,
  History,
  Database,
  Lock,
  LogOut,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { AdminUser } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'properties'
  | 'add-property'
  | 'media'
  | 'homepage'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'inquiries'
  | 'contact'
  | 'whatsapp'
  | 'seo'
  | 'settings'
  | 'profile'
  | 'activity'
  | 'backup';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLockDashboard: () => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  unreadInquiriesCount: number;
  user: AdminUser;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLockDashboard,
  onLogout,
  onViewPublicSite,
  unreadInquiriesCount,
  user,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'properties', label: 'Properties', icon: Building, category: 'Real Estate' },
    { id: 'add-property', label: 'Add Property', icon: PlusCircle, category: 'Real Estate' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, category: 'Real Estate' },
    { id: 'inquiries', label: 'Inquiries', icon: Inbox, badge: unreadInquiriesCount, category: 'Clients' },
    { id: 'whatsapp', label: 'WhatsApp Desk', icon: MessageCircle, category: 'Clients' },
    { id: 'homepage', label: 'Homepage', icon: Home, category: 'Content CMS' },
    { id: 'about', label: 'About Us', icon: Info, category: 'Content CMS' },
    { id: 'services', label: 'Services', icon: Briefcase, category: 'Content CMS' },
    { id: 'testimonials', label: 'Testimonials', icon: Quote, category: 'Content CMS' },
    { id: 'contact', label: 'Contact Info', icon: PhoneCall, category: 'Content CMS' },
    { id: 'seo', label: 'SEO & Meta Tags', icon: Globe, category: 'Configuration' },
    { id: 'settings', label: 'Website Settings', icon: Settings, category: 'Configuration' },
    { id: 'profile', label: 'Admin Profile', icon: User, category: 'System' },
    { id: 'activity', label: 'Activity Log', icon: History, category: 'System' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, category: 'System' },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id as AdminTab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-[#0B1F3A] text-white flex flex-col border-r border-slate-800 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4A84F] to-[#b88c3a] flex items-center justify-center text-[#0B1F3A] font-extrabold shadow-md">
              G
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white font-display">
                GALAXY CMS
              </div>
              <div className="text-[10px] uppercase font-bold text-[#D4A84F] tracking-widest">
                Real Estate Engine
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick User Card */}
        <div className="px-5 py-4 bg-[#071527] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || 'https://i.imgur.com/uHj7q5k.png'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-[#D4A84F]/40"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
          <button
            onClick={onViewPublicSite}
            title="View Live Public Website"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-slate-300 transition text-xs flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showCategory = idx === 0 || menuItems[idx - 1].category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {showCategory && (
                  <div className="px-3 pt-3 pb-1 text-[9px] uppercase font-extrabold tracking-widest text-slate-400">
                    {item.category}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4A84F] to-[#c7983c] text-[#0B1F3A] font-bold shadow-md shadow-[#D4A84F]/10'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B1F3A]' : 'text-[#D4A84F] group-hover:text-white transition'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-[#0B1F3A] text-[#D4A84F]' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer Security Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#071527] space-y-2">
          {/* Lock Dashboard Button */}
          <button
            type="button"
            onClick={onLockDashboard}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700/60"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock Dashboard</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl hover:bg-red-950/40 text-slate-400 hover:text-red-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </aside>
    </>
  );
};
