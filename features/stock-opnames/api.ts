import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import { 
  StockOpnameSession,
  CreateStockOpnameRequest,
  SubmitCountsRequest,
  RecountRequest,
  ReviewApproveRequest,
  CancelVoidRequest
} from '../../types/stock-opname';

export const stockOpnameApi = {
  getSessions: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<StockOpnameSession>>(`/stock-opnames${query}`);
    return res.data;
  },

  getSessionById: async (id: string) => {
    const res = await api.get<BaseResponse<StockOpnameSession>>(`/stock-opnames/${id}`);
    return res.data;
  },

  createSession: async (data: CreateStockOpnameRequest) => {
    const res = await api.post<BaseResponse<StockOpnameSession>>('/stock-opnames', data);
    return res.data;
  },

  submitCounts: async (id: string, data: SubmitCountsRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/counts`, data);
    return res.data;
  },

  recountSession: async (id: string, data: RecountRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/recount`, data);
    return res.data;
  },

  reviewSession: async (id: string, data: ReviewApproveRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/review`, data);
    return res.data;
  },

  approveSession: async (id: string, data: ReviewApproveRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/approve`, data);
    return res.data;
  },

  postSession: async (id: string) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/post`);
    return res.data;
  },

  cancelSession: async (id: string, data: CancelVoidRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/cancel`, data);
    return res.data;
  },

  voidSession: async (id: string, data: CancelVoidRequest) => {
    const res = await api.post<BaseResponse<any>>(`/stock-opnames/${id}/void`, data);
    return res.data;
  },

  getVarianceReport: async (id: string) => {
    const res = await api.get<BaseResponse<any>>(`/stock-opnames/${id}/variance-report`);
    return res.data;
  },

  getReconciliationReport: async (id: string) => {
    const res = await api.get<BaseResponse<any>>(`/stock-opnames/${id}/reconciliation-report`);
    return res.data;
  }
};
