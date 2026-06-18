import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  DebtItem,
  DebtDetail,
  DebtPaymentItem,
  DebtSummaryData,
  DebtByLenderItem,
  DebtByBusinessUnitItem,
  CreateDebtPayload,
  UpdateDebtPayload,
  CreateDebtPaymentPayload,
  VoidDebtPaymentPayload,
} from "../../types/debt";

export const debtsApi = {
  getDebts: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<DebtItem>>(`/debts${query}`);
    return res.data;
  },

  getDebtDetail: async (id: string) => {
    const res = await api.get<BaseResponse<DebtDetail>>(`/debts/${id}`);
    return res.data;
  },

  createDebt: async (data: CreateDebtPayload) => {
    const res = await api.post<BaseResponse<{ id: string }>>("/debts", data);
    return res.data;
  },

  updateDebt: async (id: string, data: UpdateDebtPayload) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/debts/${id}`, data);
    return res.data;
  },

  activateDebt: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/debts/${id}/activate`);
    return res.data;
  },

  deactivateDebt: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/debts/${id}/deactivate`);
    return res.data;
  },

  closeDebt: async (id: string) => {
    const res = await api.patch<BaseResponse<{ id: string }>>(`/debts/${id}/close`);
    return res.data;
  },

  getDebtPayments: async (id: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<DebtPaymentItem>>(`/debts/${id}/payments${query}`);
    return res.data;
  },

  getDebtPaymentDetail: async (paymentId: string) => {
    const res = await api.get<BaseResponse<DebtPaymentItem>>(`/debt-payments/${paymentId}`);
    return res.data;
  },

  createDebtPayment: async (id: string, data: CreateDebtPaymentPayload) => {
    const res = await api.post<BaseResponse<{ paymentId: string }>>(`/debts/${id}/payments`, data);
    return res.data;
  },

  voidDebtPayment: async (paymentId: string, data: VoidDebtPaymentPayload) => {
    const res = await api.patch<BaseResponse<{ paymentId: string }>>(`/debt-payments/${paymentId}/void`, data);
    return res.data;
  },

  getSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<DebtSummaryData>>(`/debts/summary${query}`);
    return res.data;
  },

  getByLender: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<DebtByLenderItem[]>>(`/debts/by-lender${query}`);
    return res.data;
  },

  getByBusinessUnit: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<DebtByBusinessUnitItem[]>>(`/debts/by-business-unit${query}`);
    return res.data;
  },
};
