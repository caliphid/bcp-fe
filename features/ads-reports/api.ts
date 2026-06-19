import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  AdsReportItem,
  AdsReportDetail,
  CreateAdsReportPayload,
  UpdateAdsReportPayload,
  CreateAdsReportItemPayload,
  PostAdsReportPayload,
  VoidAdsReportPayload,
  AdsSummaryData,
  AdsProductPerformanceItem,
  AdsPlatformPerformanceItem,
  AdsCampaignPerformanceItem,
  AdsMonthlyPerformanceItem,
  AdsDailyPerformanceItem,
} from "../../types/ads";

export const adsReportsApi = {
  getReports: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<AdsReportItem>>(`/ads-reports${query}`);
    return res.data;
  },

  getReportDetail: async (id: string) => {
    const res = await api.get<BaseResponse<AdsReportDetail>>(`/ads-reports/${id}`);
    return res.data;
  },

  createReport: async (data: CreateAdsReportPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/ads-reports", data);
    return res.data;
  },

  updateReport: async (id: string, data: UpdateAdsReportPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ads-reports/${id}`, data);
    return res.data;
  },

  postReport: async (id: string, data: PostAdsReportPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ads-reports/${id}/post`, data);
    return res.data;
  },

  voidReport: async (id: string, data: VoidAdsReportPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ads-reports/${id}/void`, data);
    return res.data;
  },

  addItem: async (reportId: string, data: CreateAdsReportItemPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>(`/ads-reports/${reportId}/items`, data);
    return res.data;
  },

  updateItem: async (reportId: string, itemId: string, data: CreateAdsReportItemPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ads-reports/${reportId}/items/${itemId}`, data);
    return res.data;
  },

  removeItem: async (reportId: string, itemId: string) => {
    const res = await api.delete<BaseResponse<{ id: string }>>(`/ads-reports/${reportId}/items/${itemId}`);
    return res.data;
  },

  // Analytics
  getSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsSummaryData>>(`/ads-reports/summary${query}`);
    return res.data;
  },

  getProductPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsProductPerformanceItem[]>>(`/ads-reports/product-performance${query}`);
    return res.data;
  },

  getPlatformPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsPlatformPerformanceItem[]>>(`/ads-reports/platform-performance${query}`);
    return res.data;
  },

  getCampaignPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsCampaignPerformanceItem[]>>(`/ads-reports/campaign-performance${query}`);
    return res.data;
  },

  getMonthlyPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsMonthlyPerformanceItem[]>>(`/ads-reports/monthly-performance${query}`);
    return res.data;
  },

  getDailyPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<AdsDailyPerformanceItem[]>>(`/ads-reports/daily-performance${query}`);
    return res.data;
  },
};
