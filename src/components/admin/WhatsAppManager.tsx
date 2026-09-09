import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Save, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Send, 
  Info,
  ShieldCheck,
  RefreshCw 
} from 'lucide-react';
import { CompanyConfig } from '../../types';
import { api } from '../../services/api';

export const WhatsAppManager: React.FC = () => {
  const [settings, setSettings] = useState<CompanyConfig | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('08066154568');
  const [defaultMessage, setDefaultMessage] = useState('Hello Galaxy Real Estate, I am interested in your luxury properties and would like to speak with a property consultant.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.settings.get();
      if (res.data) {
        setSettings(res.data);
        setWhatsappNumber(res.data.whatsapp || '08066154568');
        if (res.data.defaultWhatsAppMessage) {
          setDefaultMessage(res.data.defaultWhatsAppMessage);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      setErrorMsg('WhatsApp phone number is required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.settings.updateWhatsApp(whatsappNumber.trim(), defaultMessage.trim());
      setSuccessMsg(res.message || 'WhatsApp configuration saved to MongoDB.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update WhatsApp settings.');
    } finally {
      setSaving(false);
    }
  };

  const getCleanNumber = (num: string) => {
    const digits = num.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      return '234' + digits.slice(1);
    }
    return digits;
  };

  const handleTestWhatsApp = () => {
    const clean = getCleanNumber(whatsappNumber);
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading WhatsApp Desk...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
              WhatsApp Desk & Routing Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the primary WhatsApp telephone line for all CTAs, property inquiries, and floating badges
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestWhatsApp}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Test Live WhatsApp Route</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Left Settings (7 cols) & Right Phone Simulator Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Connection Parameters</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Direct Number (Nigeria / International) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 08066154568 or +2348066154568"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#D4A84F]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                International format: <strong className="text-emerald-700">+{getCleanNumber(whatsappNumber)}</strong> (automatically formatted for wa.me links)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Inbound Message Template
              </label>
              <textarea
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This message will automatically pre-populate in WhatsApp when visitors tap on the floating widget or contact button.
              </p>
            </div>

            {/* Information Callout */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#D4A84F]" />
                <span>How WhatsApp Routing Works</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When updated here, the new phone number immediately propagates across the entire platform: the Navbar WhatsApp CTA, the Property Detail "Chat with Agent" button, the Floating Quick Help Badge, and the Footer contact links.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-[#0B1F3A] to-[#15345a] hover:from-[#132c4e] hover:to-[#1b4372] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#D4A84F]" />
              <span>{saving ? 'Updating MongoDB...' : 'Save WhatsApp Configuration'}</span>
            </button>
          </form>
        </div>

        {/* Right Phone Simulator Preview */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0F294D] to-[#08172c] rounded-3xl p-6 text-white border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
            {/* Mock Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Galaxy Luxury Desk</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">+{getCleanNumber(whatsappNumber)}</div>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4A84F] px-2 py-0.5 rounded bg-slate-800">
                Preview
              </span>
            </div>

            {/* Chat Bubble Area */}
            <div className="space-y-4">
              <div className="text-center text-[10px] text-slate-400 font-medium">
                Today • End-to-end encrypted
              </div>

              {/* Inbound Customer Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-emerald-700/90 text-white p-3.5 rounded-2xl rounded-tr-none text-xs shadow-md space-y-1">
                  <p className="leading-relaxed font-sans">{defaultMessage}</p>
                  <div className="text-[9px] text-emerald-200 text-right">Just now • Sent ✓✓</div>
                </div>
              </div>

              {/* Bot / Agent Instant Auto-Reply */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-slate-800/90 text-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs shadow-md space-y-1 border border-slate-700">
                  <p className="leading-relaxed font-sans">
                    Hello! Thank you for reaching Galaxy Real Estate. An executive luxury consultant is reviewing your inquiry and will connect in a moment.
                  </p>
                  <div className="text-[9px] text-slate-400 text-right">Just now</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Link Card */}
          <div className="mt-8 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Live WhatsApp Window</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
