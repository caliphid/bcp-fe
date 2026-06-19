import { useState, useCallback, useEffect } from "react";
import { externalMoneyApi } from "../api";
import { ReceivableWriteOff } from "../../../types/receivable";

export function useReceivableWriteOffs(receivableId: string) {
  const [data, setData] = useState<ReceivableWriteOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!receivableId) return;
    setLoading(true);
    try {
      const res = await externalMoneyApi.getReceivableWriteOffs(receivableId);
      setData(res.data || []);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch write-offs"));
    } finally {
      setLoading(false);
    }
  }, [receivableId]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
