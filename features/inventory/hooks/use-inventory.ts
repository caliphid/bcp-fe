import useSWR from 'swr';
import { inventoryApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useInventoryStock(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/inventory/stock', params] : null,
    () => inventoryApi.getInventoryStock(params),
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

export function useLowStock(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/inventory/low-stock', params] : null,
    () => inventoryApi.getLowStock(params),
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

export function useInventoryMovements(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/inventory/movements', params] : null,
    () => inventoryApi.getInventoryMovements(params),
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
