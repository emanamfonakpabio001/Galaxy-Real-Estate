import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Sparkles, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown, 
  Building,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Property } from '../../types';

interface PropertiesManagerProps {
  properties: Property[];
  onAddNew: () => void;
  onEdit: (property: Property) => void;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (property: Property) => Promise<void>;
  onToggleFeatured: (property: Property) => Promise<void>;
  onPreview: (property: Property) => void;
  formatNaira: (amount: number) => string;
}

export const PropertiesManager: React.FC<PropertiesManagerProps> = ({
  properties,
  onAddNew,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  onPreview,
  formatNaira,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPublish, setSelectedPublish] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'title'>('newest');

  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.location.city.toLowerCase().includes(q) ||
          item.location.neighborhood.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!match) return false;
      }

      // City
      if (selectedCity !== 'all' && item.location.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && item.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      // Publish State
      if (selectedPublish === 'published' && item.published === false) return false;
      if (selectedPublish === 'draft' && item.published !== false) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [properties, searchTerm, selectedCity, selectedType, selectedStatus, selectedPublish, sortBy]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
            Property Catalog ({filteredProperties.length} of {properties.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full management of all real estate inventory, images, and live statuses in MongoDB
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-[#D4A84F]" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, neighborhood, city..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

          {/* City */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
          >
            <option value="all">All Cities</option>
            <option value="Abuja">Abuja</option>
            <option value="Lagos">Lagos</option>
            <option value="Port Harcourt">Port Harcourt</option>
            <option value="Uyo">Uyo</option>
            <option value="Ibadan">Ibadan</option>
            <option value="Calabar">Calabar</option>
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
          >
            <option value="all">All Property Types</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Apartment">Apartment</option>
            <option value="Terrace Duplex">Terrace Duplex</option>
            <option value="Detached Mansion">Detached Mansion</option>
            <option value="Commercial Office">Commercial Office</option>
            <option value="Land">Land</option>
          </select>

          {/* Publication Status */}
          <select
            value={selectedPublish}
            onChange={(e) => setSelectedPublish(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title">Title: A-Z</option>
          </select>

        </div>
      </div>

      {/* Property Cards / Rows Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No properties matched your filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('all');
                setSelectedType('all');
                setSelectedPublish('all');
              }}
              className="mt-3 text-xs font-bold text-[#D4A84F] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1F3A] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-3 text-center">Featured</th>
                  <th className="py-3.5 px-3 text-center">Published</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => {
                  const isPublished = prop.published !== false;
                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Property Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.mainImage || (prop.images && prop.images[0]) || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'}
                            alt={prop.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-[#0B1F3A] truncate">{prop.title}</div>
                            <div className="text-[11px] text-slate-400 truncate">{prop.shortDescription}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{prop.location.neighborhood}</div>
                        <div className="text-[10px] text-slate-400">{prop.location.city}, {prop.location.state}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#0B1F3A]">{formatNaira(prop.price)}</div>
                        <div className="text-[10px] text-slate-500">{prop.status}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {prop.type}
                        </span>
                      </td>

                      {/* Transaction Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          prop.status === 'For Sale' ? 'bg-indigo-50 text-indigo-700' :
                          prop.status === 'For Rent' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {prop.status}
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onToggleFeatured(prop)}
                          className={`p-1.5 rounded-lg transition ${
                            prop.featured
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'text-slate-300 hover:text-amber-500'
                          }`}
                          title={prop.featured ? 'Featured on homepage' : 'Mark as featured'}
                        >
                          <Sparkles className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onTogglePublish(prop)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {isPublished ? 'Live' : 'Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Preview */}
                          <button
                            onClick={() => onPreview(prop)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-100 transition"
                            title="Preview property"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(prop)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="Edit property details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => onDuplicate(prop.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Duplicate as draft copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(prop)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="Delete property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-[#0B1F3A] mb-2">
              Delete Property Listing?
            </h3>
            <p className="text-xs text-slate-600 text-center leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-[#0B1F3A]">"{deleteTarget.title}"</strong> from the database? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
