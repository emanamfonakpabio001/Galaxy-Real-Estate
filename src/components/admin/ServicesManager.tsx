import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  X, 
  Briefcase, 
  RefreshCw,
  Home,
  Layers,
  Key,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { ServiceItem } from '../../types';
import { api } from '../../services/api';

export const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [customBenefit, setCustomBenefit] = useState('');

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await api.content.getServices();
      setServices(res.data || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingTarget({
      title: '',
      subtitle: '',
      description: '',
      iconName: 'Home',
      benefits: ['Transparent Legal Verification', 'Direct Advisory Services', 'Confidential Handling'],
      published: true,
      displayOrder: services.length + 1,
    });
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingTarget({ ...srv });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.content.deleteService(id);
      await loadServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !editingTarget.title) return;

    try {
      setSaving(true);
      if (editingTarget.id) {
        await api.content.updateService(editingTarget.id, editingTarget);
      } else {
        await api.content.createService(editingTarget);
      }
      setEditingTarget(null);
      await loadServices();
    } catch (err) {
      console.error('Failed to save service:', err);
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    if (!customBenefit.trim() || !editingTarget) return;
    const current = editingTarget.benefits || [];
    setEditingTarget({
      ...editingTarget,
      benefits: [...current, customBenefit.trim()],
    });
    setCustomBenefit('');
  };

  const removeBenefit = (idx: number) => {
    if (!editingTarget) return;
    const current = editingTarget.benefits || [];
    setEditingTarget({
      ...editingTarget,
      benefits: current.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Real Estate Services Catalog ({services.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, customize, and publish your agency service offerings
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#D4A84F]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
          <span className="text-xs font-medium">Loading services...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:border-[#D4A84F]/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B1F3A]">
                    <Home className="w-5 h-5 text-[#D4A84F]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Service"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0B1F3A]">{srv.title}</h3>
                  <div className="text-xs text-[#D4A84F] font-semibold">{srv.subtitle}</div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>

                {/* Benefits Pill List */}
                {srv.benefits && srv.benefits.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-slate-100">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">Key Deliverables</div>
                    <ul className="space-y-1">
                      {srv.benefits.map((b, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">
                {editingTarget.id ? 'Edit Real Estate Service' : 'Add New Real Estate Service'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingTarget.title || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, title: e.target.value })}
                  placeholder="e.g. Luxury Residential Sales & Acquisition"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Value Proposition</label>
                <input
                  type="text"
                  value={editingTarget.subtitle || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, subtitle: e.target.value })}
                  placeholder="e.g. Exclusive Buyer Advisory & Off-Market Portfolio Access"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingTarget.description || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              {/* Benefits list */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Benefits & Offerings</label>
                <div className="space-y-1.5 mb-2">
                  {(editingTarget.benefits || []).map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBenefit}
                    onChange={(e) => setCustomBenefit(e.target.value)}
                    placeholder="Add deliverable point..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0B1F3A] hover:bg-[#142e4d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#D4A84F]" />
                  <span>{saving ? 'Saving...' : 'Save Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
