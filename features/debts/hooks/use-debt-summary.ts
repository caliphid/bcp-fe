import { useState, useCallback, useEffect } from "react";
import { debtsApi } from "../api";
import { useDebtStore } from "../store/debt-store";
import { useAuthStore } from "../../../store/auth-store";
import { DebtSummaryData, DebtByLenderItem, DebtByBusinessUnitItem } from "../../../types/debt";

export function useDebtSummary() {
  const filters = useDebtStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  
  const [summary, setSummary] = useState<DebtSummaryData | null>(null);
  const [byLender, setByLender] = useState<DebtByLenderItem[]>([]);
  const [byUnit, setByUnit] = useState<DebtByBusinessUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      const keysToSync = ["businessUnitId", "status", "type", "dateFrom", "dateTo"];
      keysToSync.forEach((key) => {
        const val = filters[key as keyof typeof filters];
        if (val !== "" && val !== null && val !== undefined) {
          params[key] = val;
        }
      });

      // 1. Fetch Summary (All roles)
      const summaryRes = await debtsApi.getSummary(params);
      setSummary(summaryRes.data);

      // 2. Fetch By Lender & By Unit (Only OWNER/ADMIN_FINANCE)
      if (user && user.role !== "STAFF_INPUT") {
        const [lenderRes, unitRes] = await Promise.all([
          debtsApi.getByLender(params),
          debtsApi.getByBusinessUnit(params),
        ]);
        setByLender(lenderRes.data);
        setByUnit(unitRes.data);
      } else {
        setByLender([]);
        setByUnit([]);
      }

      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch debt summary"));
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

  return { summary, byLender, byUnit, loading, error, refetch: fetchData };
}
