import { create } from "zustand";

export interface BusinessUnitFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
}

interface BusinessUnitStore {
  filters: BusinessUnitFilters;
  setFilter: <K extends keyof BusinessUnitFilters>(key: K, value: BusinessUnitFilters[K]) => void;
  setFilters: (filters: Partial<BusinessUnitFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: BusinessUnitFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
};

export const useBusinessUnitStore = create<BusinessUnitStore>((set) => ({
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
