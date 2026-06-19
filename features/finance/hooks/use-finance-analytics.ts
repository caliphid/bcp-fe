import useSWR from 'swr';
import { financeApi } from '../api';
import { MonthlyOverviewQuery } from '../../../types/finance';

export function useMonthlyOverview(query: MonthlyOverviewQuery) {
  const { data, error, isLoading, mutate } = useSWR(
    query.month && query.year ? ['/finance/monthly-overview', query] : null,
    () => financeApi.getMonthlyOverview(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useMonthlyProfit(query: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    query.month && query.year ? ['/finance/monthly-profit', query] : null,
    () => financeApi.getMonthlyProfit(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useMonthlyCashPosition(query: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    query.month && query.year ? ['/finance/monthly-cash-position', query] : null,
    () => financeApi.getMonthlyCashPosition(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useProfitVsCashflow(query: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    query.month && query.year ? ['/finance/profit-vs-cashflow', query] : null,
    () => financeApi.getProfitVsCashflow(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}


export function useBalanceReconciliation(query?: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/finance/balance-reconciliation", query],
    () => financeApi.getBalanceReconciliation(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}


export function useAccountLedger(query: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    query.accountId ? ["/finance/account-ledger", query] : null,
    () => financeApi.getAccountLedger(query)
  );

  return {
    data: data, // Note: the api method already returns AccountLedgerResponse with meta
    isLoading,
    error,
    mutate
  };
}


export function useAccountTransfers(query?: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/account-transfers", query],
    () => financeApi.getAccountTransfers(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useAccountTransferDetail(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["/account-transfers", id] : null,
    () => financeApi.getAccountTransferById(id)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}


export function useFinancialPeriods(query?: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/financial-periods", query],
    () => financeApi.getFinancialPeriods(query)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}
