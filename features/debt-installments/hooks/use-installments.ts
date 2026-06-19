import { useState, useCallback, useEffect } from "react";
import { debtInstallmentsApi } from "../api";
import { useInstallmentStore } from "../store/installment-store";
import { useAuthStore } from "../../../store/auth-store";
import { DebtInstallmentItem } from "../../../types/installment";
import { PaginationMeta } from "../../../types/common";

export function useInstallments() {
  const filters = useInstallmentStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<DebtInstallmentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      params.limit = 10;

      // Access shaping for STAFF_INPUT: Cannot view VOID
      if (user?.role === "STAFF_INPUT") {
        if (params.status === "VOID") {
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await debtInstallmentsApi.getInstallments(params);
      
      let finalData = res.data;
      if (user?.role === "STAFF_INPUT") {
        finalData = finalData.filter(d => d.status !== "VOID");
      }

      setData(finalData);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch installments"));
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
}
