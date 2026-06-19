import { useState, useCallback, useEffect } from "react";
import { debtInstallmentsApi } from "../api";
import { useInstallmentStore } from "../store/installment-store";
import { useAuthStore } from "../../../store/auth-store";
import { DebtInstallmentPaymentItem } from "../../../types/installment";
import { PaginationMeta } from "../../../types/common";

export function useInstallmentPayments(installmentId: string | null) {
  const filters = useInstallmentStore((s) => s.paymentFilters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<DebtInstallmentPaymentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!installmentId) {
      setData([]);
      setMeta(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      params.limit = 10;

      if (user?.role === "STAFF_INPUT") {
        if (params.status === "VOID") {
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await debtInstallmentsApi.getPaymentsByInstallment(installmentId, params);
      
      let finalData = res.data;
      if (user?.role === "STAFF_INPUT") {
        finalData = finalData.filter(d => d.status === "POSTED");
      }

      setData(finalData);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch payments"));
    } finally {
      setLoading(false);
    }
  }, [installmentId, filters, user]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchPayments();
    });
    return () => { ignore = true; };
  }, [fetchPayments]);

  return { data, meta, loading, error, refetch: fetchPayments };
}
