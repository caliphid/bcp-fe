import { useState, useCallback, useEffect } from "react";
import { categoriesApi } from "../api";
import { useCategoryStore } from "../store/category-store";
import { Category } from "../../../types/category";
import { PaginationMeta } from "../../../types/common";

export function useCategories() {
  const { filters } = useCategoryStore();
  
  const [data, setData] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(() => {
    categoriesApi.getCategories({ limit: 100, status: "ACTIVE" })
      .then(res => setAllCategories(res.data))
      .catch(err => console.error("Failed to fetch all categories", err));
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getCategories({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.search,
    filters.status,
    filters.type,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    allCategories,
    meta,
    loading,
    globalError,
    setGlobalError,
    fetchData,
    fetchAllCategories,
  };
}
