import { useState, useCallback, useEffect } from "react";
import { debtInstallmentsApi } from "../api";
import { useInstallmentStore } from "../store/installment-store";
import { UpcomingDebtInstallmentItem } from "../../../types/installment";

export function useOverdueInstallments() {
  const filters = useInstallmentStore((s) => s.filters);
  
  const [data, setData] = useState<UpcomingDebtInstallmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdue = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filters.debtId) params.debtId = filters.debtId;
      if (filters.businessUnitId) params.businessUnitId = filters.businessUnitId;
      params.limit = 5; // usually just show a few in summary

      const res = await debtInstallmentsApi.getOverdue(params);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch overdue installments"));
    } finally {
      setLoading(false);
    }
  }, [filters.debtId, filters.businessUnitId]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchOverdue();
    });
    return () => { ignore = true; };
  }, [fetchOverdue]);

  return { data, loading, error, refetch: fetchOverdue };
}
