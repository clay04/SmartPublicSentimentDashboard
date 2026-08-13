export interface AIResultNews {
    _id: string;
    title: string;
    content: string;
    keyword?: string;
    source?: string;
    sentiment?: string;
    category?: string;
    urgency?: string;
    recommendation?: string;
    regulation_context?: string;
    source_document?: string;
    location: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export interface PaginationMeta {
  totalData: number;
  totalPage: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedNewsResponse {
  data: AIResultNews[];
  pagination: PaginationMeta;
}

export interface NewsQueryParams {
  sw_lat?: number;
  sw_lng?: number;
  ne_lat?: number;
  ne_lng?: number;
  search?: string;
  page?: number;
  limit?: number;
}