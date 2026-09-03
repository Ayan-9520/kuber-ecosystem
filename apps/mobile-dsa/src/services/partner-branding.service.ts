import { apiGet, apiPatch, apiPost } from '@/lib/api';

export interface PartnerBrandProfile {
  slug: string;
  profileUrl: string;
  isPublished: boolean;
  displayName: string;
  designation: string;
  companyName: string | null;
  tagline: string | null;
  biography: string | null;
  mission?: string | null;
  vision?: string | null;
  photoUrl?: string | null;
  experienceYears?: number | null;
  businessSince?: number | null;
  languages?: string[];
  officeAddress?: string | null;
  location: { city: string | null; state: string | null; label: string };
  contact?: { phone?: string | null; whatsapp?: string | null; email?: string | null };
  company?: { officeAddress?: string | null };
  seo: { title: string; description: string };
  badges: { type: string; label: string }[];
  expertises: { type: string; label: string }[];
}

export const partnerBrandingService = {
  getMyProfile: () => apiGet<PartnerBrandProfile>('/partner-branding/me'),

  updateMyProfile: (payload: Record<string, unknown>) =>
    apiPatch<PartnerBrandProfile>('/partner-branding/me', payload),

  publish: (publish: boolean) =>
    apiPost<PartnerBrandProfile>('/partner-branding/me/publish', { publish }),

  generateContent: (type: string, prompt?: string) =>
    apiPost<{ body: string; type: string }>('/partner-branding/me/generate-content', {
      type,
      prompt,
    }),
};
