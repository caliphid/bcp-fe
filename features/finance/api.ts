import api from '../../lib/axios';
import { BaseResponse, ListResponse } from '../../types/common';
import { buildQueryString } from '../../lib/query';
import {
  MonthlyOverviewQuery,
  MonthlyOverviewResponse,
  MonthlyProfitResponse,
  MonthlyCashPositionResponse,
  ProfitVsCashflowResponse,
  AccountLedgerResponse,
  BalanceReconciliationResponse,
  AccountTransferResponse,
  CreateAccountTransferRequest,
  VoidAccountTransferRequest,
  FinancialPeriodResponse,
  CreateFinancialPeriodRequest,
  LockFinancialPeriodRequest,
  CloseFinancialPeriodRequest,
  ReopenFinancialPeriodRequest
} from '../../types/finance';

export const financeApi = {
  // 1. Monthly Overview
  getMonthlyOverview: async (params: MonthlyOverviewQuery) => {
    const query = buildQueryString(params);
    const res = await api.get<BaseResponse<MonthlyOverviewResponse>>(`/finance/monthly-overview?${query}`);
    return res.data;
  },

  // 2. Monthly Profit
  getMonthlyProfit: async (params: Record<string, any>) => {
    const query = buildQueryString(params);
    const res = await api.get<BaseResponse<MonthlyProfitResponse>>(`/finance/monthly-profit?${query}`);
    return res.data;
  },

  // 3. Monthly Cash Position
  getMonthlyCashPosition: async (params: Record<string, any>) => {
    const query = buildQueryString(params);
    const res = await api.get<BaseResponse<MonthlyCashPositionResponse>>(`/finance/monthly-cash-position?${query}`);
    return res.data;
  },

  // 4. Profit vs Cashflow
  getProfitVsCashflow: async (params: Record<string, any>) => {
    const query = buildQueryString(params);
    const res = await api.get<BaseResponse<ProfitVsCashflowResponse>>(`/finance/profit-vs-cashflow?${query}`);
    return res.data;
  },

  // 5. Account Ledger
  getAccountLedger: async (params: Record<string, any>) => {
    const query = buildQueryString(params);
    // Note: Use 'any' type cast for response because AccountLedgerResponse doesn't match standard BaseResponse generic strictly if meta is at the root
    const res = await api.get<any>(`/finance/account-ledger?${query}`);
    return res.data as AccountLedgerResponse & { meta: { page: number, limit: number, total: number, totalPages: number } };
  },

  // 6 & 7. Balance Reconciliation
  getBalanceReconciliation: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<BalanceReconciliationResponse[]>>(`/finance/balance-reconciliation${query}`);
    return res.data;
  },

  getBalanceReconciliationDetail: async (accountId: string) => {
    const res = await api.get<BaseResponse<BalanceReconciliationResponse>>(`/finance/balance-reconciliation/${accountId}`);
    return res.data;
  },

  // 8. Account Transfers
  getAccountTransfers: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<AccountTransferResponse[]>>(`/account-transfers${query}`);
    return res.data;
  },

  getAccountTransferById: async (id: string) => {
    const res = await api.get<BaseResponse<AccountTransferResponse>>(`/account-transfers/${id}`);
    return res.data;
  },

  createAccountTransfer: async (data: CreateAccountTransferRequest) => {
    const res = await api.post<BaseResponse<AccountTransferResponse>>('/account-transfers', data);
    return res.data;
  },

  voidAccountTransfer: async (id: string, data: VoidAccountTransferRequest) => {
    const res = await api.patch<BaseResponse<AccountTransferResponse>>(`/account-transfers/${id}/void`, data);
    return res.data;
  },

  // 12. Financial Periods
  getFinancialPeriods: async (params?: Record<string, any>) => {
    const query = params ? `?${buildQueryString(params)}` : '';
    const res = await api.get<BaseResponse<FinancialPeriodResponse[]>>(`/financial-periods${query}`);
    return res.data;
  },

  getFinancialPeriodById: async (id: string) => {
    const res = await api.get<BaseResponse<FinancialPeriodResponse>>(`/financial-periods/${id}`);
    return res.data;
  },

  createFinancialPeriod: async (data: CreateFinancialPeriodRequest) => {
    const res = await api.post<BaseResponse<FinancialPeriodResponse>>('/financial-periods', data);
    return res.data;
  },

  lockFinancialPeriod: async (id: string, data: LockFinancialPeriodRequest) => {
    const res = await api.patch<BaseResponse<FinancialPeriodResponse>>(`/financial-periods/${id}/lock`, data);
    return res.data;
  },

  closeFinancialPeriod: async (id: string, data: CloseFinancialPeriodRequest) => {
    const res = await api.patch<BaseResponse<FinancialPeriodResponse>>(`/financial-periods/${id}/close`, data);
    return res.data;
  },

  reopenFinancialPeriod: async (id: string, data: ReopenFinancialPeriodRequest) => {
    const res = await api.patch<BaseResponse<FinancialPeriodResponse>>(`/financial-periods/${id}/reopen`, data);
    return res.data;
  }
};
