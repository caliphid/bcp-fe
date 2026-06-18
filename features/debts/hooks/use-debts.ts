import { useState, useCallback, useEffect } from "react";
import { debtsApi } from "../api";
import { useDebtStore } from "../store/debt-store";
import { useAuthStore } from "../../../store/auth-store";
import { DebtItem } from "../../../types/debt";
import { PaginationMeta } from "../../../types/common";

export function useDebts() {
  const filters = useDebtStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<DebtItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Build API params, omit empty values
      const params: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      params.limit = 10; // Standard table limit

      // Access shaping for STAFF_INPUT
      if (user?.role === "STAFF_INPUT") {
        if (params.status === "INACTIVE" || params.status === "DEFAULTED") {
          // Can't view these, so force return empty or override to ACTIVE
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await debtsApi.getDebts(params);
      
      // Additional safety filtering for STAFF_INPUT just in case
      let finalData = res.data;
      if (user?.role === "STAFF_INPUT") {
        finalData = finalData.filter(d => d.status === "ACTIVE" || d.status === "PAID_OFF");
      }

      setData(finalData);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch debts"));
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
