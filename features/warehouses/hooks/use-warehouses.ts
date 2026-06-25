import useSWR from 'swr';
import { warehouseApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useWarehouses(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/warehouses', params] : null,
    () => warehouseApi.getWarehouses(params),
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

export function useWarehouse(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/warehouses/${id}` : null,
    () => warehouseApi.getWarehouseById(id as string),
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
