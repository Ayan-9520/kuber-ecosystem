import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProfessionalDirectoryItem {
  slug: string;
  displayName: string;
  designation: string;
  companyName: string | null;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  experienceYears: number | null;
  customerRating: number | null;
  expertises: { type: string; label: string }[];
  badges: { type: string; label: string }[];
  languages: string[];
}

export interface PartnerProfile {
  id: string;
  slug: string;
  profileUrl: string;
  isPublished: boolean;
  coverImageUrl: string | null;
  photoUrl: string | null;
  companyLogoUrl: string | null;
  displayName: string;
  designation: string;
  tagline: string | null;
  companyName: string | null;
  companyCategory: string | null;
  associatedWith: string;
  poweredBy: string;
  biography: string | null;
  mission: string | null;
  vision: string | null;
  experienceYears: number | null;
  businessSince: number | null;
  languages: string[];
  workingAreas: string[];
  gender: string | null;
  location: { city: string | null; state: string | null; country: string; label: string };
  company: {
    name: string | null;
    logoUrl: string | null;
    category: string | null;
    gstNumber: string | null;
    establishedYear: number | null;
    founderName: string | null;
    officeAddress: string | null;
    citiesServed: string[];
    website: string | null;
  };
  contact: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    consultationUrl: string | null;
    calendarUrl: string | null;
    applyLoanUrl: string | null;
    applyInsuranceUrl: string | null;
  };
  seo: { title: string; description: string; keywords: string[] };
  expertises: { type: string; label: string; isPrimary: boolean }[];
  statistics: {
    businessFacilitated: number | null;
    customersServed: number | null;
    experienceYears: number | null;
    partnerSince: string;
    customerRating: number | null;
    productsCount: number | null;
    citiesCovered: number | null;
    verified: boolean;
  } | null;
  achievements: {
    id: string;
    type: string;
    title: string | null;
    description: string | null;
    year: number | null;
    imageUrl: string | null;
    isVerified: boolean;
  }[];
  certificates: {
    id: string;
    type: string;
    title: string;
    issuer: string | null;
    issuedAt: string | null;
    imageUrl: string | null;
    downloadUrl: string | null;
    isVerified: boolean;
  }[];
  reviews: {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string | null;
    photoUrl: string | null;
    videoUrl: string | null;
    reviewedAt: string;
  }[];
  media: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    url: string;
    thumbnailUrl: string | null;
    publishedAt: string | null;
  }[];
  gallery: {
    id: string;
    category: string;
    title: string | null;
    imageUrl: string;
    caption: string | null;
  }[];
  team: { id: string; name: string; role: string | null; photoUrl: string | null }[];
  socialLinks: { platform: string; url: string }[];
  badges: { type: string; label: string }[];
  themePreference: string;
  profileViews: number;
  publishedAt: string | null;
  partnerCode: string;
  kycStatus: string;
}

export interface ShareUrls {
  profileUrl: string;
  linkedin: string;
  facebook: string;
  whatsapp: string;
  x: string;
  telegram: string;
  email: string;
}

export const professionalsApi = {
  list: async (params: Record<string, string | number | undefined>) => {
    const { data } = await api.get<{
      success: boolean;
      data: ProfessionalDirectoryItem[];
      meta: PaginatedData<ProfessionalDirectoryItem>['meta'];
      message?: string;
    }>('/public/professionals', { params });

    return { items: data.data, meta: data.meta };
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<ApiResponse<PartnerProfile>>(`/public/professionals/${slug}`);
    return data.data;
  },

  getShareUrls: async (slug: string) => {
    const { data } = await api.get<ApiResponse<ShareUrls>>(`/public/professionals/${slug}/share`);
    return data.data;
  },
};
