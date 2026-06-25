import api from '../../lib/axios';
import { ProductCategory, CreateProductCategoryRequest, UpdateProductCategoryRequest } from "../../types/product-category";
import { MasterStatus } from "../../types/enums";
import { BaseResponse, ListResponse } from "../../types/common";
import { buildQueryString } from "../../lib/query";

export const productCategoriesApi = {
  getProductCategories: async (params?: {
    status?: MasterStatus;
    search?: string;
  }) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const response = await api.get<ListResponse<ProductCategory>>(`/product-categories${query}`);
    return response.data;
  },

  getProductCategory: async (id: string) => {
    const response = await api.get<BaseResponse<ProductCategory>>(`/product-categories/${id}`);
    return response.data;
  },

  createProductCategory: async (data: CreateProductCategoryRequest) => {
    const response = await api.post<BaseResponse<ProductCategory>>("/product-categories", data);
    return response.data;
  },

  updateProductCategory: async (id: string, data: UpdateProductCategoryRequest) => {
    const response = await api.patch<BaseResponse<ProductCategory>>(`/product-categories/${id}`, data);
    return response.data;
  },

  deleteProductCategory: async (id: string) => {
    const response = await api.delete<BaseResponse<void>>(`/product-categories/${id}`);
    return response.data;
  },
};
