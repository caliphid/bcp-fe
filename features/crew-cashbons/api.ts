import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  CrewCashbonItem,
  CrewCashbonDetail,
  CashbonRepaymentItem,
  CashbonSummaryData,
  CashbonByCrewItem,
  CreateCrewCashbonPayload,
  UpdateCrewCashbonPayload,
  CreateCashbonRepaymentPayload,
  VoidCashbonPayload,
  VoidCashbonRepaymentPayload,
} from "../../types/crew-cashbon";

export const crewCashbonsApi = {
  getCrewCashbons: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<CrewCashbonItem>>(`/crew-cashbons${query}`);
    return res.data;
  },

  getCrewCashbonDetail: async (id: string) => {
    const res = await api.get<BaseResponse<CrewCashbonDetail>>(`/crew-cashbons/${id}`);
    return res.data;
  },

  createCrewCashbon: async (data: CreateCrewCashbonPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/crew-cashbons", data);
    return res.data;
  },

  updateCrewCashbon: async (id: string, data: UpdateCrewCashbonPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/crew-cashbons/${id}`, data);
    return res.data;
  },

  voidCrewCashbon: async (id: string, data: VoidCashbonPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/crew-cashbons/${id}/void`, data);
    return res.data;
  },

  closeCrewCashbon: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/crew-cashbons/${id}/close`);
    return res.data;
  },

  activateCrewCashbon: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/crew-cashbons/${id}/activate`);
    return res.data;
  },

  deactivateCrewCashbon: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/crew-cashbons/${id}/deactivate`);
    return res.data;
  },

  getCashbonRepayments: async (id: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<CashbonRepaymentItem>>(`/crew-cashbons/${id}/repayments${query}`);
    return res.data;
  },

  createCashbonRepayment: async (id: string, data: CreateCashbonRepaymentPayload) => {
    const res = await api.post<BaseResponse<{ paymentId: string }>>(`/crew-cashbons/${id}/repayments`, data);
    return res.data;
  },

  getRepaymentDetail: async (repaymentId: string) => {
    const res = await api.get<BaseResponse<CashbonRepaymentItem>>(`/cashbon-repayments/${repaymentId}`);
    return res.data;
  },

  voidCashbonRepayment: async (repaymentId: string, data: VoidCashbonRepaymentPayload) => {
    const res = await api.patch<BaseResponse<{ paymentId: string }>>(`/cashbon-repayments/${repaymentId}/void`, data);
    return res.data;
  },

  getSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<CashbonSummaryData>>(`/crew-cashbons/summary${query}`);
    return res.data;
  },

  getByCrew: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<CashbonByCrewItem[]>>(`/crew-cashbons/by-crew${query}`);
    return res.data;
  },

  getOutstanding: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<CrewCashbonItem>>(`/crew-cashbons/outstanding${query}`);
    return res.data;
  },

  getOverdue: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<CrewCashbonItem>>(`/crew-cashbons/overdue${query}`);
    return res.data;
  },
};
