import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, Globe, Search, Share2 } from 'lucide-react';
import { SEOConfig } from '../../types';
import { api } from '../../services/api';

export const SEOManager: React.FC = () => {
  const [seo, setSeo] = useState<SEOConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const loadSEO = async () => {
    try {
      setLoading(true);
      const res = await api.content.getSEO();
      const d = res.data || ({} as any);
      
      const parsedKeywords = Array.isArray(d.keywords)
        ? d.keywords
        : typeof d.defaultKeywords === 'string' && d.defaultKeywords.trim()
        ? d.defaultKeywords.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['real estate nigeria', 'luxury homes abuja', 'lagos penthouses', 'property for sale nigeria'];

      setSeo({
        websiteTitle: d.websiteTitle || 'Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria',
        metaTitle: d.metaTitle || d.websiteTitle || 'Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria',
        metaDescription: d.metaDescription || 'Browse verified luxury houses, modern penthouses, villas, and prime plots of land for sale and rent in Abuja, Lagos, Port Harcourt, and Uyo with Galaxy Real Estate.',
        ogImage: d.ogImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        defaultKeywords: d.defaultKeywords || parsedKeywords.join(', '),
        keywords: parsedKeywords,
        propertySeoTitle: d.propertySeoTitle || '{title} | Galaxy Real Estate Nigeria',
        propertySeoDescription: d.propertySeoDescription || '{shortDescription} Located in {city}, Nigeria. Listed at {price}. Contact Galaxy Real Estate for viewing.',
        socialSharingImage: d.socialSharingImage || d.ogImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      });
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSEO();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.content.updateSEO(seo);
      setSuccessMsg('SEO & Meta tags updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (!keywordInput.trim() || !seo) return;
    if (!seo.keywords.includes(keywordInput.trim())) {
      setSeo({ ...seo, keywords: [...seo.keywords, keywordInput.trim()] });
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    if (!seo) return;
    setSeo({ ...seo, keywords: seo.keywords.filter((k) => k !== kw) });
  };

  if (loading || !seo) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
        <span className="text-xs font-medium">Loading SEO Console...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            SEO & Search Engine Meta Tags
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize Google search rankings, OpenGraph social media sharing previews, and keyword indexes
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D4A84F]" />
          <span>{saving ? 'Saving...' : 'Save SEO Settings'}</span>
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

      {/* Meta Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Meta */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#D4A84F]" />
            <span>Search Engine Results (SERP)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Global Meta Title</label>
            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
            <textarea
              value={seo.metaDescription}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
            />
          </div>

          {/* Google Preview Snippet */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Google SERP Snippet Preview</div>
            <div className="text-xs font-semibold text-blue-700 truncate">{seo.metaTitle}</div>
            <div className="text-[10px] text-emerald-700">https://galaxyrealestate.ng</div>
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {seo.metaDescription}
            </p>
          </div>
        </div>

        {/* Social / OpenGraph */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#D4A84F]" />
            <span>OpenGraph Social Sharing Previews</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">OpenGraph Social Share Image URL</label>
            <input
              type="text"
              value={seo.ogImage}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          {/* Keywords Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Keywords</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {seo.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold flex items-center gap-1 border border-slate-200"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Add SEO keyword..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Add
              </button>
            </div>
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
          <span>{saving ? 'Saving...' : 'Save Meta Configuration'}</span>
        </button>
      </div>

    </form>
  );
};
