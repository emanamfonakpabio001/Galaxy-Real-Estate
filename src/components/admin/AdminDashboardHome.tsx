import React from 'react';
import { 
  Building, 
  CheckCircle2, 
  FileText, 
  Tag, 
  Key, 
  Sparkles, 
  Inbox, 
  Bell, 
  ArrowRight, 
  PlusCircle, 
  MessageCircle, 
  TrendingUp, 
  Eye, 
  Calendar,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Property, Inquiry, ActivityLogItem } from '../../types';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardHomeProps {
  properties: Property[];
  inquiries: Inquiry[];
  activityLogs: ActivityLogItem[];
  onSelectTab: (tab: AdminTab) => void;
  onEditProperty: (property: Property) => void;
  onSelectInquiry: (inquiry: Inquiry) => void;
  formatNaira: (amount: number) => string;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  properties,
  inquiries,
  activityLogs,
  onSelectTab,
  onEditProperty,
  onSelectInquiry,
  formatNaira,
}) => {
  const publishedCount = properties.filter((p) => p.published !== false).length;
  const draftCount = properties.filter((p) => p.published === false).length;
  const forSaleCount = properties.filter((p) => p.status === 'For Sale').length;
  const forRentCount = properties.filter((p) => p.status === 'For Rent').length;
  const featuredCount = properties.filter((p) => p.featured).length;

  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  const statCards = [
    { label: 'Total Properties', value: properties.length, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'properties' as AdminTab },
    { label: 'Published Live', value: publishedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'properties' as AdminTab },
    { label: 'Draft Properties', value: draftCount, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'properties' as AdminTab },
    { label: 'For Sale', value: forSaleCount, icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-50', tab: 'properties' as AdminTab },
    { label: 'For Rent', value: forRentCount, icon: Key, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'properties' as AdminTab },
    { label: 'Featured Listings', value: featuredCount, icon: Sparkles, color: 'text-[#D4A84F]', bg: 'bg-amber-50/60', tab: 'properties' as AdminTab },
    { label: 'Total Inquiries', value: inquiries.length, icon: Inbox, color: 'text-cyan-600', bg: 'bg-cyan-50', tab: 'inquiries' as AdminTab },
    { label: 'Unread / New Inquiries', value: newInquiriesCount, icon: Bell, color: 'text-red-600', bg: 'bg-red-50', badge: newInquiriesCount > 0, tab: 'inquiries' as AdminTab },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner with Quick Shortcuts */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#122e54] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-700/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4A84F] block mb-1">
            Real Estate Operations Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
            Welcome to Galaxy Real Estate CMS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Manage your property catalog, update website content, review client inquiries, and store media directly in MongoDB GridFS without touching code.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={() => onSelectTab('add-property')}
            className="px-4 py-2.5 bg-[#D4A84F] hover:bg-[#c3973d] text-[#0B1F3A] font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
          <button
            onClick={() => onSelectTab('inquiries')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-white/20 transition"
          >
            <Inbox className="w-4 h-4 text-[#D4A84F]" />
            <span>Inquiries ({newInquiriesCount})</span>
          </button>
        </div>
      </div>

      {/* Metrics 8-Card Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(stat.tab)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#D4A84F]/50 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                {stat.badge && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <div className="text-2xl font-extrabold text-[#0B1F3A] font-display">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5 group-hover:text-[#0B1F3A] transition">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Section: Recent Properties & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Properties Table (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">
                Recent Properties
              </h3>
              <p className="text-xs text-slate-500">Latest listings added to MongoDB</p>
            </div>
            <button
              onClick={() => onSelectTab('properties')}
              className="text-xs font-bold text-[#D4A84F] hover:text-[#b08734] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {properties.slice(0, 5).map((prop) => (
              <div
                key={prop.id}
                onClick={() => onEditProperty(prop)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prop.mainImage || (prop.images && prop.images[0]) || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'}
                    alt={prop.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#0B1F3A] truncate">
                      {prop.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 truncate">
                      {prop.location.neighborhood}, {prop.location.city} • {prop.type}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-bold text-[#0B1F3A]">
                    {formatNaira(prop.price)}
                    {prop.period ? `/${prop.period}` : ''}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-0.5 ${
                    prop.published !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {prop.published !== false ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">
                Recent Inquiries
              </h3>
              <p className="text-xs text-slate-500">Prospective client leads</p>
            </div>
            <button
              onClick={() => onSelectTab('inquiries')}
              className="text-xs font-bold text-[#D4A84F] hover:text-[#b08734] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {inquiries.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No inquiries recorded yet. Forms submitted by visitors will appear here.
              </div>
            ) : (
              inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => onSelectInquiry(inq)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1F3A]">{inq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      inq.status === 'New' ? 'bg-red-100 text-red-700' :
                      inq.status === 'Contacted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                  {inq.propertyTitle && (
                    <div className="text-[11px] text-[#D4A84F] font-semibold truncate">
                      Interested in: {inq.propertyTitle}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{inq.message}"
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{inq.date}</span>
                    <span>{inq.phone || inq.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#0B1F3A]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">
                Live Audit & Activity Timeline
              </h3>
              <p className="text-xs text-slate-500">Persistent log of admin actions in MongoDB</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('activity')}
            className="text-xs font-bold text-[#D4A84F] hover:text-[#b08734] flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#D4A84F] mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1F3A]">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.date} {log.time}</span>
                </div>
                <p className="text-slate-600 mt-0.5 text-[11px]">{log.details}</p>
                <span className="text-[10px] text-slate-400 font-medium">By {log.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
