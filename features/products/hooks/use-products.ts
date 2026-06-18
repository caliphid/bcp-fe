import { useState, useCallback, useEffect } from "react";
import { productsApi } from "../api";
import { businessUnitsApi } from "../../business-units/api";
import { useProductStore } from "../store/product-store";
import { Product } from "../../../types/product";
import { BusinessUnit } from "../../../types/business-unit";
import { PaginationMeta } from "../../../types/common";

export function useProducts() {
  const { filters } = useProductStore();
  
  const [data, setData] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  useEffect(() => {
    businessUnitsApi.getBusinessUnits({ limit: 100, status: "ACTIVE" })
      .then(res => setBusinessUnits(res.data))
      .catch(err => console.error("Failed to fetch business units", err));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getProducts({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined,
        businessUnitId: filters.businessUnitId || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.search,
    filters.status,
    filters.type,
    filters.businessUnitId,
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
    businessUnits,
    fetchData,
  };
}
