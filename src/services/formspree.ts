import { company } from '../config/company';

export interface FormspreePayload {
  form_type?: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  _subject?: string;
  message?: string;
  property_id?: string;
  property_title?: string;
  property_price?: string;
  property_location?: string;
  property_status?: string;
  viewing_type?: string;
  preferred_date?: string;
  time_slot?: string;
  assigned_agent?: string;
  [key: string]: any;
}

export interface FormspreeResponse {
  success: boolean;
  message?: string;
}

export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjnrqjn';

/**
 * Validates basic email format
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Submits form data payload to Formspree endpoint with automatic fallbacks and payload sanitization
 */
export async function submitToFormspree(
  payload: FormspreePayload
): Promise<FormspreeResponse> {
  const endpoint = company.formspreeEndpoint || FORMSPREE_ENDPOINT;

  try {
    const rawEmail = (payload.email || '').trim();
    const hasValidEmail = isValidEmail(rawEmail);
    const clientName = (payload.name || 'Prospective Client').trim();
    const formType = payload.form_type || 'Website Inquiry';

    // Format clean subject line for the email notification
    const subjectLine =
      payload._subject ||
      payload.subject ||
      `[Galaxy Real Estate] ${formType} from ${clientName}`;

    // Build a formatted summary for the message body
    const formattedDate = new Date().toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    let messageBody = payload.message || '';
    if (!messageBody.includes('Submitted On:')) {
      const summaryItems: string[] = [];
      summaryItems.push(`--- GALAXY REAL ESTATE LEAD ---`);
      summaryItems.push(`Website: Galaxy Real Estate`);
      summaryItems.push(`Form Type: ${formType}`);
      summaryItems.push(`Client Name: ${clientName}`);
      if (payload.phone) summaryItems.push(`Phone Number: ${payload.phone}`);
      if (hasValidEmail) summaryItems.push(`Email Address: ${rawEmail}`);
      if (payload.property_title) summaryItems.push(`Property: ${payload.property_title}`);
      if (payload.property_price) summaryItems.push(`Price: ${payload.property_price}`);
      if (payload.property_location) summaryItems.push(`Location: ${payload.property_location}`);
      if (payload.viewing_type) summaryItems.push(`Inspection Type: ${payload.viewing_type}`);
      if (payload.preferred_date) summaryItems.push(`Preferred Date: ${payload.preferred_date}`);
      if (payload.time_slot) summaryItems.push(`Preferred Time: ${payload.time_slot}`);
      if (payload.assigned_agent) summaryItems.push(`Assigned Agent: ${payload.assigned_agent}`);
      summaryItems.push(`Date/Time: ${formattedDate} (WAT / Lagos)`);
      summaryItems.push(`--------------------------------`);

      if (payload.message && payload.message.trim()) {
        messageBody = `${payload.message.trim()}\n\n${summaryItems.join('\n')}`;
      } else {
        messageBody = summaryItems.join('\n');
      }
    }

    // Prepare clean JSON payload
    const submissionData: Record<string, any> = {
      _subject: subjectLine,
      Website: 'Galaxy Real Estate',
      name: clientName,
      message: messageBody,
      phone: payload.phone || '',
      form_type: formType,
      _source: 'Galaxy Real Estate Web App',
      _timestamp: formattedDate,
    };

    // Only attach email / _replyto if it's a valid email (to prevent Formspree 422 TYPE_EMAIL errors)
    if (hasValidEmail) {
      submissionData.email = rawEmail;
      submissionData._replyto = rawEmail;
    }

    // Attach all other metadata
    Object.keys(payload).forEach((key) => {
      if (
        ![
          'email',
          'name',
          'message',
          'subject',
          '_subject',
          'phone',
          'form_type',
        ].includes(key) &&
        payload[key] !== undefined &&
        payload[key] !== null &&
        payload[key] !== ''
      ) {
        submissionData[key] = payload[key];
      }
    });

    // Attempt 1: JSON fetch
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (response.ok) {
      return { success: true };
    }

    // If JSON fails, try Attempt 2: Standard FormData
    const formData = new FormData();
    Object.keys(submissionData).forEach((key) => {
      formData.append(key, String(submissionData[key]));
    });

    const fallbackResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (fallbackResponse.ok) {
      return { success: true };
    }

    const data = await fallbackResponse.json().catch(() => ({}));
    let errorMessage = 'Failed to submit form. Please try again.';

    if (data?.errors && Array.isArray(data.errors)) {
      errorMessage = data.errors
        .map((err: any) => err.message || err.field)
        .join(', ');
    } else if (data?.error) {
      errorMessage = data.error;
    }

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error: any) {
    console.error('Formspree submission error:', error);
    return {
      success: false,
      message:
        error?.message ||
        'Network error while submitting. Please contact us directly via WhatsApp at 08066154568.',
    };
  }
}
