import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Trash2, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Building,
  RefreshCw,
  ExternalLink,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Inquiry } from '../../types';
import { api } from '../../services/api';

interface InquiriesManagerProps {
  inquiries: Inquiry[];
  onRefresh: () => void;
  selectedInquiryFromDashboard?: Inquiry | null;
}

export const InquiriesManager: React.FC<InquiriesManagerProps> = ({
  inquiries,
  onRefresh,
  selectedInquiryFromDashboard,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(selectedInquiryFromDashboard || null);
  const [notesInput, setNotesInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (selectedInquiryFromDashboard) {
      setActiveInquiry(selectedInquiryFromDashboard);
      setNotesInput(selectedInquiryFromDashboard.notes || '');
    } else if (inquiries.length > 0 && !activeInquiry) {
      setActiveInquiry(inquiries[0]);
      setNotesInput(inquiries[0].notes || '');
    }
  }, [selectedInquiryFromDashboard, inquiries]);

  const filteredInquiries = inquiries.filter((inq) => {
    if (selectedStatus !== 'all' && inq.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        inq.name.toLowerCase().includes(q) ||
        (inq.email && inq.email.toLowerCase().includes(q)) ||
        (inq.phone && inq.phone.toLowerCase().includes(q)) ||
        (inq.propertyTitle && inq.propertyTitle.toLowerCase().includes(q)) ||
        inq.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSelectInquiry = (inq: Inquiry) => {
    setActiveInquiry(inq);
    setNotesInput(inq.notes || '');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdating(true);
      await api.inquiries.updateStatus(id, newStatus, notesInput);
      if (activeInquiry && activeInquiry.id === id) {
        setActiveInquiry({ ...activeInquiry, status: newStatus as any });
      }
      onRefresh();
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    try {
      setUpdating(true);
      await api.inquiries.updateStatus(activeInquiry.id, activeInquiry.status, notesInput);
      setActiveInquiry({ ...activeInquiry, notes: notesInput });
      onRefresh();
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      await api.inquiries.delete(id);
      if (activeInquiry?.id === id) setActiveInquiry(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const handleWhatsAppReply = (inq: Inquiry) => {
    if (!inq.phone) {
      alert('This inquiry does not have a phone number attached.');
      return;
    }
    const cleanPhone = inq.phone.replace(/\D/g, '');
    const greeting = `Hello ${inq.name}, thank you for reaching out to Galaxy Real Estate regarding ${
      inq.propertyTitle ? `"${inq.propertyTitle}"` : 'our property portfolio'
    }. I am an executive property advisor at Galaxy. How can I assist you today?`;

    const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(greeting)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Customer Inquiries & Leads ({inquiries.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming contact submissions, client inspection requests, and direct WhatsApp engagements
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D4A84F]" />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['all', 'New', 'Contacted', 'In Progress', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  selectedStatus === st
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Leads' : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, property..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

        </div>
      </div>

      {/* Split Inquiries: Left List (5 cols) & Right Detail View (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2 max-h-[700px] overflow-y-auto">
          {filteredInquiries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No inquiries found matching your filters.
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = activeInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => handleSelectInquiry(inq)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-[#D4A84F] bg-amber-50/40 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1F3A]">{inq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      inq.status === 'New' ? 'bg-red-100 text-red-700' :
                      inq.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                      inq.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  {inq.propertyTitle && (
                    <div className="text-[11px] text-[#D4A84F] font-semibold truncate">
                      {inq.propertyTitle}
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
              );
            })
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          {activeInquiry ? (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0B1F3A]">{activeInquiry.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      activeInquiry.status === 'New' ? 'bg-red-100 text-red-700' :
                      activeInquiry.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                      activeInquiry.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {activeInquiry.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Submitted on {activeInquiry.date}</div>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Direct */}
                  {activeInquiry.phone && (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppReply(activeInquiry)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Client</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(activeInquiry.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Meta Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <a href={`mailto:${activeInquiry.email}`} className="font-semibold text-blue-600 hover:underline">
                    {activeInquiry.email || 'None provided'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <a href={`tel:${activeInquiry.phone}`} className="font-semibold text-slate-800 hover:underline">
                    {activeInquiry.phone || 'None provided'}
                  </a>
                </div>
              </div>

              {/* Property Inquired */}
              {activeInquiry.propertyTitle && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-[#D4A84F] tracking-wide">
                    Associated Listing
                  </div>
                  <div className="text-sm font-bold text-[#0B1F3A]">
                    {activeInquiry.propertyTitle}
                  </div>
                  {activeInquiry.propertyPrice && (
                    <div className="text-xs font-semibold text-slate-600">
                      Listed Value: ₦{activeInquiry.propertyPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Message */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">
                  Client Message
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed">
                  "{activeInquiry.message}"
                </div>
              </div>

              {/* Status Update Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pipeline Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['New', 'Contacted', 'In Progress', 'Closed'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleUpdateStatus(activeInquiry.id, s)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        activeInquiry.status === s
                          ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={3}
                  placeholder="Record outcome of phone calls, scheduled inspection dates, client budget preferences..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updating}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#D4A84F]" />
                  <span>{updating ? 'Saving...' : 'Save Internal Notes'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Inbox className="w-10 h-10 text-slate-300 mb-2" />
              <span>Select an inquiry from the left list to view details and reply.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
