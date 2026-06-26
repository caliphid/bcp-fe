import useSWR from 'swr';
import { stockOpnameApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useStockOpnames(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/stock-opnames', params] : null,
    () => stockOpnameApi.getSessions(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useStockOpname(id?: string) {
  const { token } = useAuthStore.getState();

  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/stock-opnames/${id}` : null,
    () => stockOpnameApi.getSessionById(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useStockOpnameVarianceReport(id?: string) {
  const { token } = useAuthStore.getState();

  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/stock-opnames/${id}/variance-report` : null,
    () => stockOpnameApi.getVarianceReport(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useStockOpnameReconciliationReport(id?: string) {
  const { token } = useAuthStore.getState();

  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/stock-opnames/${id}/reconciliation-report` : null,
    () => stockOpnameApi.getReconciliationReport(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}
