export type Role = 'OWNER' | 'ADMIN_FINANCE' | 'STAFF_INPUT';

export type Status = 'ACTIVE' | 'INACTIVE';

export interface BaseResponse<T = any> {
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T = any> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
