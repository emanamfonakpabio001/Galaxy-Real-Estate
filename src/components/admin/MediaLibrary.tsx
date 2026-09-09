import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Edit3, 
  Eye, 
  Image as ImageIcon, 
  Database, 
  Sparkles,
  ExternalLink,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { MediaFileMetadata } from '../../types';
import { api } from '../../services/api';
import { ImageEditorModal } from './ImageEditorModal';

export const MediaLibrary: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaFileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    currentFile: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal State
  const [editingMedia, setEditingMedia] = useState<MediaFileMetadata | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Metadata Edit Modal State
  const [metaEditTarget, setMetaEditTarget] = useState<MediaFileMetadata | null>(null);
  const [metaAlt, setMetaAlt] = useState('');
  const [metaCaption, setMetaCaption] = useState('');
  const [metaCategory, setMetaCategory] = useState('Property');

  const categories = ['All', 'Property', 'Hero', 'About', 'Team', 'Logo', 'Other'];

  const loadMedia = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === 'All' ? undefined : selectedCategory;
      const res = await api.media.getLibrary(cat, searchTerm || undefined);
      setMediaList(res.data || []);
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedCategory, searchTerm]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileList = Array.from(files) as File[];
      const cat = selectedCategory === 'All' ? 'Property' : selectedCategory;
      const res = await api.media.upload(fileList, cat, undefined, (progress) => {
        setUploadProgress(progress);
      });
      if (!res.success) {
        alert(res.error || 'Failed to upload images.');
      }
      await loadMedia();
    } catch (err: any) {
      console.error('Failed to upload images:', err);
      alert(err.message || 'Error uploading images.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this image from MongoDB GridFS?')) return;
    try {
      await api.media.delete(fileId);
      setMediaList(mediaList.filter((m) => m.fileId !== fileId));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditorFor = (media: MediaFileMetadata) => {
    setEditingMedia(media);
    setIsEditorOpen(true);
  };

  const handleSaveEdited = async (base64: string, filename: string) => {
    if (!editingMedia) return;
    await api.media.saveEdited({
      base64Data: base64,
      filename: `edited_${editingMedia.filename}`,
      category: editingMedia.category,
      originalFileId: editingMedia.fileId,
      altText: editingMedia.altText,
    });
    await loadMedia();
  };

  const openMetaEdit = (media: MediaFileMetadata) => {
    setMetaEditTarget(media);
    setMetaAlt(media.altText || '');
    setMetaCaption(media.caption || '');
    setMetaCategory(media.category || 'Property');
  };

  const handleSaveMeta = async () => {
    if (!metaEditTarget) return;
    await api.media.updateMetadata(metaEditTarget.fileId, {
      altText: metaAlt,
      caption: metaCaption,
      category: metaCategory,
    });
    setMetaEditTarget(null);
    await loadMedia();
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Upload Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
              Media & GridFS Asset Library
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B1F3A] text-[#D4A84F] text-[10px] font-extrabold uppercase">
              MongoDB GridFS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store, edit, transform, and serve binary image assets directly from MongoDB
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#163050] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 text-[#D4A84F] animate-spin" />
              <span>Uploading ({uploadProgress ? `${uploadProgress.current}/${uploadProgress.total}` : '...'})</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#D4A84F]" />
              <span>Upload Image Assets</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Live Upload Progress Feedback */}
      {uploading && uploadProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#0B1F3A]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#D4A84F] animate-spin" />
              <span>
                Uploading asset <span className="font-bold text-[#0B1F3A]">{uploadProgress.current}</span> of <span className="font-bold text-[#0B1F3A]">{uploadProgress.total}</span>
              </span>
              <span className="text-slate-500 font-normal truncate max-w-[200px]">({uploadProgress.currentFile})</span>
            </div>
            <span className="font-bold text-[#D4A84F]">{uploadProgress.percent}%</span>
          </div>
          <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0B1F3A] to-[#D4A84F] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Client-side image optimization ensures swift and dependable delivery directly into MongoDB GridFS.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename or alt..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D4A84F]"
            />
          </div>

        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4A84F]" />
            <span className="text-xs font-medium">Fetching GridFS library...</span>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No media assets in this category.</p>
            <p className="text-[11px] text-slate-400">Click the "Upload Image Assets" button to store images in MongoDB GridFS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((media) => (
              <div
                key={media.fileId}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group hover:border-[#D4A84F] hover:shadow-md transition flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-36 bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={media.url}
                    alt={media.altText || media.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Category Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-wider">
                    {media.category}
                  </span>

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    {/* Image Editor */}
                    <button
                      type="button"
                      onClick={() => openEditorFor(media)}
                      className="p-2 bg-[#D4A84F] text-[#0B1F3A] rounded-lg text-xs font-bold hover:scale-110 transition"
                      title="Open Image Studio Editor"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(media.url, media.fileId)}
                      className="p-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:scale-110 transition"
                      title="Copy URL"
                    >
                      {copiedId === media.fileId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Metadata Edit */}
                    <button
                      type="button"
                      onClick={() => openMetaEdit(media)}
                      className="p-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:scale-110 transition"
                      title="Edit Metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(media.fileId)}
                      className="p-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:scale-110 transition"
                      title="Delete from GridFS"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-2.5 flex-1 flex flex-col justify-between text-[10px]">
                  <div>
                    <div className="font-bold text-[#0B1F3A] truncate" title={media.filename}>
                      {media.filename}
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      {(media.sizeBytes / 1024).toFixed(0)} KB • {media.contentType.split('/')[1]?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Browser Image Studio Editor Modal */}
      {isEditorOpen && editingMedia && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          imageUrl={editingMedia.url}
          filename={editingMedia.filename}
          originalFileId={editingMedia.fileId}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingMedia(null);
          }}
          onSave={handleSaveEdited}
        />
      )}

      {/* Metadata Edit Modal */}
      {metaEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-2">
              Edit Media Metadata
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={metaCategory}
                onChange={(e) => setMetaCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alt Text (Accessibility & SEO)</label>
              <input
                type="text"
                value={metaAlt}
                onChange={(e) => setMetaAlt(e.target.value)}
                placeholder="Descriptive alt text for search engines..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Caption</label>
              <input
                type="text"
                value={metaCaption}
                onChange={(e) => setMetaCaption(e.target.value)}
                placeholder="Optional caption..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMetaEditTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMeta}
                className="px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#152f4f]"
              >
                Save Metadata
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
