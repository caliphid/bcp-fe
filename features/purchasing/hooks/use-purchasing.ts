import useSWR from "swr";
import { purchasingApi } from "../api";
import { useAuthStore } from "../../../store/auth-store";

// === VENDOR ===
export function useVendors(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/vendors", params] : null,
    () => purchasingApi.getVendors(params),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate
  };
}

export function useVendor(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/vendors/${id}` : null,
    () => purchasingApi.getVendorById(id as string),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

// === PURCHASE ORDER ===
export function usePurchaseOrders(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/purchase-orders", params] : null,
    () => purchasingApi.getPurchaseOrders(params),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate
  };
}

export function usePurchaseOrder(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/purchase-orders/${id}` : null,
    () => purchasingApi.getPurchaseOrderById(id as string),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

// === GOODS RECEIPT ===
export function useGoodsReceipts(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/goods-receipts", params] : null,
    () => purchasingApi.getGoodsReceipts(params),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate
  };
}

export function useGoodsReceipt(id?: string) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/goods-receipts/${id}` : null,
    () => purchasingApi.getGoodsReceiptById(id as string),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
}

// === VENDOR PAYMENT ===
export function useVendorPayments(params?: Record<string, any>) {
  const { token } = useAuthStore.getState();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/vendor-payments", params] : null,
    () => purchasingApi.getVendorPayments(params),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error,
    mutate
  };
}

// === REPORTS ===
// We can define individual hooks for reports if needed
