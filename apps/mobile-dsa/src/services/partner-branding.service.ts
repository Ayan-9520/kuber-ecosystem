import { api } from '@/lib/api';

export interface PartnerBrandProfile {
  slug: string;
  profileUrl: string;
  isPublished: boolean;
  displayName: string;
  designation: string;
  companyName: string | null;
  biography: string | null;
  location: { city: string | null; state: string | null; label: string };
  seo: { title: string; description: string };
  badges: { type: string; label: string }[];
  expertises: { type: string; label: string }[];
}

export const partnerBrandingService = {
  getMyProfile: async () => {
    const { data } = await api.get<{ data: PartnerBrandProfile }>('/partner-branding/me');
    return data.data;
  },

  updateMyProfile: async (payload: Record<string, unknown>) => {
    const { data } = await api.patch<{ data: PartnerBrandProfile }>('/partner-branding/me', payload);
    return data.data;
  },

  publish: async (publish: boolean) => {
    const { data } = await api.post<{ data: PartnerBrandProfile }>('/partner-branding/me/publish', { publish });
    return data.data;
  },

  generateContent: async (type: string, prompt?: string) => {
    const { data } = await api.post<{ data: { body: string; type: string } }>('/partner-branding/me/generate-content', {
      type,
      prompt,
    });
    return data.data;
  },
};
