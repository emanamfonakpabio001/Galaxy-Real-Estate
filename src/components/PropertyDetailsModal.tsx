import React, { useState } from 'react';
import { 
  X, MapPin, BedDouble, Bath, Car, Maximize2, ShieldCheck, 
  Calendar, Phone, Mail, MessageSquare, Check, Sparkles, 
  Share2, Heart, ExternalLink, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2,
  Loader2
} from 'lucide-react';
import { Property } from '../types';
import { formatNaira, createWhatsAppUrl, buildWhatsAppInquiryMessage } from '../utils/formatters';
import { company } from '../config/company';
import { submitToFormspree } from '../services/formspree';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenScheduleModal: (property: Property) => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenScheduleModal,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hello, I am interested in inspecting ${property.title} (${formatNaira(property.price)}) located in ${property.location.neighborhood}, ${property.location.city}. Please provide further details.`,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Please fill in your name, email, and phone number.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    const result = await submitToFormspree({
      form_type: `Property Inquiry: ${property.title}`,
      property_id: property.id,
      property_title: property.title,
      property_price: formatNaira(property.price),
      property_location: `${property.location.neighborhood}, ${property.location.city}`,
      property_status: property.status,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFormSubmitted(true);
    } else {
      setFormError(result.message || 'Submission could not be completed. Please try again or message via WhatsApp.');
    }
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Please enter your name and phone number to send via WhatsApp.');
      return;
    }
    setFormError('');

    const formattedMsg = buildWhatsAppInquiryMessage({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyLocation: `${property.location.address}, ${property.location.city}`,
      inquiryType: `Property Inquiry (${property.status})`,
    });

    const url = createWhatsAppUrl(formattedMsg, property.agent.whatsapp || company.whatsapp);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const isRental = property.status === 'For Rent';

  return (
    <div 
      id="property-details-view"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Sticky Top Action Bar inside Modal */}
        <div className="px-6 py-4 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#D4A84F]/30 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition flex items-center space-x-1 text-xs font-semibold"
              aria-label="Back to properties"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="h-4 w-[1px] bg-white/20 hidden sm:inline" />
            <span className="text-xs text-[#D4A84F] font-bold uppercase tracking-wider truncate max-w-xs sm:max-w-md">
              {property.type} • {property.location.city}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center space-x-1"
              title="Share listing"
              aria-label="Share property link"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[10px] text-[#D4A84F] font-bold">Copied!</span>}
            </button>

            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`p-2 rounded-full transition ${
                isFavorite ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Favorite"
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
          
          {/* Main Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 shadow-inner group">
              <img
                src={property.images[activeImageIndex]}
                alt={`${property.title} view ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-[#0B1F3A] text-[#D4A84F] border border-[#D4A84F]/40 shadow-lg">
                  {property.status}
                </span>
                {property.verified && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-emerald-800 shadow-lg flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Title
                  </span>
                )}
              </div>

              {/* Prev / Next controls */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter indicator */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg">
                {activeImageIndex + 1} / {property.images.length} Photos
              </div>
            </div>

            {/* Thumbnail Strip */}
            {property.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImageIndex === idx
                        ? 'border-[#D4A84F] ring-2 ring-[#D4A84F]/40 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Property Header Info: Title, Price, Location */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1F3A]">
                {property.title}
              </h2>
              <p className="flex items-center text-sm sm:text-base text-[#667085]">
                <MapPin className="w-4 h-4 text-[#D4A84F] mr-1.5 shrink-0" />
                <span>{property.location.address}, {property.location.neighborhood}, {property.location.city}, {property.location.state}</span>
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 bg-[#F5F7FA] md:bg-transparent p-4 md:p-0 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Listing Price</span>
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                {formatNaira(property.price, isRental, property.period)}
              </span>
              {property.yearBuilt && (
                <span className="text-xs text-slate-400 block mt-0.5">Built in {property.yearBuilt}</span>
              )}
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F5F7FA] p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white text-[#D4A84F] shadow-sm">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Bedrooms</span>
                <span className="font-display text-lg font-bold text-[#0B1F3A]">
                  {property.bedrooms > 0 ? `${property.bedrooms} Ensuite` : 'Commercial'}
                </span>
              </div>
            </div>

            <div className="bg-[#F5F7FA] p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white text-[#D4A84F] shadow-sm">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Bathrooms</span>
                <span className="font-display text-lg font-bold text-[#0B1F3A]">
                  {property.bathrooms} Luxury Baths
                </span>
              </div>
            </div>

            <div className="bg-[#F5F7FA] p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white text-[#D4A84F] shadow-sm">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Parking</span>
                <span className="font-display text-lg font-bold text-[#0B1F3A]">
                  {property.parkingSpaces} Vehicles
                </span>
              </div>
            </div>

            <div className="bg-[#F5F7FA] p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white text-[#D4A84F] shadow-sm">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Floor Area</span>
                <span className="font-display text-lg font-bold text-[#0B1F3A]">
                  {property.sizeSqm} Sqm
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Content: Left Details & Right Agent + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Description & Features */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-3">
                  Property Overview & Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {property.fullDescription}
                </p>
              </div>

              {/* Features and Amenities Checklist */}
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1F3A] mb-3">
                  Key Features & Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#F5F7FA] border border-slate-100 text-xs font-semibold text-slate-800"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#D4A84F]/20 flex items-center justify-center text-[#D4A84F] shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Viewing Quick Banner */}
              <div className="bg-gradient-to-br from-[#0B1F3A] to-[#142f57] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#D4A84F]/30">
                <div>
                  <h4 className="font-display text-lg font-bold">Want to inspect this property in person?</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Book a private guided physical inspection or a live virtual 4K walkthrough.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenScheduleModal(property)}
                  className="px-5 py-3 rounded-xl bg-[#D4A84F] hover:bg-[#c99b40] text-[#0B1F3A] font-bold text-xs whitespace-nowrap shadow-md transition"
                >
                  Schedule Private Viewing
                </button>
              </div>
            </div>

            {/* Right Column: Assigned Agent Card & Property Specific Inquiry Form */}
            <div className="space-y-6">
              
              {/* Agent Card */}
              <div className="bg-[#F5F7FA] p-5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-[#D4A84F] uppercase tracking-wider block mb-3">
                  Assigned Listing Agent
                </span>
                
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#D4A84F]"
                  />
                  <div>
                    <h4 className="font-display text-base font-bold text-[#0B1F3A] flex items-center gap-1">
                      {property.agent.name}
                      {property.agent.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </h4>
                    <p className="text-xs text-[#667085]">{property.agent.title}</p>
                    <p className="text-[11px] text-[#0B1F3A] font-semibold mt-0.5">Galaxy Real Estate</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B1F3A] flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D4A84F]" />
                    <span>Call Agent</span>
                  </a>

                  <a
                    href={createWhatsAppUrl(
                      `Hello ${property.agent.name}, I am interested in ${property.title} in ${property.location.city}.`,
                      property.agent.whatsapp
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Property Contact Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-display text-base font-bold text-[#0B1F3A] mb-1">
                  Enquire About This Property
                </h4>
                <p className="text-xs text-[#667085] mb-4">
                  Send your enquiry directly to Galaxy advisors or via instant WhatsApp.
                </p>

                {formSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-900">Enquiry Received!</p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Thank you, {formData.name}. A Galaxy representative will contact you shortly regarding {property.title}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="mt-3 text-xs text-[#0B1F3A] font-bold underline"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleStandardSubmit} className="space-y-3">
                    {formError && (
                      <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg font-medium">
                        {formError}
                      </p>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Aliko Johnson"
                        className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. aliko@example.com"
                        className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 08012345678"
                        className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Message</label>
                      <textarea
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-1 space-y-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#142d52] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A84F]" />
                            <span>Sending to Galaxy...</span>
                          </>
                        ) : (
                          <span>Send Message</span>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleWhatsAppSubmit}
                        className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>Send via WhatsApp</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
