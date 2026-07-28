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
  location: { city: string | null; state: string | null; label: string };
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
