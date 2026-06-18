import { useState, useCallback, useEffect } from "react";
import { importsApi } from "../api";
import { ImportBatchItem } from "../../../types/import";

export function useImportBatchDetail(batchId: string | undefined) {
  const [data, setData] = useState<ImportBatchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!batchId) return;
    
    setLoading(true);
    try {
      const res = await importsApi.getBatchDetail(batchId);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch batch detail");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    loading,
    error,
    fetchDetail,
  };
}
