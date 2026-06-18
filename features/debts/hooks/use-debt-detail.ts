import { useState, useCallback, useEffect } from "react";
import { debtsApi } from "../api";
import { DebtDetail } from "../../../types/debt";
import { useAuthStore } from "../../../store/auth-store";

export function useDebtDetail(id: string | null) {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DebtDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await debtsApi.getDebtDetail(id);
      const detail = res.data;

      // Apply access rules
      if (user?.role === "STAFF_INPUT") {
        if (detail.status === "INACTIVE" || detail.status === "DEFAULTED") {
          throw new Error("404");
        }
        // Filter out voided payments
        detail.payments = detail.payments.filter(p => p.status === "POSTED");
      }

      setData(detail);
      setError(null);
    } catch (err) {
      const e = err as { message?: string; response?: { status?: number; data?: { message?: string | string[] } } };
      if (e.message === "404" || e.response?.status === 404) {
        setError("Debt not found");
      } else {
        const msg = e.response?.data?.message;
        setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch debt detail"));
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
