import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Star, 
  X, 
  RefreshCw, 
  Quote, 
  User 
} from 'lucide-react';
import { Testimonial } from '../../types';
import { api } from '../../services/api';

export const TestimonialsManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.content.getTestimonials();
      setTestimonials(res.data || []);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleOpenAdd = () => {
    setEditingTarget({
      name: '',
      role: 'Property Investor',
      location: 'Abuja, Nigeria',
      rating: 5,
      comment: '',
      propertyPurchased: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      published: true,
      displayOrder: testimonials.length + 1,
    });
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTarget({ ...t });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.content.deleteTestimonial(id);
      await loadTestimonials();
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !editingTarget.name || !editingTarget.comment) return;

    try {
      setSaving(true);
      if (editingTarget.id) {
        await api.content.updateTestimonial(editingTarget.id, editingTarget);
      } else {
        await api.content.createTestimonial(editingTarget);
      }
      setEditingTarget(null);
      await loadTestimonials();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Client Testimonials & Reviews ({testimonials.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage high-net-worth client endorsements and property purchase feedback
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#D4A84F]" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
          <span className="text-xs font-medium">Loading testimonials...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:border-[#D4A84F]/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-[#D4A84F]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Review"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{item.comment}"
                </p>

                {item.propertyPurchased && (
                  <div className="text-[11px] text-[#D4A84F] font-semibold">
                    Acquired: {item.propertyPurchased}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-bold text-[#0B1F3A]">{item.name}</div>
                  <div className="text-[10px] text-slate-500">{item.role} • {item.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide">
                {editingTarget.id ? 'Edit Testimonial' : 'Add Testimonial'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingTarget.name || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, name: e.target.value })}
                  placeholder="e.g. Chief Alhaji Ibrahim Bello"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={editingTarget.role || ''}
                    onChange={(e) => setEditingTarget({ ...editingTarget, role: e.target.value })}
                    placeholder="e.g. Real Estate Investor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={editingTarget.location || ''}
                    onChange={(e) => setEditingTarget({ ...editingTarget, location: e.target.value })}
                    placeholder="e.g. Abuja & London"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Purchased / Reference</label>
                <input
                  type="text"
                  value={editingTarget.propertyPurchased || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, propertyPurchased: e.target.value })}
                  placeholder="e.g. 5-Bedroom Villa in Maitama"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Comment <span className="text-red-500">*</span></label>
                <textarea
                  value={editingTarget.comment || ''}
                  onChange={(e) => setEditingTarget({ ...editingTarget, comment: e.target.value })}
                  rows={4}
                  required
                  placeholder="The client's honest feedback regarding the transaction experience..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={editingTarget.rating || 5}
                    onChange={(e) => setEditingTarget({ ...editingTarget, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Great)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={editingTarget.avatar || ''}
                    onChange={(e) => setEditingTarget({ ...editingTarget, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
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
                  <span>{saving ? 'Saving...' : 'Save Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
