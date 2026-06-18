import { useState, useCallback, useEffect } from "react";
import { debtsApi } from "../api";
import { useDebtStore } from "../store/debt-store";
import { useAuthStore } from "../../../store/auth-store";
import { DebtPaymentItem } from "../../../types/debt";
import { PaginationMeta } from "../../../types/common";

export function useDebtPayments(debtId: string | null) {
  const paymentFilters = useDebtStore((s) => s.paymentFilters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<DebtPaymentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!debtId) return;
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      Object.entries(paymentFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      params.limit = 10;

      // Access shaping for STAFF_INPUT
      if (user?.role === "STAFF_INPUT") {
        if (params.status === "VOID") {
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await debtsApi.getDebtPayments(debtId, params);
      
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
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch debt payments"));
    } finally {
      setLoading(false);
    }
  }, [debtId, paymentFilters, user]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
}
