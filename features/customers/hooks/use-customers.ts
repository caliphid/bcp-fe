import useSWR from 'swr';
import { customerApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useCustomers(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/customers', params] : null,
    () => customerApi.getCustomers(params),
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

export function useCustomer(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/customers/${id}` : null,
    () => customerApi.getCustomerById(id as string),
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

export function useCustomerDuplicates(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/customers/duplicates', params] : null,
    () => customerApi.getCustomerDuplicates(params),
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

// A generic hook for backfill preview since we usually want to trigger it manually,
// but we might want to fetch it initially if the page loads. 
// We'll leave it out of SWR if it's meant to be triggered by a button, or use useSWR with trigger.
// Actually, SWR mutation might be better here:
export function useCustomerBackfillPreview(dryRun: boolean = true, limit: number = 100) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/customers/backfill-sales-orders', dryRun, limit] : null,
    () => customerApi.backfillSalesOrders({ dryRun, limit }),
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
