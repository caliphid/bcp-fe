import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { BusinessUnit } from '../../types/business-unit';
import { buildQueryString } from '../../lib/query';

export const businessUnitsApi = {
  getBusinessUnits: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<BusinessUnit>>(`/business-units${query}`);
    return res.data;
  },
  getBusinessUnitById: async (id: string) => {
    const res = await api.get<BaseResponse<BusinessUnit>>(`/business-units/${id}`);
    return res.data;
  },
  createBusinessUnit: async (data: any) => {
    const res = await api.post<BaseResponse<BusinessUnit>>('/business-units', data);
    return res.data;
  },
  updateBusinessUnit: async (id: string, data: any) => {
    const res = await api.patch<BaseResponse<BusinessUnit>>(`/business-units/${id}`, data);
    return res.data;
  },
  activateBusinessUnit: async (id: string) => {
    const res = await api.patch<BaseResponse<BusinessUnit>>(`/business-units/${id}/activate`);
    return res.data;
  },
  deactivateBusinessUnit: async (id: string) => {
    const res = await api.patch<BaseResponse<BusinessUnit>>(`/business-units/${id}/deactivate`);
    return res.data;
  },
};
