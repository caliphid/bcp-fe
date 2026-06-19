import { useState, useCallback, useEffect } from "react";
import { debtInstallmentsApi } from "../api";
import { DebtInstallmentDetail } from "../../../types/installment";

export function useInstallmentDetail(installmentId: string | null) {
  const [data, setData] = useState<DebtInstallmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!installmentId) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await debtInstallmentsApi.getInstallmentDetail(installmentId);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch installment detail"));
    } finally {
      setLoading(false);
    }
  }, [installmentId]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchDetail();
    });
    return () => { ignore = true; };
  }, [fetchDetail]);

  return { data, loading, error, refetch: fetchDetail };
}
