import { useState, useCallback, useEffect } from "react";
import { productCategoriesApi } from "../api";
import { useProductCategoryStore } from "../store/product-category-store";
import { ProductCategory } from "../../../types/product-category";

export function useProductCategories() {
  const { filters } = useProductCategoryStore();
  
  const [data, setData] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productCategoriesApi.getProductCategories({
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setData(res.data || []);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch product categories");
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    globalError,
    setGlobalError,
    fetchData,
  };
}
