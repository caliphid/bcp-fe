import useSWR from 'swr';
import { marketplaceSettlementApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useMarketplaceSettlements(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['marketplace-settlements', params] : null,
    () => marketplaceSettlementApi.getMarketplaceSettlements(params),
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

export function useMarketplaceSettlement(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? ['marketplace-settlement-detail', id] : null,
    () => marketplaceSettlementApi.getMarketplaceSettlementById(id as string),
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

export function useMarketplaceCustomerSummary(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? ['marketplace-settlement-customer-summary', id] : null,
    () => marketplaceSettlementApi.getCustomerSummary(id as string),
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
