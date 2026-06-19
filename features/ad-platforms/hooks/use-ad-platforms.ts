import { useState, useCallback, useEffect } from "react";
import { adPlatformsApi } from "../api";
import { AdPlatformItem } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";

export function useAdPlatforms(params?: Record<string, unknown>) {
  const [data, setData] = useState<AdPlatformItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adPlatformsApi.getPlatforms(params);
      setData(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch ad platforms"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // use JSON stringify to avoid infinite loops if params object is recreated

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, meta, isLoading, error, mutate: fetchData };
}
