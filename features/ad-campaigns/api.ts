import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  AdCampaignItem,
  CreateAdCampaignPayload,
  UpdateAdCampaignPayload,
  UpdateAdCampaignStatusPayload,
} from "../../types/ads";

export const adCampaignsApi = {
  getCampaigns: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<AdCampaignItem>>(`/ad-campaigns${query}`);
    return res.data;
  },

  getCampaignDetail: async (id: string) => {
    const res = await api.get<BaseResponse<AdCampaignItem>>(`/ad-campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (data: CreateAdCampaignPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/ad-campaigns", data);
    return res.data;
  },

  updateCampaign: async (id: string, data: UpdateAdCampaignPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ad-campaigns/${id}`, data);
    return res.data;
  },

  updateCampaignStatus: async (id: string, data: UpdateAdCampaignStatusPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/ad-campaigns/${id}/status`, data);
    return res.data;
  },
};
