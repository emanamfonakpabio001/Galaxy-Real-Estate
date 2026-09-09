import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Sparkles, Plus, Trash2, Info } from 'lucide-react';
import { AboutContent } from '../../types';
import { api } from '../../services/api';

export const AboutManager: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      setLoading(true);
      const res = await api.content.getAbout();
      const d = res.data || ({} as any);

      const rawValues = Array.isArray(d.values)
        ? d.values
        : Array.isArray(d.coreValues)
        ? d.coreValues
        : [
            {
              title: 'Integrity & Transparency',
              description: 'We prioritize honest advisory and zero hidden costs in all property transactions.',
            },
            {
              title: 'Architectural Excellence',
              description: 'We exclusively list properties characterized by superior structural integrity.',
            },
            {
              title: 'Client Discretion',
              description: 'High-net-worth individuals and corporate institutions trust us for utmost privacy.',
            },
            {
              title: 'Innovation & Smart Living',
              description: 'We champion sustainable, solar-integrated, and smart-automated modern homes.',
            },
          ];

      const rawImages = Array.isArray(d.images) && d.images.length > 0
        ? d.images
        : d.image
        ? [d.image]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

      const normalized: AboutContent = {
        title: d.title || 'Pioneering Luxury Real Estate Across Nigeria',
        subtitle: d.subtitle || 'Galaxy Real Estate is a premier real estate brokerage and development advisory firm.',
        description: d.description || 'Founded with a vision to deliver world-class real estate experiences, Galaxy Real Estate has grown into one of Nigeria’s most trusted real estate companies.',
        mission: d.mission || 'To deliver transparent, seamless, and high-yield real estate solutions that empower individuals and institutions.',
        vision: d.vision || 'To be Africa’s premier luxury real estate ecosystem, recognized globally for architectural distinction.',
        values: rawValues,
        coreValues: rawValues,
        images: rawImages,
        image: rawImages[0],
        additionalSections: Array.isArray(d.additionalSections) ? d.additionalSections : [],
      };

      setContent(normalized);
    } catch (err) {
      console.error('Failed to load about content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.content.updateAbout(content);
      setSuccessMsg('About Us content updated successfully in MongoDB.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update about content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading About Us CMS...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            About Us & Corporate Identity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company biography, mission, vision statements, and core values
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save About Us'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Biography & Hero */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
          1. Company Overview & Hero
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Page Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Slogan</label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Company Story & Narrative</label>
            <textarea
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Banner Image URL</label>
            <input
              type="text"
              value={content.images[0] || ''}
              onChange={(e) => {
                const newImgs = [...content.images];
                newImgs[0] = e.target.value;
                setContent({ ...content, images: newImgs });
              }}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Mission */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-2">
            Our Mission Statement
          </h3>
          <textarea
            value={content.mission}
            onChange={(e) => setContent({ ...content, mission: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
          />
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-2">
            Our Vision Statement
          </h3>
          <textarea
            value={content.vision}
            onChange={(e) => setContent({ ...content, vision: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
          />
        </div>

      </div>

      {/* Core Values */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
          Core Principles & Corporate Values
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.values.map((val, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Value #{idx + 1}
              </label>
              <input
                type="text"
                value={val.title}
                onChange={(e) => {
                  const updated = [...content.values];
                  updated[idx].title = e.target.value;
                  setContent({ ...content, values: updated });
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0B1F3A]"
              />
              <textarea
                value={val.description}
                onChange={(e) => {
                  const updated = [...content.values];
                  updated[idx].description = e.target.value;
                  setContent({ ...content, values: updated });
                }}
                rows={2}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save About Us Content'}</span>
        </button>
      </div>

    </form>
  );
};
