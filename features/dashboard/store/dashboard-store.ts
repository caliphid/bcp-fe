import { create } from "zustand";

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  month: string;
  year: string;
  businessUnitId: string;
  accountId: string;
  categoryId: string;
}

interface DashboardStore {
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  getApiParams: () => Record<string, any>;
}

const defaultFilters: DashboardFilters = {
  dateFrom: "",
  dateTo: "",
  month: "",
  year: "",
  businessUnitId: "",
  accountId: "",
  categoryId: "",
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  filters: defaultFilters,
  
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
    
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
    
  resetFilters: () =>
    set(() => ({
      filters: defaultFilters,
    })),

  // Utility to get only truthy values for API calls
  getApiParams: () => {
    const { filters } = get();
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    return params;
  }
}));
