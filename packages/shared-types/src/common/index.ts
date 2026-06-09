export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IdParam {
  id: string;
}

export type Environment = 'development' | 'testing' | 'uat' | 'production';
