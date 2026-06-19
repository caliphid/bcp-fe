import { useState, useCallback, useEffect } from "react";
import { debtInstallmentsApi } from "../api";
import { useInstallmentStore } from "../store/installment-store";
import { DebtInstallmentSummaryData } from "../../../types/installment";

export function useInstallmentSummary() {
  const filters = useInstallmentStore((s) => s.filters);
  
  const [data, setData] = useState<DebtInstallmentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filters.debtId) params.debtId = filters.debtId;
      if (filters.businessUnitId) params.businessUnitId = filters.businessUnitId;
      if (filters.status) params.status = filters.status;
      if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;

      const res = await debtInstallmentsApi.getSummary(params);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch installment summary"));
    } finally {
      setLoading(false);
    }
  }, [filters.debtId, filters.businessUnitId, filters.status, filters.dueDateFrom, filters.dueDateTo]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchSummary();
    });
    return () => { ignore = true; };
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}
