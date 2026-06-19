import api from "../../lib/axios";
import { buildQueryString } from "../../lib/query";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  DebtInstallmentItem,
  DebtInstallmentDetail,
  DebtInstallmentPaymentItem,
  DebtInstallmentSummaryData,
  UpcomingDebtInstallmentItem,
  GenerateDebtInstallmentSchedulePayload,
  GenerateDebtInstallmentScheduleResponse,
  CreateDebtInstallmentPayload,
  UpdateDebtInstallmentPayload,
  PayDebtInstallmentPayload,
  VoidDebtInstallmentPayload,
  VoidInstallmentPaymentPayload,
} from "../../types/installment";

export const debtInstallmentsApi = {
  generateSchedule: async (debtId: string, data: GenerateDebtInstallmentSchedulePayload) => {
    const res = await api.post<BaseResponse<GenerateDebtInstallmentScheduleResponse>>(
      `/debts/${debtId}/installments/generate`,
      data
    );
    return res.data;
  },

  createInstallment: async (debtId: string, data: CreateDebtInstallmentPayload) => {
    const res = await api.post<BaseResponse<DebtInstallmentItem>>(`/debts/${debtId}/installments`, data);
    return res.data;
  },

  getInstallmentsByDebt: async (debtId: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<DebtInstallmentItem>>(`/debts/${debtId}/installments${query}`);
    return res.data;
  },

  getInstallments: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<DebtInstallmentItem>>(`/debt-installments${query}`);
    return res.data;
  },

  getInstallmentDetail: async (id: string) => {
    const res = await api.get<BaseResponse<DebtInstallmentDetail>>(`/debt-installments/${id}`);
    return res.data;
  },

  updateInstallment: async (id: string, data: UpdateDebtInstallmentPayload) => {
    const res = await api.patch<BaseResponse<DebtInstallmentItem>>(`/debt-installments/${id}`, data);
    return res.data;
  },

  voidInstallment: async (id: string, data: VoidDebtInstallmentPayload) => {
    const res = await api.patch<BaseResponse<DebtInstallmentItem>>(`/debt-installments/${id}/void`, data);
    return res.data;
  },

  createPayment: async (installmentId: string, data: PayDebtInstallmentPayload) => {
    const res = await api.post<BaseResponse<{
      installmentPaymentId: string;
      paymentCode: string;
      installmentId: string;
      debtId: string;
      debtPaymentId: string;
      transactionId: string;
      amount: string;
      installmentRemainingAmount: string;
      installmentStatus: string;
      debtRemainingBalance: string;
    }>>(`/debt-installments/${installmentId}/payments`, data);
    return res.data;
  },

  getPaymentsByInstallment: async (installmentId: string, params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<DebtInstallmentPaymentItem>>(
      `/debt-installments/${installmentId}/payments${query}`
    );
    return res.data;
  },

  getPaymentDetail: async (paymentId: string) => {
    const res = await api.get<BaseResponse<DebtInstallmentPaymentItem>>(`/installment-payments/${paymentId}`);
    return res.data;
  },

  voidPayment: async (paymentId: string, data: VoidInstallmentPaymentPayload) => {
    const res = await api.patch<BaseResponse<{
      installmentPaymentId: string;
      installmentId: string;
      reversedAmount: string;
      installmentRemainingAmount: string;
      installmentStatus: string;
      debtRemainingBalance: string;
    }>>(`/installment-payments/${paymentId}/void`, data);
    return res.data;
  },

  getSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<BaseResponse<DebtInstallmentSummaryData>>(`/debt-installments/summary${query}`);
    return res.data;
  },

  getOverdue: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<UpcomingDebtInstallmentItem>>(`/debt-installments/overdue${query}`);
    return res.data;
  },

  getUpcoming: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params as Record<string, unknown>)}` : "";
    const res = await api.get<ListResponse<UpcomingDebtInstallmentItem>>(`/debt-installments/upcoming${query}`);
    return res.data;
  },
};
