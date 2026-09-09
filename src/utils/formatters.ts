import { company } from '../config/company';

/**
 * Format number into Nigerian Naira currency representation
 */
export function formatNaira(amount: number, isRental = false, period?: 'year' | 'month'): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

  // Replace NGN with standard ₦ symbol
  const clean = formatted.replace('NGN', '₦').trim();
  
  if (isRental) {
    return `${clean} / ${period === 'month' ? 'month' : 'year'}`;
  }
  return clean;
}

/**
 * Short currency format for charts / filters (e.g. ₦85M, ₦1.2B)
 */
export function formatNairaShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(0)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

/**
 * Generates an encoded WhatsApp URL directed to Galaxy's verified WhatsApp business line
 */
export function createWhatsAppUrl(message?: string, customPhone?: string): string {
  const phone = customPhone || company.whatsapp;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message || "Hello Galaxy, I am interested in your properties and would like to speak with an agent.");
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

/**
 * Builds formatted WhatsApp inquiry text from form data
 */
export function buildWhatsAppInquiryMessage(data: {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyLocation?: string;
  inquiryType?: string;
}): string {
  const lines: string[] = [
    `Hello Galaxy,`,
    ``,
    data.propertyTitle 
      ? `I would like to make an enquiry regarding the property: *${data.propertyTitle}*`
      : `I would like to make a real estate inquiry.`,
  ];

  if (data.propertyLocation) {
    lines.push(`📍 Location: ${data.propertyLocation}`);
  }
  if (data.propertyPrice) {
    lines.push(`💰 Listed Price: ${formatNaira(data.propertyPrice)}`);
  }
  if (data.inquiryType) {
    lines.push(`🏷️ Request Type: ${data.inquiryType}`);
  }

  lines.push(``);
  lines.push(`*Client Information:*`);
  lines.push(`• Name: ${data.name}`);
  lines.push(`• Phone: ${data.phone}`);
  lines.push(`• Email: ${data.email}`);
  lines.push(``);
  lines.push(`*Message:*`);
  lines.push(data.message || 'I would like more information or to schedule a private inspection.');

  return lines.join('\n');
}
