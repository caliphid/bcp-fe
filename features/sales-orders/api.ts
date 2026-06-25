import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import { 
  SalesOrder, 
  CreateSalesOrderRequest, 
  UpdateSalesOrderRequest,
  SalesOrderItem,
  CreateSalesOrderItemRequest,
  UpdateSalesOrderItemRequest,
  CancelSalesOrderRequest,
  SalesOrderPayment,
  CreateSalesOrderPaymentRequest,
  SalesOrderRefund,
  CreateSalesOrderRefundRequest,
  CreateSalesOrderInvoiceRequest,
  SalesOrderReceivable,
  CreateOrUpdateSalesOrderShipmentRequest,
  SalesOrderShipment
} from '../../types/sales-order';

export const salesOrderApi = {
  getSalesOrders: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<ListResponse<SalesOrder>>(`/sales-orders${query}`);
    return res.data;
  },

  getSalesOrderById: async (id: string) => {
    const res = await api.get<BaseResponse<SalesOrder>>(`/sales-orders/${id}`);
    return res.data;
  },

  createSalesOrder: async (data: CreateSalesOrderRequest) => {
    const res = await api.post<BaseResponse<SalesOrder>>('/sales-orders', data);
    return res.data;
  },

  updateSalesOrder: async (id: string, data: UpdateSalesOrderRequest) => {
    const res = await api.patch<BaseResponse<SalesOrder>>(`/sales-orders/${id}`, data);
    return res.data;
  },

  addSalesOrderItem: async (orderId: string, data: CreateSalesOrderItemRequest) => {
    const res = await api.post<BaseResponse<SalesOrderItem>>(`/sales-orders/${orderId}/items`, data);
    return res.data;
  },

  updateSalesOrderItem: async (orderId: string, itemId: string, data: UpdateSalesOrderItemRequest) => {
    const res = await api.patch<BaseResponse<SalesOrderItem>>(`/sales-orders/${orderId}/items/${itemId}`, data);
    return res.data;
  },

  removeSalesOrderItem: async (orderId: string, itemId: string) => {
    const res = await api.delete<BaseResponse<void>>(`/sales-orders/${orderId}/items/${itemId}`);
    return res.data;
  },

  confirmSalesOrder: async (id: string) => {
    const res = await api.post<BaseResponse<SalesOrder>>(`/sales-orders/${id}/confirm`);
    return res.data;
  },

  cancelSalesOrder: async (id: string, data?: CancelSalesOrderRequest) => {
    const res = await api.post<BaseResponse<SalesOrder>>(`/sales-orders/${id}/cancel`, data);
    return res.data;
  },

  fulfillSalesOrder: async (id: string, data?: { notes?: string }) => {
    const res = await api.post<BaseResponse<SalesOrder>>(`/sales-orders/${id}/fulfill`, data);
    return res.data;
  },

  getSalesOrderPayments: async (id: string) => {
    const res = await api.get<BaseResponse<SalesOrderPayment[]>>(`/sales-orders/${id}/payments`);
    return res.data;
  },

  createSalesOrderPayment: async (id: string, data: CreateSalesOrderPaymentRequest) => {
    const res = await api.post<BaseResponse<SalesOrderPayment>>(`/sales-orders/${id}/payments`, data);
    return res.data;
  },

  voidSalesOrderPayment: async (paymentId: string, voidReason: string) => {
    const res = await api.patch<BaseResponse<SalesOrderPayment>>(`/sales-order-payments/${paymentId}/void`, { voidReason });
    return res.data;
  },

  // --- Refunds ---
  getSalesOrderRefunds: async (id: string) => {
    const res = await api.get<BaseResponse<SalesOrderRefund[]>>(`/sales-orders/${id}/refunds`);
    return res.data;
  },

  createSalesOrderRefund: async (id: string, data: CreateSalesOrderRefundRequest) => {
    const res = await api.post<BaseResponse<SalesOrderRefund>>(`/sales-orders/${id}/refunds`, data);
    return res.data;
  },

  voidSalesOrderRefund: async (refundId: string, voidReason: string) => {
    const res = await api.patch<BaseResponse<SalesOrderRefund>>(`/sales-order-refunds/${refundId}/void`, { voidReason });
    return res.data;
  },

  // --- Invoice (Receivable Split) ---
  createSalesOrderInvoice: async (id: string, data: CreateSalesOrderInvoiceRequest) => {
    const res = await api.post<BaseResponse<SalesOrderReceivable>>(`/sales-orders/${id}/invoice`, data);
    return res.data;
  },

  // --- Shipment ---
  getSalesOrderShipment: async (id: string) => {
    const res = await api.get<BaseResponse<SalesOrderShipment>>(`/sales-orders/${id}/shipment`);
    return res.data;
  },

  createOrUpdateSalesOrderShipment: async (id: string, data: CreateOrUpdateSalesOrderShipmentRequest) => {
    const res = await api.post<BaseResponse<SalesOrderShipment>>(`/sales-orders/${id}/shipment`, data);
    return res.data;
  },

  packSalesOrderShipment: async (id: string) => {
    const res = await api.post<BaseResponse<SalesOrderShipment>>(`/sales-orders/${id}/shipment/pack`);
    return res.data;
  },

  shipSalesOrderShipment: async (id: string) => {
    const res = await api.post<BaseResponse<SalesOrderShipment>>(`/sales-orders/${id}/shipment/ship`);
    return res.data;
  },

  deliverSalesOrderShipment: async (id: string) => {
    const res = await api.post<BaseResponse<SalesOrderShipment>>(`/sales-orders/${id}/shipment/deliver`);
    return res.data;
  }
};
