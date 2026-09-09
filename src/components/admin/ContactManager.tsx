import React, { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Clock, RefreshCw, Check, Plus, Trash2 } from 'lucide-react';
import { CompanyConfig } from '../../types';
import { api } from '../../services/api';

export const ContactManager: React.FC = () => {
  const [settings, setSettings] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.settings.get();
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error('Failed to load contact info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.settings.update(settings);
      setSuccessMsg('Contact & Office details updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update contact info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading Contact Manager...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Contact Information & Headquarters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate telephone lines, official emails, street addresses, and office hours
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save Contact Details'}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Phone & Email */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#D4A84F]" />
            <span>Direct Communications</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Telephone Line</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Inquiry Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Working Hours</label>
            <input
              type="text"
              value={settings.workingHours || ''}
              onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
              placeholder="e.g. Mon – Sat: 8:00 AM – 6:00 PM"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4A84F]" />
            <span>Headquarters Address</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={settings.address.street}
              onChange={(e) => setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={settings.address.city}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, city: e.target.value } })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
              <input
                type="text"
                value={settings.address.state}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, state: e.target.value } })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save All Contact Info'}</span>
        </button>
      </div>

    </form>
  );
};
