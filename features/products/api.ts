import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Product } from '../../types/product';
import { buildQueryString } from '../../lib/query';

export const productsApi = {
  getProducts: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Product>>(`/products${query}`);
    return res.data;
  },
  getProductById: async (id: string) => {
    const res = await api.get<BaseResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: any) => {
    const res = await api.post<BaseResponse<Product>>('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: any) => {
    const res = await api.patch<BaseResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  activateProduct: async (id: string) => {
    const res = await api.patch<BaseResponse<Product>>(`/products/${id}/activate`);
    return res.data;
  },
  deactivateProduct: async (id: string) => {
    const res = await api.patch<BaseResponse<Product>>(`/products/${id}/deactivate`);
    return res.data;
  },
};
