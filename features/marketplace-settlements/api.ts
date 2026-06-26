import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import {
  MarketplaceSettlement,
  CreateMarketplaceSettlementPayload,
  UpdateMarketplaceSettlementPayload,
  AddSettlementLinesPayload,
  MarketplaceCustomerSummary
} from '../../types/marketplace';

export const marketplaceSettlementApi = {
  getMarketplaceSettlements: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<MarketplaceSettlement>>(`/marketplace-settlements${query}`);
    return res.data;
  },

  getMarketplaceSettlementById: async (id: string) => {
    const res = await api.get<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}`);
    return res.data;
  },

  createMarketplaceSettlement: async (data: CreateMarketplaceSettlementPayload) => {
    const res = await api.post<BaseResponse<MarketplaceSettlement>>('/marketplace-settlements', data);
    return res.data;
  },

  updateMarketplaceSettlement: async (id: string, data: UpdateMarketplaceSettlementPayload) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}`, data);
    return res.data;
  },

  addSettlementLines: async (id: string, data: AddSettlementLinesPayload) => {
    const res = await api.post<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/lines`, data);
    return res.data;
  },

  validateSettlement: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/validate`);
    return res.data;
  },

  matchSettlement: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/match`);
    return res.data;
  },

  markSettlementReady: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/mark-ready`);
    return res.data;
  },

  postSettlement: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/post`);
    return res.data;
  },

  voidSettlement: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceSettlement>>(`/marketplace-settlements/${id}/void`);
    return res.data;
  },

  getCustomerSummary: async (id: string) => {
    const res = await api.get<BaseResponse<MarketplaceCustomerSummary>>(`/marketplace-settlements/${id}/customer-summary`);
    return res.data;
  },

  manualMatchLine: async (lineId: string, data: { salesOrderId: string; notes?: string }) => {
    const res = await api.patch<BaseResponse<void>>(`/marketplace-settlement-lines/${lineId}/manual-match`, data);
    return res.data;
  }
};
