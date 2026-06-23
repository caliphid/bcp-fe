import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { 
  Transaction, 
  TransactionSummary, 
  MonthlySummary, 
  CategorySummary, 
  AccountSummary,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  VoidTransactionPayload
} from '../../types/transaction';
import { buildQueryString } from '../../lib/query';

export const transactionsApi = {
  getTransactions: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Transaction>>(`/transactions${query}`);
    return res.data;
  },
  
  getTransactionById: async (id: string) => {
    const res = await api.get<BaseResponse<Transaction>>(`/transactions/${id}`);
    return res.data;
  },
  
  createTransaction: async (data: CreateTransactionPayload) => {
    const res = await api.post<BaseResponse<Transaction>>('/transactions', data);
    return res.data;
  },
  
  updateTransaction: async (id: string, data: UpdateTransactionPayload) => {
    const res = await api.patch<BaseResponse<Transaction>>(`/transactions/${id}`, data);
    return res.data;
  },
  
  voidTransaction: async (id: string, data: VoidTransactionPayload) => {
    const res = await api.patch<BaseResponse<Transaction>>(`/transactions/${id}/void`, data);
    return res.data;
  },
  
  getSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<TransactionSummary>>(`/transactions/summary${query}`);
    return res.data;
  },
  
  getMonthlySummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<MonthlySummary[]>>(`/transactions/monthly-summary${query}`);
    return res.data;
  },
  
  getCategorySummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<CategorySummary[]>>(`/transactions/category-summary${query}`);
    return res.data;
  },
  
  getAccountSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<AccountSummary[]>>(`/transactions/account-summary${query}`);
    return res.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ url: string }>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  
  downloadFile: async (url: string) => {
    // URL could be full or relative
    const res = await api.get(url, {
      responseType: 'blob'
    });
    return res.data as Blob;
  }
};
