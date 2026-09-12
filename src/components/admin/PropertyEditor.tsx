import React, { useState } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Trash2, 
  Star, 
  Edit3, 
  Plus, 
  X, 
  Check, 
  Image as ImageIcon,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Loader2,
  SlidersHorizontal,
  MoveLeft,
  MoveRight
} from 'lucide-react';
import { Property, PropertyType, ListingStatus, TransactionType } from '../../types';
import { ImageEditorModal } from './ImageEditorModal';
import { api } from '../../services/api';

interface PropertyEditorProps {
  initialProperty?: Property | null;
  onSave: (property: Partial<Property>) => Promise<void>;
  onCancel: () => void;
  onPreview: (property: Property) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  initialProperty,
  onSave,
  onCancel,
  onPreview,
}) => {
  const isEditing = Boolean(initialProperty);

  // Form State
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [slug, setSlug] = useState(initialProperty?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialProperty?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialProperty?.fullDescription || '');
  const [price, setPrice] = useState<number | string>(initialProperty?.price || '');
  const [currency, setCurrency] = useState(initialProperty?.currency || '₦');
  const [period, setPeriod] = useState<'year' | 'month' | undefined>(initialProperty?.period);
  
  // Location
  const [address, setAddress] = useState(initialProperty?.location.address || '');
  const [city, setCity] = useState(initialProperty?.location.city || 'Abuja');
  const [state, setState] = useState(initialProperty?.location.state || 'FCT');
  const [neighborhood, setNeighborhood] = useState(initialProperty?.location.neighborhood || '');
  const [country, setCountry] = useState(initialProperty?.location.country || 'Nigeria');

  // Specs
  const [propertyType, setPropertyType] = useState<PropertyType>(initialProperty?.type || 'Villa');
  const [transactionType, setTransactionType] = useState<TransactionType>(initialProperty?.transactionType || (initialProperty?.status === 'For Rent' ? 'For Rent' : 'For Sale'));
  const [status, setStatus] = useState<ListingStatus>(initialProperty?.status || 'For Sale');
  const [bedrooms, setBedrooms] = useState<number | string>(initialProperty?.bedrooms ?? 4);
  const [bathrooms, setBathrooms] = useState<number | string>(initialProperty?.bathrooms ?? 4);
  const [parkingSpaces, setParkingSpaces] = useState<number | string>(initialProperty?.parkingSpaces ?? 3);
  const [sizeSqm, setSizeSqm] = useState<number | string>(initialProperty?.sizeSqm ?? 500);
  const [yearBuilt, setYearBuilt] = useState<number | string>(initialProperty?.yearBuilt ?? new Date().getFullYear());

  // Flags
  const [featured, setFeatured] = useState<boolean>(initialProperty?.featured || false);
  const [published, setPublished] = useState<boolean>(initialProperty?.published !== false);
  const [verified, setVerified] = useState<boolean>(initialProperty?.verified !== false);

  // Features list
  const defaultFeatures = [
    'Swimming Pool',
    '24/7 Security & CCTV',
    'Smart Home Automation',
    'Fitted Italian Kitchen',
    'Solar Inverter Backup',
    'Private Cinema Room',
    'Ample Parking',
    'Elevator / Lift',
    'Fully Equipped Gym',
  ];
  const [features, setFeatures] = useState<string[]>(
    initialProperty?.features || defaultFeatures.slice(0, 5)
  );
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Images list
  const [images, setImages] = useState<string[]>(
    initialProperty?.images || [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ]
  );
  const [mainImage, setMainImage] = useState<string>(
    initialProperty?.mainImage || initialProperty?.images?.[0] || images[0]
  );

  // In-browser Image Editor state
  const [editingImageIdx, setEditingImageIdx] = useState<number | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

  // Uploading & Progress state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    currentFile: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Carousel Preview State
  const [showCarouselPreview, setShowCarouselPreview] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(0);

  // Move image left/right in carousel order
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const nextImages = [...images];
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;
    setImages(nextImages);
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    const combined = [...images, url];
    setImages(combined);
    if (!mainImage) setMainImage(url);
    setCustomImageUrl('');
    setShowUrlInput(false);
  };

  // Add custom feature
  const handleAddFeature = () => {
    if (customFeatureInput.trim() && !features.includes(customFeatureInput.trim())) {
      setFeatures([...features, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  const handleRemoveFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat));
  };

  // Upload images to MongoDB GridFS with client-side optimization and progress
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setErrorMsg('');
      const fileList = Array.from(files) as File[];

      const res = await api.media.upload(
        fileList, 
        'Property', 
        initialProperty?.id,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (res.success && res.data && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url);
        const combined = [...images, ...newUrls];
        setImages(combined);
        if (!mainImage) setMainImage(combined[0]);
      }
      
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to media upload service.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  // Set Main Image
  const handleSetMain = (url: string) => {
    setMainImage(url);
  };

  // Delete Image
  const handleDeleteImage = (index: number) => {
    const targetUrl = images[index];
    const filtered = images.filter((_, i) => i !== index);
    setImages(filtered);
    if (mainImage === targetUrl) {
      setMainImage(filtered[0] || '');
    }
  };

  // Open Image Editor
  const handleOpenEditor = (index: number) => {
    setEditingImageIdx(index);
    setIsImageEditorOpen(true);
  };

  // Save edited image to GridFS
  const handleSaveEditedImage = async (editedBase64: string, filename: string) => {
    try {
      const res = await api.media.saveEdited({
        base64Data: editedBase64,
        filename,
        category: 'Property',
        propertyId: initialProperty?.id,
      });

      if (res.success && res.data && editingImageIdx !== null) {
        const updatedImages = [...images];
        const newUrl = res.data.url;
        const oldUrl = updatedImages[editingImageIdx];
        updatedImages[editingImageIdx] = newUrl;
        setImages(updatedImages);
        if (mainImage === oldUrl) {
          setMainImage(newUrl);
        }
      }
    } catch (err) {
      console.error('Failed to save edited image to GridFS:', err);
    }
  };

  // Submit property
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Property Title is required.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload: Partial<Property> = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        price: Number(price),
        currency,
        period: transactionType === 'For Rent' ? (period || 'year') : undefined,
        location: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          neighborhood: neighborhood.trim() || city.trim(),
          country: country.trim(),
        },
        type: propertyType,
        status,
        transactionType,
        bedrooms: Number(bedrooms || 0),
        bathrooms: Number(bathrooms || 0),
        parkingSpaces: Number(parkingSpaces || 0),
        sizeSqm: Number(sizeSqm || 0),
        yearBuilt: Number(yearBuilt || new Date().getFullYear()),
        featured,
        published,
        verified,
        features,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
        mainImage: mainImage || images[0] || '',
      };

      await onSave(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0B1F3A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </button>

        <div className="flex items-center gap-3">
          {initialProperty && (
            <button
              type="button"
              onClick={() => onPreview(initialProperty)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4A84F]" />
              <span>Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#D4A84F]" />
            <span>{saving ? 'Saving to Database...' : isEditing ? 'Update Property' : 'Publish Property'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Core Data & Descriptions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              1. Title & Narrative Description
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Sovereign: 6-Bedroom Ultra-Mansion"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#D4A84F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. luxury-mansion-banana-island"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
                >
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Terrace Duplex">Terrace Duplex</option>
                  <option value="Detached Mansion">Detached Mansion</option>
                  <option value="House">House</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Land">Land</option>
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Office">Office</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Shop">Shop</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Summary Highlight
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                placeholder="A high-level summary that appears on cards and search results..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Architectural Description
              </label>
              <textarea
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                rows={6}
                placeholder="Comprehensive narrative detailing floor plans, finishes, security protocols, views, and lifestyle amenities..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F] leading-relaxed"
              />
            </div>

          </div>

          {/* Card 2: Location */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              2. Location & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City <span className="text-red-500">*</span></label>
                <select
                  value={city}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCity(c);
                    if (c === 'Abuja') setState('FCT');
                    else if (c === 'Lagos') setState('Lagos');
                    else if (c === 'Port Harcourt') setState('Rivers');
                    else if (c === 'Uyo') setState('Akwa Ibom');
                    else if (c === 'Ibadan') setState('Oyo');
                    else if (c === 'Calabar') setState('Cross River');
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#D4A84F]"
                >
                  <option value="Abuja">Abuja</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Uyo">Uyo</option>
                  <option value="Ibadan">Ibadan</option>
                  <option value="Calabar">Calabar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Neighborhood / District <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Maitama, Banana Island, Guzape"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Danube Close, Off IBB Boulevard"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Specifications & Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              3. Specifications & Dimensions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parking</label>
                <input
                  type="number"
                  min="0"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Size (sqm)</label>
                <input
                  type="number"
                  min="0"
                  value={sizeSqm}
                  onChange={(e) => setSizeSqm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Features & Amenities */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              4. Features & Amenities
            </h3>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2">
              {features.map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feat)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add custom feature tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Add custom feature (e.g. Helipad, Wine Cellar, Private Jetty)..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-[#D4A84F] hover:bg-[#c3973d] text-[#0B1F3A] rounded-xl font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Card 5: Property Images & GridFS Storage */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide flex items-center gap-2">
                  <span>5. High-Resolution Photos & Carousel</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select multiple photos at once. Images are auto-optimized and streamed reliably to MongoDB GridFS.
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCarouselPreview(!showCarouselPreview)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      showCarouselPreview
                        ? 'bg-[#D4A84F] text-[#0B1F3A]'
                        : 'bg-slate-100 hover:bg-slate-200 text-[#0B1F3A]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showCarouselPreview ? 'Hide Carousel Preview' : 'Carousel Preview'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{showUrlInput ? 'Hide URL' : 'Add via URL'}</span>
                </button>

                <label className="cursor-pointer px-4 py-2 bg-[#0B1F3A] hover:bg-[#163050] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs">
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-[#D4A84F] animate-spin" />
                      <span>Uploading ({uploadProgress ? `${uploadProgress.current}/${uploadProgress.total}` : '...'})</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#D4A84F]" />
                      <span>Upload Photos</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Live Upload Progress Feedback */}
            {uploading && uploadProgress && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0B1F3A]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#D4A84F] animate-spin" />
                    <span>
                      Uploading photo <span className="font-bold text-[#0B1F3A]">{uploadProgress.current}</span> of <span className="font-bold text-[#0B1F3A]">{uploadProgress.total}</span>
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
                  Resilient multi-photo batching: Each photo is optimized client-side to prevent network payload limits.
                </p>
              </div>
            )}

            {/* URL Input Bar (if open) */}
            {showUrlInput && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or direct image link"
                  className="flex-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!customImageUrl.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-[#D4A84F] hover:bg-[#c2963e] text-[#0B1F3A] rounded-lg text-xs font-bold whitespace-nowrap transition disabled:opacity-50"
                >
                  Attach Image
                </button>
              </div>
            )}

            {/* In-Card Error feedback */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="text-red-500 hover:text-red-800 text-xs font-bold px-2 py-0.5"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Interactive Carousel Live Preview */}
            {showCarouselPreview && images.length > 0 && (
              <div className="bg-[#0B1F3A] p-4 rounded-2xl text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4A84F] text-[#0B1F3A] text-[10px] font-extrabold uppercase tracking-wider">
                      Live Carousel Preview
                    </span>
                    <span className="text-xs text-slate-300">
                      Slide {Math.min(previewSlide + 1, images.length)} of {images.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCarouselPreview(false)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                  <img
                    src={images[previewSlide] || images[0]}
                    alt={`Preview slide ${previewSlide + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition"
                        title="Previous Photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition"
                        title="Next Photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPreviewSlide(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              previewSlide === i ? 'w-5 bg-[#D4A84F]' : 'w-1.5 bg-white/50 hover:bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails row */}
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewSlide(idx)}
                      className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                        previewSlide === idx ? 'border-[#D4A84F] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 px-1 bg-black/70 text-[9px] text-white">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Mobile & Desktop Slide Actions in Preview */}
                {images.length > 0 && images[previewSlide] && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
                    <div className="flex items-center gap-2">
                      {images[previewSlide] === mainImage ? (
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#D4A84F] text-[#0B1F3A] text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-[#0B1F3A]" />
                          Main Cover Photo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMain(images[previewSlide])}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D4A84F]/20 hover:bg-[#D4A84F]/30 text-[#D4A84F] border border-[#D4A84F]/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          title="Set as Main Cover Photo"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Set as Cover
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditor(previewSlide)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        title="Crop or edit photo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Crop / Edit Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const slideToDelete = previewSlide;
                          handleDeleteImage(slideToDelete);
                          setPreviewSlide((prev) => Math.max(0, prev - 1));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Images Grid with Carousel Reordering */}
            {images.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">No photos added yet.</p>
                <p className="text-[11px] text-slate-400">Click &quot;Upload Photos&quot; above to select one or multiple photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((imgUrl, idx) => {
                  const isMain = mainImage === imgUrl;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden border-2 group shadow-xs transition bg-slate-50 flex flex-col justify-between ${
                        isMain ? 'border-[#D4A84F] ring-2 ring-[#D4A84F]/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Image Frame */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                        <img
                          src={imgUrl}
                          alt={`Property ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Carousel Order Badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
                            #{idx + 1}
                          </span>
                          {isMain && (
                            <span className="px-2 py-0.5 rounded-md bg-[#D4A84F] text-[#0B1F3A] text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-[#0B1F3A]" />
                              Cover
                            </span>
                          )}
                        </div>

                        {/* Mobile Quick Action Buttons (Always accessible on touch devices without needing hover) */}
                        <div className="md:hidden absolute top-2 right-2 flex items-center gap-1 z-10">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMain(imgUrl)}
                              className="p-1.5 bg-[#D4A84F] text-[#0B1F3A] rounded-lg text-xs font-bold shadow-md active:scale-90 transition"
                              title="Set as Main Cover Photo"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditor(idx)}
                            className="p-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md active:scale-90 transition"
                            title="Crop / Edit Image"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="p-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-md active:scale-90 transition"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Desktop Hover Overlay Controls */}
                        <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 p-2 z-10">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMain(imgUrl)}
                              className="p-2 bg-[#D4A84F] text-[#0B1F3A] rounded-xl text-xs font-bold hover:scale-110 active:scale-95 transition shadow-lg flex items-center gap-1"
                              title="Set as Main Cover Photo"
                            >
                              <Star className="w-4 h-4" />
                              <span className="text-[11px]">Set Cover</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditor(idx)}
                            className="p-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:scale-110 active:scale-95 transition shadow-lg flex items-center gap-1"
                            title="Crop / Edit Image"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[11px]">Crop / Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="p-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:scale-110 active:scale-95 transition shadow-lg flex items-center gap-1"
                            title="Delete Image"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[11px]">Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom Mobile & Desktop Action Toolbar (Always visible on all screen sizes) */}
                      <div className="p-2.5 bg-white border-t border-slate-100 flex flex-col gap-2">
                        {/* Slide Label & Carousel Reordering */}
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 font-bold truncate">
                            {isMain ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0B1F3A] bg-[#D4A84F]/15 border border-[#D4A84F]/40 px-2 py-0.5 rounded-md">
                                <Star className="w-3 h-3 fill-[#D4A84F] text-[#D4A84F]" />
                                Main Cover Photo
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold text-xs">
                                Slide #{idx + 1}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400 font-medium mr-1 hidden xs:inline">Order:</span>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed transition"
                              title="Move Earlier in Carousel"
                            >
                              <MoveLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              disabled={idx === images.length - 1}
                              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed transition"
                              title="Move Later in Carousel"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Dedicated Mobile & Desktop Action Buttons: Change Cover, Crop/Edit, Delete */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100">
                          {/* 1. Change Cover */}
                          <button
                            type="button"
                            onClick={() => handleSetMain(imgUrl)}
                            disabled={isMain}
                            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 min-h-[38px] ${
                              isMain
                                ? 'bg-amber-100/70 text-amber-900 border border-amber-300/80 cursor-default'
                                : 'bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-200/90'
                            }`}
                            title={isMain ? 'Current Cover Photo' : 'Set as Main Cover Photo'}
                          >
                            <Star className={`w-3.5 h-3.5 shrink-0 ${isMain ? 'fill-amber-500 text-amber-500' : 'text-amber-600'}`} />
                            <span className="truncate">{isMain ? 'Cover' : 'Set Cover'}</span>
                          </button>

                          {/* 2. Crop / Edit Photo */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditor(idx)}
                            className="py-2 px-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 min-h-[38px]"
                            title="Crop or edit photo in studio"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">Crop/Edit</span>
                          </button>

                          {/* 3. Delete Option */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="py-2 px-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 min-h-[38px]"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="truncate">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Pricing, Publishing & Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Price & Commercials */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              Pricing & Transaction
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('For Sale');
                    setStatus('For Sale');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    transactionType === 'For Sale'
                      ? 'bg-[#0B1F3A] text-[#D4A84F]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('For Rent');
                    setStatus('For Rent');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    transactionType === 'For Rent'
                      ? 'bg-[#0B1F3A] text-[#D4A84F]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price (in Naira ₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 150000000"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1F3A] font-extrabold focus:outline-none focus:border-[#D4A84F]"
              />
            </div>

            {transactionType === 'For Rent' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rental Period</label>
                <select
                  value={period || 'year'}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                >
                  <option value="year">Per Annum (Year)</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
            )}
          </div>

          {/* Publishing & Visibility Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wide border-b border-slate-100 pb-3">
              Visibility & Publishing
            </h3>

            {/* Published / Live Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-[#0B1F3A]">Publish to Website</div>
                <div className="text-[10px] text-slate-500">Live on public search</div>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[#D4A84F] cursor-pointer"
              />
            </div>

            {/* Featured Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-[#0B1F3A]">Featured Listing</div>
                <div className="text-[10px] text-slate-500">Display on homepage portfolio</div>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#D4A84F] cursor-pointer"
              />
            </div>

            {/* Verified Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-[#0B1F3A]">Verified Legal Title</div>
                <div className="text-[10px] text-slate-500">Displays verified badge</div>
              </div>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 accent-[#D4A84F] cursor-pointer"
              />
            </div>

            {/* Listing Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Quick Submit Block */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4A84F] to-[#c7983c] hover:from-[#dfb356] hover:to-[#d4a84f] text-[#0B1F3A] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#D4A84F]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Processing Save...' : isEditing ? 'Save All Changes' : 'Create & Publish'}</span>
          </button>

        </div>

      </form>

      {/* Built-in Image Editor Modal */}
      {isImageEditorOpen && editingImageIdx !== null && images[editingImageIdx] && (
        <ImageEditorModal
          isOpen={isImageEditorOpen}
          imageUrl={images[editingImageIdx]}
          filename={`property_img_${Date.now()}.jpg`}
          onClose={() => setIsImageEditorOpen(false)}
          onSave={handleSaveEditedImage}
        />
      )}

    </div>
  );
};
