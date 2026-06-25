import { create } from "zustand";

interface SalesOrdersState {
  filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    salesChannel?: string;
    orderType?: string;
    businessUnitId?: string;
    warehouseId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

const initialState = {
  page: 1,
  limit: 10,
};

export const useSalesOrdersStore = create<SalesOrdersState>((set) => ({
  filters: initialState,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : state.filters.page },
    })),
  resetFilters: () => set({ filters: initialState }),
}));
