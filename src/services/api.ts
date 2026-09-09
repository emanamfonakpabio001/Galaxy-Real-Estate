import { 
  Property, 
  HomepageContent, 
  AboutContent, 
  ServiceItem, 
  Testimonial, 
  CompanyConfig, 
  SEOConfig, 
  Inquiry, 
  ActivityLogItem, 
  MediaFileMetadata, 
  AdminUser 
} from '../types';
import { optimizeImageForWeb } from '../utils/imageOptimizer';

const API_BASE = '/api';

// Helper to notify the app that CMS / property / settings content was changed
export function dispatchContentUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('galaxy_content_updated'));
  }
}

// Helper for authorized fetch
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('galaxy_admin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  auth: {
    async login(password: string, email?: string): Promise<{ success: boolean; token: string; user: AdminUser; error?: string }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('galaxy_admin_token', data.token);
      }
      return data;
    },

    async me(): Promise<{ success: boolean; user?: AdminUser }> {
      const token = localStorage.getItem('galaxy_admin_token');
      if (!token) return { success: false };
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: getAuthHeaders(),
        });
        return await res.json();
      } catch (err) {
        return { success: false };
      }
    },

    async logout(): Promise<void> {
      try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('galaxy_admin_token');
    },

    async updateProfile(profile: { name?: string; email?: string; avatar?: string }) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(profile),
      });
      return await res.json();
    },

    async changePassword(passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) {
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(passwords),
      });
      return await res.json();
    },
  },

  // ----------------------------------------------------
  // PROPERTIES
  // ----------------------------------------------------
  properties: {
    async getPublished(params?: Record<string, any>): Promise<{ data: Property[]; count: number }> {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
      }
      const res = await fetch(`${API_BASE}/properties?${query.toString()}`);
      return await res.json();
    },

    async getBySlug(slug: string): Promise<{ data: Property }> {
      const res = await fetch(`${API_BASE}/properties/${slug}`);
      return await res.json();
    },

    async getAdminAll(): Promise<{ data: Property[]; stats: any }> {
      const res = await fetch(`${API_BASE}/properties/admin/all`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    },

    async create(property: Partial<Property>): Promise<{ success: boolean; data?: Property; error?: string }> {
      const res = await fetch(`${API_BASE}/properties/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(property),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async update(id: string, property: Partial<Property>): Promise<{ success: boolean; error?: string }> {
      const res = await fetch(`${API_BASE}/properties/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(property),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async delete(id: string): Promise<{ success: boolean; error?: string }> {
      const res = await fetch(`${API_BASE}/properties/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async duplicate(id: string): Promise<{ success: boolean; data?: Property; error?: string }> {
      const res = await fetch(`${API_BASE}/properties/admin/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },
  },

  // ----------------------------------------------------
  // MEDIA (GridFS)
  // ----------------------------------------------------
  media: {
    async upload(
      files: File[],
      category: string = 'Property',
      propertyId?: string,
      onProgress?: (progress: { current: number; total: number; percent: number; currentFile: string }) => void
    ): Promise<{ success: boolean; data: MediaFileMetadata[]; error?: string }> {
      if (!files || files.length === 0) {
        return { success: false, data: [], error: 'No files selected for upload.' };
      }

      const token = localStorage.getItem('galaxy_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const allUploaded: MediaFileMetadata[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const currentNum = i + 1;
        const total = files.length;

        if (onProgress) {
          onProgress({
            current: currentNum,
            total,
            percent: Math.round(((currentNum - 0.5) / total) * 100),
            currentFile: file.name,
          });
        }

        try {
          // Client-side optimize large camera photos before network transmission
          const optimizedFile = await optimizeImageForWeb(file);

          const formData = new FormData();
          formData.append('images', optimizedFile);
          formData.append('category', category);
          if (propertyId) formData.append('propertyId', propertyId);

          const res = await fetch(`${API_BASE}/media/admin/upload`, {
            method: 'POST',
            headers,
            body: formData,
          });

          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            const rawText = await res.text();
            let parsedMessage = '';
            const preMatch = rawText.match(/<pre>([\s\S]*?)<\/pre>/i);
            if (preMatch) {
              parsedMessage = preMatch[1].replace(/<[^>]+>/g, '').trim();
            } else {
              const titleMatch = rawText.match(/<title>([\s\S]*?)<\/title>/i);
              if (titleMatch) parsedMessage = titleMatch[1].trim();
            }
            errors.push(`${file.name}: ${parsedMessage || `Upload failed (status ${res.status})`}`);
            continue;
          }

          const json = await res.json();
          if (!res.ok || !json.success) {
            errors.push(`${file.name}: ${json.error || 'Upload error'}`);
            continue;
          }

          if (Array.isArray(json.data) && json.data.length > 0) {
            allUploaded.push(...json.data);
          }
        } catch (networkErr: any) {
          console.error(`Error uploading ${file.name}:`, networkErr);
          errors.push(`${file.name}: ${networkErr?.message || 'Network error'}`);
        } finally {
          if (onProgress) {
            onProgress({
              current: currentNum,
              total,
              percent: Math.round((currentNum / total) * 100),
              currentFile: file.name,
            });
          }
        }
      }

      if (allUploaded.length > 0) {
        dispatchContentUpdated();
      }

      if (allUploaded.length === 0 && errors.length > 0) {
        return {
          success: false,
          data: [],
          error: errors.join('; '),
        };
      }

      return {
        success: allUploaded.length > 0,
        data: allUploaded,
        error: errors.length > 0 ? `${errors.length} photo(s) failed: ${errors.join(', ')}` : undefined,
      };
    },

    async saveEdited(data: { base64Data: string; filename: string; category?: string; propertyId?: string; originalFileId?: string; altText?: string }) {
      const res = await fetch(`${API_BASE}/media/admin/save-edited`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) dispatchContentUpdated();
      return result;
    },

    async getLibrary(category?: string, search?: string): Promise<{ data: MediaFileMetadata[] }> {
      const query = new URLSearchParams();
      if (category) query.append('category', category);
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE}/media/admin/library?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    },

    async delete(fileId: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/media/admin/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async updateMetadata(fileId: string, updates: Partial<MediaFileMetadata>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/media/admin/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },
  },

  // ----------------------------------------------------
  // CONTENT CMS
  // ----------------------------------------------------
  content: {
    async getHomepage(): Promise<{ data: HomepageContent }> {
      const res = await fetch(`${API_BASE}/content/homepage`);
      return await res.json();
    },

    async updateHomepage(content: Partial<HomepageContent>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/homepage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async getAbout(): Promise<{ data: AboutContent }> {
      const res = await fetch(`${API_BASE}/content/about`);
      return await res.json();
    },

    async updateAbout(content: Partial<AboutContent>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async getServices(): Promise<{ data: ServiceItem[] }> {
      const res = await fetch(`${API_BASE}/content/services`);
      return await res.json();
    },

    async createService(service: Partial<ServiceItem>): Promise<{ success: boolean; data?: ServiceItem }> {
      const res = await fetch(`${API_BASE}/content/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async updateService(id: string, service: Partial<ServiceItem>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async deleteService(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async getTestimonials(): Promise<{ data: Testimonial[] }> {
      const res = await fetch(`${API_BASE}/content/testimonials`);
      return await res.json();
    },

    async createTestimonial(testimonial: Partial<Testimonial>): Promise<{ success: boolean; data?: Testimonial }> {
      const res = await fetch(`${API_BASE}/content/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(testimonial),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(testimonial),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async deleteTestimonial(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/testimonials/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async getSEO(): Promise<{ data: SEOConfig }> {
      const res = await fetch(`${API_BASE}/content/seo`);
      return await res.json();
    },

    async updateSEO(seo: Partial<SEOConfig>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/content/seo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(seo),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },
  },

  // ----------------------------------------------------
  // SETTINGS & WHATSAPP
  // ----------------------------------------------------
  settings: {
    async get(): Promise<{ data: CompanyConfig }> {
      const res = await fetch(`${API_BASE}/settings`);
      return await res.json();
    },

    async update(settings: Partial<CompanyConfig>): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/settings/admin/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },

    async updateWhatsApp(whatsapp: string, defaultWhatsAppMessage?: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/settings/admin/whatsapp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ whatsapp, defaultWhatsAppMessage }),
      });
      const data = await res.json();
      if (data.success) dispatchContentUpdated();
      return data;
    },
  },

  // ----------------------------------------------------
  // INQUIRIES
  // ----------------------------------------------------
  inquiries: {
    async submit(inquiry: {
      name: string;
      email?: string;
      phone?: string;
      message: string;
      propertyId?: string;
      propertyTitle?: string;
      propertyPrice?: number;
      propertySlug?: string;
      inquiryType?: string;
    }): Promise<{ success: boolean; message: string; inquiryId?: string }> {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry),
      });
      return await res.json();
    },

    async submitPublic(inquiry: {
      name: string;
      email?: string;
      phone?: string;
      message: string;
      propertyId?: string;
      propertyTitle?: string;
      propertyPrice?: number;
      propertySlug?: string;
      inquiryType?: string;
    }): Promise<{ success: boolean; message: string; inquiryId?: string }> {
      return this.submit(inquiry);
    },

    async getAdminAll(status?: string, search?: string): Promise<{ data: Inquiry[]; stats: any }> {
      const query = new URLSearchParams();
      if (status) query.append('status', status);
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE}/inquiries/admin/all?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    },

    async updateStatus(id: string, status: string, notes?: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/inquiries/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status, notes }),
      });
      return await res.json();
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/inquiries/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    },
  },

  // ----------------------------------------------------
  // ACTIVITY LOGS
  // ----------------------------------------------------
  activity: {
    async get(search?: string): Promise<{ data: ActivityLogItem[] }> {
      const query = new URLSearchParams();
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE}/admin/activity?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    },
  },

  // ----------------------------------------------------
  // BACKUP & IMPORT
  // ----------------------------------------------------
  backup: {
    async exportUrl(): Promise<string> {
      return `${API_BASE}/admin/backup/export`;
    },

    async import(backupData: any, overwrite: boolean = true): Promise<{ success: boolean; message?: string }> {
      const res = await fetch(`${API_BASE}/admin/backup/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ backupData, overwrite }),
      });
      return await res.json();
    },
  },
};
