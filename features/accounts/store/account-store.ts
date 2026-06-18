import { create } from "zustand";

export interface AccountFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  type: string;
  businessUnitId: string;
}

interface AccountStore {
  filters: AccountFilters;
  setFilter: <K extends keyof AccountFilters>(key: K, value: AccountFilters[K]) => void;
  setFilters: (filters: Partial<AccountFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: AccountFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  type: "",
  businessUnitId: "",
};

export const useAccountStore = create<AccountStore>((set) => ({
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
}));
