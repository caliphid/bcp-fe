import useSWR, { useSWRConfig } from 'swr';
import { productApi } from '../api';
import { useAuthStore } from '../../../store/auth-store';

export function useProducts(params?: Record<string, unknown>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/products', params] : null,
    () => productApi.getProducts(params)
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

export function useProductVariants(params?: Record<string, unknown>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/product-variants', params] : null,
    () => productApi.getProductVariants(params)
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

const isListKey = (prefix: string) => (key: unknown) =>
  Array.isArray(key) && key[0] === prefix;

// Product status changes and deletes cascade to variants on the backend,
// so product lists and variant lists must be revalidated together.
export function useRevalidateProductData() {
  const { mutate } = useSWRConfig();

  return async () => {
    await Promise.all([
      mutate(isListKey('/products')),
      mutate(isListKey('/product-variants')),
    ]);
  };
}
