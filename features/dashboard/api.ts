import api from '../../lib/axios';
import { buildQueryString } from '../../lib/query';
import {
  DashboardOverviewResponse,
  CashflowSummaryResponse,
  MonthlyTrendResponse,
  DailyTrendResponse,
  CategoryBreakdownResponse,
  TopExpensesResponse,
  TopIncomeSourcesResponse,
  AccountBalanceOverviewResponse,
  BusinessUnitPerformanceResponse,
  MonthComparisonResponse,
  YearlySummaryResponse,
  RecentTransactionsResponse,
  FinanceHealthResponse
} from '../../types/dashboard';

export const dashboardApi = {
  getOverview: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<DashboardOverviewResponse>(`/dashboard/overview${query}`);
    return res.data;
  },
  
  getCashflowSummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<CashflowSummaryResponse>(`/dashboard/cashflow-summary${query}`);
    return res.data;
  },

  getMonthlyTrend: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<MonthlyTrendResponse>(`/dashboard/monthly-trend${query}`);
    return res.data;
  },

  getDailyTrend: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<DailyTrendResponse>(`/dashboard/daily-trend${query}`);
    return res.data;
  },

  getCategoryBreakdown: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<CategoryBreakdownResponse>(`/dashboard/category-breakdown${query}`);
    return res.data;
  },

  getTopExpenses: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<TopExpensesResponse>(`/dashboard/top-expenses${query}`);
    return res.data;
  },

  getTopIncomeSources: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<TopIncomeSourcesResponse>(`/dashboard/top-income-sources${query}`);
    return res.data;
  },

  getAccountBalances: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<AccountBalanceOverviewResponse>(`/dashboard/account-balances${query}`);
    return res.data;
  },

  getBusinessUnitPerformance: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BusinessUnitPerformanceResponse>(`/dashboard/business-unit-performance${query}`);
    return res.data;
  },

  getMonthComparison: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<MonthComparisonResponse>(`/dashboard/month-comparison${query}`);
    return res.data;
  },

  getYearlySummary: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<YearlySummaryResponse>(`/dashboard/yearly-summary${query}`);
    return res.data;
  },

  getRecentTransactions: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<RecentTransactionsResponse>(`/dashboard/recent-transactions${query}`);
    return res.data;
  },

  getFinanceHealth: async (params?: Record<string, unknown>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<FinanceHealthResponse>(`/dashboard/finance-health${query}`);
    return res.data;
  }
};
