import { useState, useCallback, useEffect } from "react";
import { externalMoneyApi } from "../api";
import { useReceivableStore } from "../store/receivable-store";
import { useAuthStore } from "../../../store/auth-store";
import { ReceivableItem } from "../../../types/receivable";
import { PaginationMeta } from "../../../types/common";

export function useReceivables() {
  const filters = useReceivableStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<ReceivableItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "dateRangeMode" && value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      params.limit = params.limit || 10;

      // Access shaping for STAFF_INPUT
      if (user?.role === "STAFF_INPUT") {
        if (params.status === "VOID") {
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await externalMoneyApi.getReceivables(params);
      
      // Additional safety filtering
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
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch receivables"));
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
