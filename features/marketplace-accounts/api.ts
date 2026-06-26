import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import {
  MarketplaceAccount,
  CreateMarketplaceAccountPayload,
  UpdateMarketplaceAccountPayload
} from '../../types/marketplace';

export const marketplaceAccountApi = {
  getMarketplaceAccounts: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<MarketplaceAccount>>(`/marketplace-accounts${query}`);
    return res.data;
  },

  getMarketplaceAccountById: async (id: string) => {
    const res = await api.get<BaseResponse<MarketplaceAccount>>(`/marketplace-accounts/${id}`);
    return res.data;
  },

  createMarketplaceAccount: async (data: CreateMarketplaceAccountPayload) => {
    const res = await api.post<BaseResponse<MarketplaceAccount>>('/marketplace-accounts', data);
    return res.data;
  },

  updateMarketplaceAccount: async (id: string, data: UpdateMarketplaceAccountPayload) => {
    const res = await api.patch<BaseResponse<MarketplaceAccount>>(`/marketplace-accounts/${id}`, data);
    return res.data;
  },

  activateMarketplaceAccount: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceAccount>>(`/marketplace-accounts/${id}/activate`);
    return res.data;
  },

  deactivateMarketplaceAccount: async (id: string) => {
    const res = await api.patch<BaseResponse<MarketplaceAccount>>(`/marketplace-accounts/${id}/deactivate`);
    return res.data;
  }
};
