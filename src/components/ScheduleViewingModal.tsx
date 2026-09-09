import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle2, Video, Loader2, AlertCircle } from 'lucide-react';
import { Property } from '../types';
import { formatNaira, createWhatsAppUrl } from '../utils/formatters';
import { company } from '../config/company';
import { submitToFormspree } from '../services/formspree';
import { api } from '../services/api';

interface ScheduleViewingModalProps {
  property: Property;
  onClose: () => void;
}

export const ScheduleViewingModal: React.FC<ScheduleViewingModalProps> = ({
  property,
  onClose,
}) => {
  const [viewingType, setViewingType] = useState<'physical' | 'virtual'>('physical');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date.trim()) {
      setErrorMessage('Please fill in your name, phone number, and preferred date.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    // Submit to MongoDB backend
    try {
      await api.inquiries.submitPublic({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: `Inspection Request (${viewingType === 'physical' ? 'Physical' : 'Virtual'}) on ${date} at ${timeSlot}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        inquiryType: 'Viewing Inspection',
      });
    } catch (apiErr) {
      console.warn('Direct API lead recording warning:', apiErr);
    }

    const result = await submitToFormspree({
      form_type: `Viewing Inspection Booking: ${property.title}`,
      property_id: property.id,
      property_title: property.title,
      property_price: formatNaira(property.price),
      property_location: `${property.location.neighborhood}, ${property.location.city}`,
      viewing_type: viewingType === 'physical' ? 'Physical Guided Inspection' : 'Virtual Video Tour',
      preferred_date: date,
      time_slot: timeSlot,
      assigned_agent: property.agent.name,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message || 'Unable to log appointment online. Please book directly on WhatsApp.');
    }
  };

  const handleWhatsAppBooking = () => {
    const lines = [
      `Hello Galaxy,`,
      ``,
      `I would like to schedule a *${viewingType === 'physical' ? 'Physical Guided Inspection' : 'Live Virtual Walkthrough'}* for the property:`,
      `*${property.title}* (${property.location.neighborhood}, ${property.location.city})`,
      `💰 Price: ${formatNaira(property.price)}`,
      ``,
      `*Preferred Schedule:*`,
      `📅 Date: ${date || 'Earliest available'}`,
      `⏰ Time: ${timeSlot}`,
      ``,
      `*Client Details:*`,
      `• Name: ${name || 'Prospective Buyer'}`,
      `• Phone: ${phone || 'Please call back'}`,
      `• Email: ${email || 'Provided on chat'}`,
    ];

    window.open(createWhatsAppUrl(lines.join('\n'), property.agent.whatsapp || company.whatsapp), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B1F3A] p-6 text-white flex items-center justify-between border-b border-[#D4A84F]/30">
          <div>
            <h3 className="font-display text-xl font-bold">Schedule Property Viewing</h3>
            <p className="text-xs text-[#D4A84F] mt-0.5">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 animate-in zoom-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-display text-xl font-bold text-[#0B1F3A] mb-2">
                Inspection Request Logged!
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Thank you, {name}. Agent {property.agent.name} has been notified and will confirm your {viewingType} appointment for {date} at {timeSlot}.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleWhatsAppBooking}
                  className="w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md transition"
                >
                  Confirm Instantly on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#F5F7FA] p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewingType('physical')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    viewingType === 'physical'
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Physical Inspection</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingType('virtual')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    viewingType === 'virtual'
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Virtual Video Tour</span>
                </button>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  >
                    <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
                    <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                    <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional for appointment confirmation"
                  className="w-full bg-[#F5F7FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#D4A84F]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#142d52] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A84F]" />
                      <span>Scheduling with Galaxy...</span>
                    </>
                  ) : (
                    <span>Request Appointment</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleWhatsAppBooking}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Book Instantly via WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
