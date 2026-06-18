import { useState, useCallback, useEffect } from "react";
import { businessUnitsApi } from "../api";
import { useBusinessUnitStore } from "../store/business-unit-store";
import { BusinessUnit } from "../../../types/business-unit";
import { PaginationMeta } from "../../../types/common";

export function useBusinessUnits() {
  const { filters } = useBusinessUnitStore();
  
  const [data, setData] = useState<BusinessUnit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessUnitsApi.getBusinessUnits({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch business units");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.search,
    filters.status,
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
