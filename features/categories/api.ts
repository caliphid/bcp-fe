import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Category } from '../../types/category';
import { buildQueryString } from '../../lib/query';

export const categoriesApi = {
  getCategories: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Category>>(`/categories${query}`);
    return res.data;
  },
  getCategoryTree: async () => {
    const res = await api.get<ListResponse<Category>>(`/categories/tree`);
    return res.data;
  },
  getCategoryById: async (id: string) => {
    const res = await api.get<BaseResponse<Category>>(`/categories/${id}`);
    return res.data;
  },
  createCategory: async (data: any) => {
    const res = await api.post<BaseResponse<Category>>('/categories', data);
    return res.data;
  },
  updateCategory: async (id: string, data: any) => {
    const res = await api.patch<BaseResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },
  activateCategory: async (id: string) => {
    const res = await api.patch<BaseResponse<Category>>(`/categories/${id}/activate`);
    return res.data;
  },
  deactivateCategory: async (id: string) => {
    const res = await api.patch<BaseResponse<Category>>(`/categories/${id}/deactivate`);
    return res.data;
  },
};
