import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  AdPlatformItem,
  CreateAdPlatformPayload,
  UpdateAdPlatformPayload,
} from "../../types/ads";

export const adPlatformsApi = {
  getPlatforms: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<AdPlatformItem>>(`/ad-platforms${query}`);
    return res.data;
  },

  getPlatformDetail: async (id: string) => {
    const res = await api.get<BaseResponse<AdPlatformItem>>(`/ad-platforms/${id}`);
    return res.data;
  },

  createPlatform: async (data: CreateAdPlatformPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/ad-platforms", data);
    return res.data;
  },

  updatePlatform: async (id: string, data: UpdateAdPlatformPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ad-platforms/${id}`, data);
    return res.data;
  },

  activatePlatform: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ad-platforms/${id}/activate`);
    return res.data;
  },

  deactivatePlatform: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ad-platforms/${id}/deactivate`);
    return res.data;
  },
};
