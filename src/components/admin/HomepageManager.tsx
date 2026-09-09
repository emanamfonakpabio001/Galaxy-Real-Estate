import React, { useState, useEffect } from 'react';
import { Save, Sparkles, RefreshCw, Upload, Plus, Trash2 } from 'lucide-react';
import { HomepageContent } from '../../types';
import { api } from '../../services/api';

export const HomepageManager: React.FC = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      setLoading(true);
      const res = await api.content.getHomepage();
      const d = res.data || ({} as any);

      // Robust normalization of data to handle any DB schema format
      const normalized: HomepageContent = {
        ...d,
        hero: {
          badge: d.hero?.badge || 'Nigeria’s Premier Luxury Real Estate Marketplace',
          title: d.hero?.title || d.heroHeading || 'Find a Place You’ll Love To Call Home.',
          subtitleAccent: d.hero?.subtitleAccent || 'Curated for the Discerning Elite',
          subtitle: d.hero?.subtitle || d.heroSubtitle || 'Discover exceptional properties, premium homes, and investment opportunities with Galaxy.',
          backgroundImage: d.hero?.backgroundImage || d.heroImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85',
          exploreButtonText: d.hero?.exploreButtonText || d.heroButtonText || 'Explore Properties',
          contactButtonText: d.hero?.contactButtonText || 'Contact an Agent',
        },
        stats: Array.isArray(d.stats) && d.stats.length > 0
          ? d.stats
          : d.stats && typeof d.stats === 'object'
          ? [
              { label: 'Active Listings', value: d.stats.activeListings || '1234+' },
              { label: 'Properties Brokered', value: d.stats.propertyBrokered || '₦45B+' },
              { label: 'Satisfied Clients', value: d.stats.satisfiedClients || '879+' },
              { label: 'Years of Excellence', value: d.stats.yearsExcellence || '5+' },
            ]
          : [
              { label: 'Active Listings', value: '1234+' },
              { label: 'Properties Brokered', value: '₦45B+' },
              { label: 'Satisfied Clients', value: '879+' },
              { label: 'Years of Excellence', value: '5+' },
            ],
        whyChoose: Array.isArray(d.whyChoose)
          ? d.whyChoose
          : Array.isArray(d.whyChoosePoints)
          ? d.whyChoosePoints
          : [
              {
                title: '100% Verified Legal Titles',
                description: 'Every property undergoes rigorous title searches at Lands Registry & AGIS.',
                icon: 'ShieldCheck',
              },
              {
                title: 'Direct Developer & Owner Access',
                description: 'Avoid inflated intermediary markups with direct access to prime developments.',
                icon: 'KeyRound',
              },
              {
                title: 'Dedicated Client Care & Concierge',
                description: 'Your personal Galaxy advisor is available around the clock.',
                icon: 'Headphones',
              },
              {
                title: 'High Capital Appreciation Corridors',
                description: 'Top-tier growth zones in Maitama, Ikoyi, Banana Island, Guzape, and Uyo.',
                icon: 'TrendingUp',
              },
            ],
        ctaSection: {
          title: d.ctaSection?.title || d.ctaHeading || 'Ready to Acquire Your Next Luxury Property in Nigeria?',
          subtitle: d.ctaSection?.subtitle || d.ctaDescription || 'Speak with our senior luxury property specialists today for bespoke private viewings.',
          buttonText: d.ctaSection?.buttonText || d.ctaButtonText || 'Schedule Private Consultation',
          buttonLink: d.ctaSection?.buttonLink || d.ctaButtonLink || '#contact',
        },
      };

      setContent(normalized);
    } catch (err) {
      console.error('Failed to load homepage content:', err);
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
      await api.content.updateHomepage(content);
      setSuccessMsg('Homepage content updated successfully and saved to MongoDB.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update homepage content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading Homepage CMS...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Homepage Content Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify the hero section, statistics, brand features, and call-to-action blocks
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save Homepage Changes'}</span>
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

      {/* 1. Hero Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4A84F]" />
          <span>1. Hero Banner & Messaging</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={content.hero.badge || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
              placeholder="e.g. Nigeria's Premier Luxury Real Estate Marketplace"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
              placeholder="e.g. Discover Exceptional Properties in Prime Nigerian Locations"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Golden Accent Title Phrase
            </label>
            <input
              type="text"
              value={content.hero.subtitleAccent || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitleAccent: e.target.value } })}
              placeholder="e.g. Curated for the Discerning Elite"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hero Paragraph Subtitle
            </label>
            <textarea
              value={content.hero.subtitle}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Background Hero Image URL (or GridFS image path)
            </label>
            <input
              type="text"
              value={content.hero.backgroundImage}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>
        </div>
      </div>

      {/* 2. Statistical Highlights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
          2. Verified Statistics Counters
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {content.stats.map((stat, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Stat #{idx + 1}
              </label>
              <input
                type="text"
                value={stat.value}
                onChange={(e) => {
                  const newStats = [...content.stats];
                  newStats[idx].value = e.target.value;
                  setContent({ ...content, stats: newStats });
                }}
                placeholder="Value (e.g. ₦120B+)"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-[#0B1F3A]"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const newStats = [...content.stats];
                  newStats[idx].label = e.target.value;
                  setContent({ ...content, stats: newStats });
                }}
                placeholder="Label"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Why Choose Galaxy Items */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
          3. "Why Choose Galaxy" Value Pillars
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.whyChoose.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                Pillar #{idx + 1}
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const updated = [...content.whyChoose];
                  updated[idx].title = e.target.value;
                  setContent({ ...content, whyChoose: updated });
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0B1F3A]"
              />
              <textarea
                value={item.description}
                onChange={(e) => {
                  const updated = [...content.whyChoose];
                  updated[idx].description = e.target.value;
                  setContent({ ...content, whyChoose: updated });
                }}
                rows={2}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. CTA Banner Block */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
          4. Bottom Call-To-Action (CTA) Section
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Title</label>
            <input
              type="text"
              value={content.ctaSection.title}
              onChange={(e) => setContent({ ...content, ctaSection: { ...content.ctaSection, title: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Button Label</label>
            <input
              type="text"
              value={content.ctaSection.buttonText}
              onChange={(e) => setContent({ ...content, ctaSection: { ...content.ctaSection, buttonText: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Subtitle</label>
            <textarea
              value={content.ctaSection.subtitle}
              onChange={(e) => setContent({ ...content, ctaSection: { ...content.ctaSection, subtitle: e.target.value } })}
              rows={2}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Bottom Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save All Homepage Content'}</span>
        </button>
      </div>

    </form>
  );
};
