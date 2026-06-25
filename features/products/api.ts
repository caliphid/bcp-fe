import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Product, ProductVariant, CreateProductRequest, UpdateProductRequest, CreateProductVariantRequest, UpdateProductVariantRequest } from '../../types/product';

export const productApi = {
  // --- Products ---
  getProducts: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<Product>>('/products', { params });
    return res.data;
  },

  getProductById: async (id: string) => {
    const res = await api.get<BaseResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  createProduct: async (data: CreateProductRequest) => {
    const res = await api.post<BaseResponse<Product>>('/products', data);
    return res.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
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

  // --- Product Variants ---
  getProductVariants: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<ProductVariant>>('/product-variants', { params });
    return res.data;
  },

  getProductVariantById: async (id: string) => {
    const res = await api.get<BaseResponse<ProductVariant>>(`/product-variants/${id}`);
    return res.data;
  },

  createProductVariant: async (data: CreateProductVariantRequest) => {
    const res = await api.post<BaseResponse<ProductVariant>>('/product-variants', data);
    return res.data;
  },

  updateProductVariant: async (id: string, data: UpdateProductVariantRequest) => {
    const res = await api.patch<BaseResponse<ProductVariant>>(`/product-variants/${id}`, data);
    return res.data;
  },

  activateProductVariant: async (id: string) => {
    const res = await api.patch<BaseResponse<ProductVariant>>(`/product-variants/${id}/activate`);
    return res.data;
  },

  deactivateProductVariant: async (id: string) => {
    const res = await api.patch<BaseResponse<ProductVariant>>(`/product-variants/${id}/deactivate`);
    return res.data;
  }
};
