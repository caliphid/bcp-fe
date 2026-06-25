import useSWR from "swr";
import { customerReturnsApi } from "../api";
import { useAuthStore } from "../../../store/auth-store";

export function useCustomerReturns(params?: Record<string, any>) {
  const token = useAuthStore((state) => state.token);
  const queryParams = new URLSearchParams(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== "") as [string, string][]
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    token ? [`/customer-returns`, queryParams] : null,
    () => customerReturnsApi.getCustomerReturns(params)
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export function useCustomerReturn(id: string) {
  const token = useAuthStore((state) => state.token);

  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/customer-returns/${id}` : null,
    () => customerReturnsApi.getCustomerReturnById(id)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useReturnRefunds(customerReturnId: string) {
  const token = useAuthStore((state) => state.token);

  const { data, error, isLoading, mutate } = useSWR(
    token && customerReturnId ? `/customer-returns/${customerReturnId}/refunds` : null,
    () => customerReturnsApi.getReturnRefunds(customerReturnId)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useCustomerRefund(id: string) {
  const token = useAuthStore((state) => state.token);

  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `/customer-refunds/${id}` : null,
    () => customerReturnsApi.getRefundById(id)
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}
