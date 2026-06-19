import { useState, useCallback, useEffect } from "react";
import { adsReportsApi } from "../api";
import { AdsReportItem, AdsReportDetail } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";

export function useAdsReports(params?: Record<string, unknown>) {
  const [data, setData] = useState<AdsReportItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adsReportsApi.getReports(params);
      setData(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch ads reports"));
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

export function useAdsReportDetail(id?: string) {
  const [data, setData] = useState<AdsReportDetail | undefined>();
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await adsReportsApi.getReportDetail(id);
      setData(res.data);
      setError(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to fetch report detail"));
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
