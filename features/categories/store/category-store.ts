import { create } from "zustand";

export interface CategoryFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  type: string;
}

interface CategoryStore {
  filters: CategoryFilters;
  setFilter: <K extends keyof CategoryFilters>(key: K, value: CategoryFilters[K]) => void;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CategoryFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  type: "",
};

export const useCategoryStore = create<CategoryStore>((set) => ({
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
