import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../api";
import { useDashboardStore } from "../store/dashboard-store";
import { useAuthStore } from "../../../store/auth-store";

export function useDashboardOverview() {
  const filters = useDashboardStore((s) => s.filters);
  const filtersStr = JSON.stringify(filters);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const parsedFilters = JSON.parse(filtersStr);
        const params: Record<string, any> = {};
        Object.entries(parsedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) params[key] = value;
        });

        const res = await dashboardApi.getOverview(params);
        if (!ignore) { setData(res.data); setError(null); }
      } catch (e) {
        if (!ignore) setError((e as any).response?.data?.message || "Error fetching overview");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
  }, [filtersStr]);

  return { data, loading, error };
}

// Reusable factory for simple GET endpoints
function createDashboardHook<T>(apiCall: (params?: any) => Promise<{data: T}>, skipForStaff: boolean = true) {
  return function useHook(additionalParams?: Record<string, any>) {
    const user = useAuthStore((s) => s.user);
    const filters = useDashboardStore((s) => s.filters);
    
    // Convert filters to valid params
    const storeParams: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) storeParams[key] = value;
    });

    const mergedParams = { ...storeParams, ...additionalParams };
    const filtersStr = JSON.stringify(mergedParams);
    
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let ignore = false;
      if (skipForStaff && user?.role === "STAFF_INPUT") {
        setLoading(false);
        return;
      }
      
      const fetch = async () => {
        setLoading(true);
        try {
          const res = await apiCall(JSON.parse(filtersStr));
          if (!ignore) { setData(res.data); setError(null); }
        } catch (e) {
          if (!ignore) setError((e as any).response?.data?.message || "Error fetching data");
        } finally {
          if (!ignore) setLoading(false);
        }
      };
      fetch();
      return () => { ignore = true; };
    }, [filtersStr, skipForStaff, user?.role]);

    return { data, loading, error };
  };
}

export const useCashflowSummary = createDashboardHook(dashboardApi.getCashflowSummary);
export const useMonthlyTrend = createDashboardHook(dashboardApi.getMonthlyTrend);
export const useDailyTrend = createDashboardHook(dashboardApi.getDailyTrend);
export const useCategoryBreakdown = createDashboardHook(dashboardApi.getCategoryBreakdown);
export const useTopExpenses = createDashboardHook(dashboardApi.getTopExpenses);
export const useTopIncomeSources = createDashboardHook(dashboardApi.getTopIncomeSources);
export const useAccountBalances = createDashboardHook((params: any) => {
  const { month, year, ...rest } = params || {};
  return dashboardApi.getAccountBalances(rest);
});
export const useBusinessUnitPerformance = createDashboardHook(dashboardApi.getBusinessUnitPerformance);
export const useYearlySummary = createDashboardHook((params: any) => {
  const { month, ...rest } = params || {};
  return dashboardApi.getYearlySummary(rest);
});
export const useRecentTransactions = createDashboardHook((params: any) => {
  const { month, year, ...rest } = params || {};
  return dashboardApi.getRecentTransactions(rest);
}, false);
export const useFinanceHealth = createDashboardHook(dashboardApi.getFinanceHealth);

export function useMonthComparison() {
  const filters = useDashboardStore((s) => s.filters);
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert filters to valid params
  const storeParams: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) storeParams[key] = value;
  });

  const filtersStr = JSON.stringify(storeParams);

  useEffect(() => {
    let ignore = false;
    if (user?.role === "STAFF_INPUT") {
      setLoading(false); return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const d = new Date();
        const currentMonth = storeParams.month ? parseInt(storeParams.month) : d.getMonth() + 1;
        const currentYear = storeParams.year ? parseInt(storeParams.year) : d.getFullYear();
        
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear -= 1;
        }

        const res = await dashboardApi.getMonthComparison({
          currentMonth, currentYear, previousMonth, previousYear,
          businessUnitId: storeParams.businessUnitId,
          accountId: storeParams.accountId,
        });
        if (!ignore) { setData(res.data); setError(null); }
      } catch (e) {
        if (!ignore) setError((e as any).response?.data?.message || "Error");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
  }, [filtersStr, user?.role]);

  return { data, loading, error };
}
