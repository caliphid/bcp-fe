import api from "../../lib/axios";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  CustomerReturn,
  CustomerRefund,
  CreateCustomerReturnRequest,
  UpdateCustomerReturnRequest,
  ApproveReturnRequest,
  ReceiveReturnRequest,
  InspectReturnRequest,
  ReserveExchangeRequest,
  ShipExchangeRequest,
  CreateRefundRequest,
  MonthlyReturnReport,
  ByReasonReturnReport,
  ByProductReturnReport,
  RefundsReport,
  FailedDeliveryReport,
} from "./types";

export const customerReturnsApi = {
  // === CUSTOMER RETURNS ===
  getCustomerReturns: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<CustomerReturn>>("/customer-returns", { params });
    return res.data;
  },

  getCustomerReturnById: async (id: string) => {
    const res = await api.get<BaseResponse<CustomerReturn>>(`/customer-returns/${id}`);
    return res.data;
  },

  createCustomerReturn: async (data: CreateCustomerReturnRequest) => {
    const res = await api.post<BaseResponse<CustomerReturn>>("/customer-returns", data);
    return res.data;
  },

  updateCustomerReturn: async (id: string, data: UpdateCustomerReturnRequest) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}`, data);
    return res.data;
  },

  approveReturn: async (id: string, data: ApproveReturnRequest) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/approve`, data);
    return res.data;
  },

  rejectReturn: async (id: string, reason: string, notes?: string) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/reject`, { reason, notes });
    return res.data;
  },

  receiveReturn: async (id: string, data: ReceiveReturnRequest) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/receive`, data);
    return res.data;
  },

  inspectReturn: async (id: string, data: InspectReturnRequest) => {
    // Response of inspect contains eligibleRefund, which maps to BaseResponse
    const res = await api.patch<BaseResponse<CustomerReturn & { eligibleRefund?: string }>>(`/customer-returns/${id}/inspect`, data);
    return res.data;
  },

  reserveExchange: async (id: string, data: ReserveExchangeRequest) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/reserve-exchange`, data);
    return res.data;
  },

  shipExchange: async (id: string, data: ShipExchangeRequest) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/ship-exchange`, data);
    return res.data;
  },

  completeReturn: async (id: string) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/complete`);
    return res.data;
  },

  cancelReturn: async (id: string) => {
    const res = await api.patch<BaseResponse<CustomerReturn>>(`/customer-returns/${id}/cancel`);
    return res.data;
  },

  // === REFUNDS ===
  getReturnRefunds: async (id: string) => {
    const res = await api.get<BaseResponse<CustomerRefund[]>>(`/customer-returns/${id}/refunds`);
    return res.data;
  },

  createRefund: async (id: string, data: CreateRefundRequest) => {
    const res = await api.post<BaseResponse<CustomerRefund>>(`/customer-returns/${id}/refunds`, data);
    return res.data;
  },

  getRefundById: async (id: string) => {
    const res = await api.get<BaseResponse<CustomerRefund>>(`/customer-refunds/${id}`);
    return res.data;
  },

  postRefund: async (id: string, categoryId?: string) => {
    const res = await api.patch<BaseResponse<CustomerRefund>>(`/customer-refunds/${id}/post`, { categoryId });
    return res.data;
  },

  voidRefund: async (id: string, reason: string) => {
    const res = await api.patch<BaseResponse<CustomerRefund>>(`/customer-refunds/${id}/void`, { reason });
    return res.data;
  },

  // === REPORTS ===
  getMonthlyReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<MonthlyReturnReport[]>>("/customer-return-reports/monthly", { params });
    return res.data;
  },

  getByReasonReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<ByReasonReturnReport[]>>("/customer-return-reports/by-reason", { params });
    return res.data;
  },

  getByProductReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<ByProductReturnReport[]>>("/customer-return-reports/by-product", { params });
    return res.data;
  },

  getRefundsReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<RefundsReport>>("/customer-return-reports/refunds", { params });
    return res.data;
  },

  getFailedDeliveryReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<FailedDeliveryReport>>("/customer-return-reports/failed-delivery", { params });
    return res.data;
  },
};
