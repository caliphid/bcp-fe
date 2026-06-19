import { useState, useCallback, useEffect } from "react";
import { crewCashbonsApi } from "../api";
import { CashbonSummaryData } from "../../../types/crew-cashbon";

export function useCashbonSummary(filters: Record<string, unknown> = {}) {
  const [data, setData] = useState<CashbonSummaryData | null>(null);
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

      const res = await crewCashbonsApi.getSummary(params);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch summary"));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
