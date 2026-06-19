import { useState, useCallback, useEffect } from "react";
import { externalMoneyApi } from "../api";
import { useExternalPartyStore } from "../store/external-party-store";
import { ExternalParty } from "../../../types/receivable";
import { PaginationMeta } from "../../../types/common";

export function useExternalParties() {
  const filters = useExternalPartyStore((s) => s.filters);
  
  const [data, setData] = useState<ExternalParty[]>([]);
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
      params.limit = params.limit || 10;

      const res = await externalMoneyApi.getExternalParties(params);
      
      setData(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch external parties"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
}
