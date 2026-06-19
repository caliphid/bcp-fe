import { useState, useCallback, useEffect } from "react";
import { adCampaignsApi } from "../api";
import { AdCampaignItem } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";

export function useAdCampaigns(params?: Record<string, unknown>) {
  const [data, setData] = useState<AdCampaignItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adCampaignsApi.getCampaigns(params);
      setData(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch ad campaigns"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, meta, isLoading, error, mutate: fetchData };
}

export function useAdCampaignDetail(id?: string) {
  const [data, setData] = useState<AdCampaignItem | undefined>();
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await adCampaignsApi.getCampaignDetail(id);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch campaign detail"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchData();
    });
    return () => { ignore = true; };
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}
