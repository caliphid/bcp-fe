import { create } from "zustand";

interface StockOpnamesState {
  filters: {
    page: number;
    limit: number;
    search?: string;
    warehouseId?: string;
    status?: string;
    countMode?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

const initialState = {
  page: 1,
  limit: 10,
};

export const useStockOpnamesStore = create<StockOpnamesState>((set) => ({
  filters: initialState,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : state.filters.page },
    })),
  resetFilters: () => set({ filters: initialState }),
}));
