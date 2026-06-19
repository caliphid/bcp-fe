import { useState, useCallback, useEffect } from "react";
import { crewCashbonsApi } from "../api";
import { CrewCashbonDetail } from "../../../types/crew-cashbon";

export function useCrewCashbonDetail(id: string | null) {
  const [data, setData] = useState<CrewCashbonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await crewCashbonsApi.getCrewCashbonDetail(id);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch crew cashbon detail"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
