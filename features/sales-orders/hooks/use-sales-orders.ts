import useSWR from 'swr';
import { salesOrderApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useSalesOrders(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/sales-orders', params] : null,
    () => salesOrderApi.getSalesOrders(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate
  };
}

export function useSalesOrder(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/sales-orders/${id}` : null,
    () => salesOrderApi.getSalesOrderById(id as string),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useSalesOrderPayments(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/sales-orders/${id}/payments` : null,
    () => salesOrderApi.getSalesOrderPayments(id as string),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}
