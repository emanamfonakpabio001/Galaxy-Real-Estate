import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, Globe, Palette, Shield } from 'lucide-react';
import { CompanyConfig } from '../../types';
import { api } from '../../services/api';

export const SettingsManager: React.FC = () => {
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
    if (!settings) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.settings.update(settings);
      setSuccessMsg('Website brand & global settings saved to MongoDB.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading Settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Global Brand & Website Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company legal name, tagline, branding assets, copyright notices, and footer description
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
        
        {/* Brand Identity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4A84F]" />
            <span>Brand Identity</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Trade Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand Tagline / Slogan</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Footer Biography Summary</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>
        </div>

        {/* Legal & Brand Colors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#D4A84F]" />
            <span>Palette & Corporate Registration</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor || '#0B1F3A'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                />
                <span className="text-xs font-mono font-bold text-slate-700">{settings.primaryColor || '#0B1F3A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gold Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accentColor || '#D4A84F'}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                />
                <span className="text-xs font-mono font-bold text-slate-700">{settings.accentColor || '#D4A84F'}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Footer Notice</label>
            <input
              type="text"
              value={settings.copyrightText || `© ${new Date().getFullYear()} Galaxy Real Estate. All rights reserved.`}
              onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">CAC Registration / License No. (Optional)</label>
            <input
              type="text"
              value={settings.cacNumber || 'RC-1849204'}
              onChange={(e) => setSettings({ ...settings, cacNumber: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save Website Settings'}</span>
        </button>
      </div>

    </form>
  );
};
