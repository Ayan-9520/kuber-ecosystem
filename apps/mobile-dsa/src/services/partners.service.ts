import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export interface RegisterPartnerPayload {
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  pan?: string;
  partnerTypeCode?: 'DSA' | 'BUILDER' | 'BROKER' | 'CA' | 'CORPORATE';
}

export const partnersService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/partners', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/partners/${id}`),
  register: (data: RegisterPartnerPayload) =>
    apiPost<Record<string, unknown>>('/partners/register', {
      partnerTypeCode: 'DSA',
      ...data,
    }),
};
