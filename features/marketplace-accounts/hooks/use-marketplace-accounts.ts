import useSWR from 'swr';
import { marketplaceAccountApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useMarketplaceAccounts(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['marketplace-accounts', params] : null,
    () => marketplaceAccountApi.getMarketplaceAccounts(params),
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

export function useMarketplaceAccount(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? ['marketplace-account-detail', id] : null,
    () => marketplaceAccountApi.getMarketplaceAccountById(id as string),
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
