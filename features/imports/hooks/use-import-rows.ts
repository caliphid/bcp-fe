import { useState, useCallback, useEffect } from "react";
import { importsApi } from "../api";
import { useImportStore } from "../store/import-store";
import { ImportRowItem } from "../../../types/import";
import { PaginationMeta } from "../../../types/common";

export function useImportRows(batchId: string | undefined) {
  const { rowFilters: filters } = useImportStore();
  
  const [data, setData] = useState<ImportRowItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    if (!batchId) return;
    
    setLoading(true);
    try {
      const res = await importsApi.getBatchRows(batchId, {
        page: filters.page,
        limit: 20,
        search: filters.search || undefined,
        status: filters.status || undefined,
        sheetName: filters.sheetName || undefined,
        month: filters.month || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      setError("Failed to fetch import rows");
    } finally {
      setLoading(false);
    }
  }, [
    batchId,
    filters.page,
    filters.search,
    filters.status,
    filters.sheetName,
    filters.month,
  ]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return {
    data,
    meta,
    loading,
    error,
    fetchRows,
  };
}
