import api from '../../lib/axios';
import { buildQueryString } from '../../lib/query';
import {
  OrderDashboardOverviewResponse,
  OrderDashboardMonthlyReportResponse,
  OrderDashboardDailyTrendResponse,
  OrderDashboardStatusPipelineResponse,
  OrderDashboardReconciliationResponse,
  OrderDashboardSalesByChannelResponse,
  OrderDashboardSalesByMarketplaceResponse,
  OrderDashboardSalesByProductResponse,
  OrderDashboardSalesByProductVariantResponse,
  OrderDashboardSalesByCategoryResponse,
  OrderDashboardSalesByCustomerResponse,
  OrderDashboardUnlinkedOrdersResponse
} from '../../types/order-dashboard';

export const orderDashboardApi = {
  getOverview: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardOverviewResponse>(`/order-dashboard/overview${query}`);
    return res.data;
  },

  getMonthlyReport: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardMonthlyReportResponse>(`/order-dashboard/monthly-report${query}`);
    return res.data;
  },

  getDailyTrend: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardDailyTrendResponse>(`/order-dashboard/daily-trend${query}`);
    return res.data;
  },

  getStatusPipeline: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardStatusPipelineResponse>(`/order-dashboard/status-pipeline${query}`);
    return res.data;
  },

  getReconciliation: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardReconciliationResponse>(`/order-dashboard/reconciliation${query}`);
    return res.data;
  },

  getSalesByChannel: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByChannelResponse>(`/order-dashboard/sales-by-channel${query}`);
    return res.data;
  },

  getSalesByMarketplace: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByMarketplaceResponse>(`/order-dashboard/sales-by-marketplace${query}`);
    return res.data;
  },

  getSalesByProduct: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByProductResponse>(`/order-dashboard/sales-by-product${query}`);
    return res.data;
  },

  getSalesByProductVariant: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByProductVariantResponse>(`/order-dashboard/sales-by-product-variant${query}`);
    return res.data;
  },

  getSalesByCategory: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByCategoryResponse>(`/order-dashboard/sales-by-category${query}`);
    return res.data;
  },

  getSalesByCustomer: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardSalesByCustomerResponse>(`/order-dashboard/sales-by-customer${query}`);
    return res.data;
  },

  getUnlinkedOrders: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<OrderDashboardUnlinkedOrdersResponse>(`/order-dashboard/unlinked-orders${query}`);
    return res.data;
  }
};
