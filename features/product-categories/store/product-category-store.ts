import { create } from "zustand";
import { MasterStatus } from "../../../types/enums";

interface ProductCategoryFilters {
  search: string;
  status: MasterStatus | "";
}

interface ProductCategoryStore {
  filters: ProductCategoryFilters;
  setFilters: (filters: Partial<ProductCategoryFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ProductCategoryFilters = {
  search: "",
  status: "",
};

export const useProductCategoryStore = create<ProductCategoryStore>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
