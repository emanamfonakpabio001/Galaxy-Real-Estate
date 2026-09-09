import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { company } from '../config/company';
import { createWhatsAppUrl } from '../utils/formatters';

interface WhatsAppFloatingButtonProps {
  customMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ customMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userNote, setUserNote] = useState('');

  const defaultMsg = customMessage || "Hello Galaxy, I am interested in your properties and would like to speak with an agent.";
  
  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = userNote.trim()
      ? `Hello Galaxy, ${userNote.trim()}`
      : defaultMsg;
    window.open(createWhatsAppUrl(finalMsg), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setUserNote('');
  };

  const handleDirectClick = () => {
    window.open(createWhatsAppUrl(defaultMsg), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end print:hidden">
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div 
          id="whatsapp-chat-box"
          className="mb-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#0B1F3A] p-4 text-white flex items-center justify-between border-b border-[#D4A84F]/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold shadow-md">
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0B1F3A] rounded-full"></span>
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight">Galaxy Real Estate</h4>
                <p className="text-xs text-[#D4A84F] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Online • Ready to Assist
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              aria-label="Close chat popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#F5F7FA]">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-sm text-[#172033] border border-slate-100 mb-3">
              <p className="font-medium text-xs text-[#0B1F3A] mb-1">Galaxy Advisor</p>
              <p className="leading-relaxed">
                Hello! Welcome to Galaxy Real Estate. How can we help you find your dream property today?
              </p>
              <span className="text-[10px] text-slate-400 block text-right mt-1">Just now</span>
            </div>

            {/* Quick Prompt suggestions */}
            <div className="space-y-1.5 mb-3">
              <button
                type="button"
                onClick={() => setUserNote('I would like to inspect luxury villas in Abuja.')}
                className="w-full text-left text-xs bg-white hover:bg-[#FDF8EE] hover:border-[#D4A84F] border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 transition"
              >
                🏡 Luxury villas in Abuja
              </button>
              <button
                type="button"
                onClick={() => setUserNote('I want information on prime apartments in Lagos.')}
                className="w-full text-left text-xs bg-white hover:bg-[#FDF8EE] hover:border-[#D4A84F] border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 transition"
              >
                🏢 Waterfront apartments in Lagos
              </button>
              <button
                type="button"
                onClick={() => setUserNote('I want to enquire about real estate investment options.')}
                className="w-full text-left text-xs bg-white hover:bg-[#FDF8EE] hover:border-[#D4A84F] border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 transition"
              >
                📈 Real estate investment options
              </button>
            </div>

            <form onSubmit={handleQuickSend} className="flex gap-2">
              <input
                type="text"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4A84F] focus:ring-1 focus:ring-[#D4A84F]"
              />
              <button
                type="submit"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2.5 rounded-xl flex items-center justify-center transition shadow-md"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button with Tooltip */}
      <div className="flex items-center gap-3">
        {/* Tooltip pill matching design metadata */}
        <div 
          onClick={handleDirectClick}
          className="hidden sm:block cursor-pointer bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200/80 text-xs font-bold text-[#0B1F3A] hover:bg-[#F5F7FA] transition"
        >
          Chat with an Agent
        </div>

        {/* Action Button */}
        <button
          id="whatsapp-floating-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform text-white ring-4 ring-white/80"
          aria-label="Chat with an Agent on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
