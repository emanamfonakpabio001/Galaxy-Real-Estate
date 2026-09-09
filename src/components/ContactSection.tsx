import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
  Sparkles, Building, MessageSquare, AlertCircle,
  Navigation, ExternalLink, Copy, Check, Compass, Loader2
} from 'lucide-react';
import { company } from '../config/company';
import { CompanyConfig } from '../types';
import { createWhatsAppUrl } from '../utils/formatters';
import { submitToFormspree } from '../services/formspree';
import { api } from '../services/api';

interface ContactSectionProps {
  companyConfig?: CompanyConfig | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ companyConfig }) => {
  const currentCompany = companyConfig || company;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Property Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeOfficeTab, setActiveOfficeTab] = useState<'abuja' | 'lagos' | 'uyo'>('abuja');

  const offices = {
    abuja: {
      name: `${currentCompany.name} Headquarters`,
      tag: 'Headquarters',
      address: currentCompany.address || 'Plot 1408, Maitama District, Abuja, Nigeria',
      query: currentCompany.address || 'Plot 1408, Maitama District, Abuja, Nigeria',
      phone: currentCompany.phone || '08066154568',
      landmark: 'Near Maitama Amusement Park & Diplomatic Enclave',
      coords: '9.0882° N, 7.4934° E',
    },
    lagos: {
      name: 'Lagos Waterfront Office',
      tag: 'Regional Branch',
      address: currentCompany.branches?.[0]?.address || '18A Ozumba Mbadiwe Avenue, Victoria Island, Lagos, Nigeria',
      query: currentCompany.branches?.[0]?.address || '18A Ozumba Mbadiwe Avenue, Victoria Island, Lagos, Nigeria',
      phone: currentCompany.phone || '08066154568',
      landmark: 'Overlooking Lagos Lagoon, Victoria Island Corridor',
      coords: '6.4328° N, 3.4285° E',
    },
    uyo: {
      name: 'Akwa Ibom Regional Office',
      tag: 'Regional Branch',
      address: currentCompany.branches?.[1]?.address || '24 Ewet Housing Estate Road, Uyo, Akwa Ibom, Nigeria',
      query: currentCompany.branches?.[1]?.address || '24 Ewet Housing Estate Road, Uyo, Akwa Ibom, Nigeria',
      phone: currentCompany.phone || '08066154568',
      landmark: 'Ewet Housing Prime Residential Enclave',
      coords: '5.0182° N, 7.9304° E',
    },
  };

  const currentOffice = offices[activeOfficeTab];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const getGoogleMapsDirectionsUrl = (query: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  };

  const getGoogleMapsViewUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please provide your phone number.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please write your message or property requirements.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    // Submit to MongoDB backend
    try {
      await api.inquiries.submitPublic({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `[Subject: ${formData.subject}] ${formData.message}`,
        inquiryType: 'General Advisory',
      });
    } catch (apiErr) {
      console.warn('Direct API lead recording warning:', apiErr);
    }

    const result = await submitToFormspree({
      form_type: 'General Contact / Advisory Inquiry',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message || 'Submission could not be completed. Please try again or message us on WhatsApp.');
    }
  };

  const handleSendViaWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Please enter at least your name and phone number for WhatsApp.');
      return;
    }

    const lines = [
      `Hello Galaxy,`,
      ``,
      `I would like to make a property enquiry.`,
      ``,
      `*Name:* ${formData.name}`,
      `*Phone:* ${formData.phone}`,
      `*Email:* ${formData.email || 'Not provided'}`,
      `*Subject:* ${formData.subject}`,
      ``,
      `*Message:*`,
      formData.message || 'I am interested in exploring available properties with Galaxy.',
    ];

    const fullMessage = lines.join('\n');
    const url = createWhatsAppUrl(fullMessage, company.whatsapp);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
            <span>Connect With Us</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            Contact Galaxy Real Estate
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667085] leading-relaxed">
            Reach our luxury advisory desk for private consultations, property viewings, or asset valuation requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Office Details & Business Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B1F3A] text-white rounded-3xl p-8 shadow-xl border border-[#D4A84F]/30 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-[#D4A84F]/30 shadow-md shrink-0">
                    <img
                      src={company.logo}
                      alt="Galaxy Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-wider text-white">
                      {company.name}
                    </h3>
                    <p className="text-xs text-[#D4A84F] font-semibold">{company.tagline}</p>
                  </div>
                </div>

                <div className="space-y-6 text-sm">
                  
                  {/* Address */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 rounded-xl bg-white/10 text-[#D4A84F] shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Headquarters</h4>
                      <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{currentCompany.address || company.address}</p>
                    </div>
                  </div>

                  {/* Branches */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <h4 className="text-xs font-bold text-[#D4A84F] uppercase tracking-wider">Regional Offices</h4>
                    {(currentCompany.branches || company.branches).map((branch, idx) => (
                      <div key={idx} className="text-xs text-slate-300 pl-2 border-l-2 border-[#D4A84F]/50">
                        <strong className="text-white block">{branch.city}:</strong>
                        <span>{branch.address}</span>
                      </div>
                    ))}
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-3.5 pt-2 border-t border-white/10">
                    <div className="p-2 rounded-xl bg-white/10 text-[#D4A84F] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Phone Lines</h4>
                      <a href={`tel:${currentCompany.phone || company.phone}`} className="text-slate-300 hover:text-white text-xs block mt-0.5">
                        {currentCompany.phone || company.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 rounded-xl bg-white/10 text-[#D4A84F] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Address</h4>
                      <a href={`mailto:${currentCompany.email || company.email}`} className="text-slate-300 hover:text-white text-xs block mt-0.5">
                        {currentCompany.email || company.email}
                      </a>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start space-x-3.5 pt-2 border-t border-white/10">
                    <div className="p-2 rounded-xl bg-white/10 text-[#D4A84F] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Business Hours</h4>
                      <p className="text-slate-300 text-xs mt-0.5">{(currentCompany.businessHours || company.businessHours).weekdays}</p>
                      <p className="text-slate-300 text-xs">{(currentCompany.businessHours || company.businessHours).saturday}</p>
                      <p className="text-[#D4A84F] text-[11px] mt-0.5">{(currentCompany.businessHours || company.businessHours).sunday}</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => window.open(createWhatsAppUrl(), '_blank', 'noopener,noreferrer')}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat With WhatsApp Live Desk</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Contact & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#F5F7FA] rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
              
              <h3 className="font-display text-2xl font-bold text-[#0B1F3A] mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] mb-8">
                Fill out the details below to submit your enquiry, or send it directly to our agent via WhatsApp.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h4 className="font-display text-xl font-bold text-emerald-950 mb-2">
                    Thank You!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto mb-6">
                    Thank you! Your message has been received. A Galaxy representative will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'General Property Inquiry',
                        message: '',
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] text-[#D4A84F] font-bold text-xs shadow-md transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStandardSubmit} className="space-y-4">
                  
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. john@example.com"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 08012345678"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Subject / Inquiry Type
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                      >
                        <option value="Buy Property">Buying Property (Villa/Apartment)</option>
                        <option value="Rent Property">Renting Luxury Property</option>
                        <option value="Property Management">Property Management Services</option>
                        <option value="Real Estate Investment">Real Estate Investment & Land</option>
                        <option value="General Property Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what kind of property you are looking for (location, budget, bedrooms, specific needs)..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="contact-form-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#142d52] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4A84F]" />
                          <span>Sending to Galaxy...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#D4A84F]" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    <button
                      id="contact-form-whatsapp-btn"
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSendViaWhatsApp}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
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

        {/* INTERACTIVE GOOGLE MAP SHOWCASE */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          
          {/* Map Header & Office Selector Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4A84F]/15 border border-[#D4A84F]/30 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-[#D4A84F]" />
                <span>Office Location & Navigation</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                Visit Galaxy Real Estate Headquarters
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Located at <strong className="text-[#0B1F3A]">Plot 1408, Maitama District, Abuja, Nigeria</strong>.
              </p>
            </div>

            {/* Office Selection Pills */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold self-start md:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveOfficeTab('abuja')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeOfficeTab === 'abuja'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Abuja HQ (Maitama)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOfficeTab('lagos')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeOfficeTab === 'lagos'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Lagos (VI)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOfficeTab('uyo')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeOfficeTab === 'uyo'
                    ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Uyo (Ewet)</span>
              </button>
            </div>
          </div>

          {/* Map Frame Card */}
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            
            {/* Top Details Ribbon */}
            <div className="bg-[#0B1F3A] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D4A84F]/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#D4A84F]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-bold text-white">
                      {currentOffice.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#D4A84F] text-[#0B1F3A]">
                      {currentOffice.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <span>{currentOffice.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyAddress(currentOffice.address)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/15"
                  title="Copy address to clipboard"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>

                <a
                  href={getGoogleMapsDirectionsUrl(currentOffice.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#D4A84F] hover:bg-[#c49842] text-[#0B1F3A] text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={getGoogleMapsViewUrl(currentOffice.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                  title="Open in Google Maps in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Embedded Responsive Google Map */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-100">
              <iframe
                title={`Google Map - ${currentOffice.name}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  currentOffice.query
                )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full"
              />

              {/* Floating Landmark & Accessibility Card on Desktop */}
              <div className="hidden sm:block absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg max-w-xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#0B1F3A] mb-1">
                  <Building className="w-4 h-4 text-[#D4A84F]" />
                  <span>Prime Location Highlights</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {currentOffice.landmark}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>GPS: {currentOffice.coords}</span>
                  <a 
                    href={`tel:${currentOffice.phone}`}
                    className="font-bold text-[#0B1F3A] hover:text-[#D4A84F] transition"
                  >
                    {currentOffice.phone}
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
