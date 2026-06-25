import api from "../../lib/axios";
import { BaseResponse, ListResponse } from "../../types/common";
import {
  Vendor,
  PurchaseOrder,
  GoodsReceipt,
  VendorPayment,
  CreateVendorRequest,
  UpdateVendorRequest,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  CreateGoodsReceiptRequest,
  UpdateGoodsReceiptRequest,
  CreateVendorPaymentRequest,
  MonthlyPurchaseReport,
  VendorPurchaseReport,
  ProductPurchaseReport,
  OutstandingReceiptReport,
  OutstandingPaymentReport,
  GoodsReceiptReport,
} from "./types";

export const purchasingApi = {
  // === VENDOR ===
  getVendors: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<Vendor>>("/vendors", { params });
    return res.data;
  },

  getVendorById: async (id: string) => {
    const res = await api.get<BaseResponse<Vendor>>(`/vendors/${id}`);
    return res.data;
  },

  createVendor: async (data: CreateVendorRequest) => {
    const res = await api.post<BaseResponse<Vendor>>("/vendors", data);
    return res.data;
  },

  updateVendor: async (id: string, data: UpdateVendorRequest) => {
    const res = await api.patch<BaseResponse<Vendor>>(`/vendors/${id}`, data);
    return res.data;
  },

  activateVendor: async (id: string) => {
    const res = await api.patch<BaseResponse<Vendor>>(`/vendors/${id}/activate`);
    return res.data;
  },

  deactivateVendor: async (id: string) => {
    const res = await api.patch<BaseResponse<Vendor>>(`/vendors/${id}/deactivate`);
    return res.data;
  },

  // === PURCHASE ORDER ===
  getPurchaseOrders: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<PurchaseOrder>>("/purchase-orders", { params });
    return res.data;
  },

  getPurchaseOrderById: async (id: string) => {
    const res = await api.get<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return res.data;
  },

  createPurchaseOrder: async (data: CreatePurchaseOrderRequest) => {
    const res = await api.post<BaseResponse<PurchaseOrder>>("/purchase-orders", data);
    return res.data;
  },

  updatePurchaseOrder: async (id: string, data: UpdatePurchaseOrderRequest) => {
    const res = await api.patch<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}`, data);
    return res.data;
  },

  submitPurchaseOrder: async (id: string) => {
    const res = await api.patch<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}/submit`);
    return res.data;
  },

  approvePurchaseOrder: async (id: string) => {
    const res = await api.patch<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}/approve`);
    return res.data;
  },

  cancelPurchaseOrder: async (id: string, reason: string) => {
    const res = await api.patch<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}/cancel`, { reason });
    return res.data;
  },

  closePurchaseOrder: async (id: string) => {
    const res = await api.patch<BaseResponse<PurchaseOrder>>(`/purchase-orders/${id}/close`);
    return res.data;
  },

  // === GOODS RECEIPT ===
  getGoodsReceipts: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<GoodsReceipt>>("/goods-receipts", { params });
    return res.data;
  },

  getGoodsReceiptById: async (id: string) => {
    const res = await api.get<BaseResponse<GoodsReceipt>>(`/goods-receipts/${id}`);
    return res.data;
  },

  createGoodsReceipt: async (data: CreateGoodsReceiptRequest) => {
    const res = await api.post<BaseResponse<GoodsReceipt>>("/goods-receipts", data);
    return res.data;
  },

  updateGoodsReceipt: async (id: string, data: UpdateGoodsReceiptRequest) => {
    const res = await api.patch<BaseResponse<GoodsReceipt>>(`/goods-receipts/${id}`, data);
    return res.data;
  },

  postGoodsReceipt: async (id: string) => {
    const res = await api.patch<BaseResponse<GoodsReceipt>>(`/goods-receipts/${id}/post`);
    return res.data;
  },

  voidGoodsReceipt: async (id: string, reason: string) => {
    const res = await api.patch<BaseResponse<GoodsReceipt>>(`/goods-receipts/${id}/void`, { reason });
    return res.data;
  },

  // === VENDOR PAYMENT ===
  createVendorPayment: async (purchaseOrderId: string, data: CreateVendorPaymentRequest) => {
    const res = await api.post<BaseResponse<VendorPayment>>(`/purchase-orders/${purchaseOrderId}/payments`, data);
    return res.data;
  },

  getVendorPayments: async (params?: Record<string, any>) => {
    const res = await api.get<ListResponse<VendorPayment>>("/vendor-payments", { params });
    return res.data;
  },

  getVendorPaymentById: async (id: string) => {
    const res = await api.get<BaseResponse<VendorPayment>>(`/vendor-payments/${id}`);
    return res.data;
  },

  voidVendorPayment: async (id: string, reason: string) => {
    const res = await api.patch<BaseResponse<VendorPayment>>(`/vendor-payments/${id}/void`, { reason });
    return res.data;
  },

  // === REPORTS ===
  getMonthlyPurchaseReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<MonthlyPurchaseReport[]>>("/purchase-reports/monthly", { params });
    return res.data;
  },

  getPurchaseByVendorReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<VendorPurchaseReport[]>>("/purchase-reports/by-vendor", { params });
    return res.data;
  },

  getPurchaseByProductReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<ProductPurchaseReport[]>>("/purchase-reports/by-product", { params });
    return res.data;
  },

  getOutstandingReceiptsReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<OutstandingReceiptReport[]>>("/purchase-reports/outstanding-receipts", { params });
    return res.data;
  },

  getOutstandingPaymentsReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<OutstandingPaymentReport[]>>("/purchase-reports/outstanding-payments", { params });
    return res.data;
  },

  getGoodsReceiptsReport: async (params?: Record<string, any>) => {
    const res = await api.get<BaseResponse<GoodsReceiptReport[]>>("/purchase-reports/goods-receipts", { params });
    return res.data;
  }
};
