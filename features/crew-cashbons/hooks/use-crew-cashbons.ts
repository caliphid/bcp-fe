import { useState, useCallback, useEffect } from "react";
import { crewCashbonsApi } from "../api";
import { useCrewCashbonStore } from "../store/crew-cashbon-store";
import { useAuthStore } from "../../../store/auth-store";
import { CrewCashbonItem } from "../../../types/crew-cashbon";
import { PaginationMeta } from "../../../types/common";

export function useCrewCashbons() {
  const filters = useCrewCashbonStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  
  const [data, setData] = useState<CrewCashbonItem[]>([]);
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
      params.limit = params.limit || 100;

      // Access shaping for STAFF_INPUT
      if (user?.role === "STAFF_INPUT") {
        if (params.status === "INACTIVE" || params.status === "VOID") {
          setData([]);
          setMeta(undefined);
          setLoading(false);
          return;
        }
      }

      const res = await crewCashbonsApi.getCrewCashbons(params);
      
      // Additional safety filtering
      let finalData = res.data;
      if (user?.role === "STAFF_INPUT") {
        finalData = finalData.filter(d => d.status !== "INACTIVE" && d.status !== "VOID");
      }

      setData(finalData);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch crew cashbons"));
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
