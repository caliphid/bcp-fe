import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { Crew } from '../../types/crew';
import { buildQueryString } from '../../lib/query';

export const crewApi = {
  getCrew: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<Crew>>(`/crew${query}`);
    return res.data;
  },
  getCrewById: async (id: string) => {
    const res = await api.get<BaseResponse<Crew>>(`/crew/${id}`);
    return res.data;
  },
  createCrew: async (data: any) => {
    const res = await api.post<BaseResponse<Crew>>('/crew', data);
    return res.data;
  },
  updateCrew: async (id: string, data: any) => {
    const res = await api.patch<BaseResponse<Crew>>(`/crew/${id}`, data);
    return res.data;
  },
  activateCrew: async (id: string) => {
    const res = await api.patch<BaseResponse<Crew>>(`/crew/${id}/activate`);
    return res.data;
  },
  deactivateCrew: async (id: string) => {
    const res = await api.patch<BaseResponse<Crew>>(`/crew/${id}/deactivate`);
    return res.data;
  },
};
