import { create } from "zustand";

export interface ProductFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  type: string;
  businessUnitId: string;
}

interface ProductStore {
  filters: ProductFilters;
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ProductFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  type: "",
  businessUnitId: "",
};

export const useProductStore = create<ProductStore>((set) => ({
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
