import { create } from "zustand";

export interface FinanceFilters {
  month: number | "";
  year: number | "";
  businessUnitId: string;
  accountId: string;
  includeNonCashEquivalent: boolean;
  includeTransfersInAccountMovement: boolean;
  includeOtherIncome: boolean;
  includeOtherExpense: boolean;
  page: number;
  limit: number;
  dateFrom: string;
  dateTo: string;
}

interface FinanceStore {
  filters: FinanceFilters;
  setFilter: <K extends keyof FinanceFilters>(key: K, value: FinanceFilters[K]) => void;
  setFilters: (filters: Partial<FinanceFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: FinanceFilters = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  businessUnitId: "",
  accountId: "",
  includeNonCashEquivalent: false,
  includeTransfersInAccountMovement: false,
  includeOtherIncome: true,
  includeOtherExpense: true,
  page: 1,
  limit: 20,
  dateFrom: "",
  dateTo: "",
};

export const useFinanceStore = create<FinanceStore>((set) => ({
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
      filters: { ...defaultFilters },
    })),
}));
