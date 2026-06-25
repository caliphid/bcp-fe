import useSWR from 'swr';
import { productApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useProducts(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/products', params] : null,
    () => productApi.getProducts(params),
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

export function useProduct(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/products/${id}` : null,
    () => productApi.getProductById(id as string),
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

export function useProductVariants(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/product-variants', params] : null,
    () => productApi.getProductVariants(params),
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

export function useProductVariant(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/product-variants/${id}` : null,
    () => productApi.getProductVariantById(id as string),
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
