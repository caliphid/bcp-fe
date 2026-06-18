import { useState, useCallback, useEffect } from "react";
import { importsApi } from "../api";
import { useImportStore } from "../store/import-store";
import { ImportBatchItem } from "../../../types/import";
import { PaginationMeta } from "../../../types/common";

export function useImportBatches() {
  const { batchFilters: filters } = useImportStore();
  
  const [data, setData] = useState<ImportBatchItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await importsApi.getBatches({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        status: filters.status || undefined,
        activeYear: filters.activeYear || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch import batches");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.search,
    filters.status,
    filters.activeYear,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    meta,
    loading,
    globalError,
    setGlobalError,
    fetchData,
  };
}
