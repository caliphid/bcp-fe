import { create } from "zustand";

interface OrderDashboardState {
  filters: {
    month?: number;
    year?: number;
    dateFrom?: string;
    dateTo?: string;
    businessUnitId?: string;
  };
  setFilter: <K extends keyof OrderDashboardState["filters"]>(key: K, value: OrderDashboardState["filters"][K]) => void;
  setFilters: (filters: Partial<OrderDashboardState["filters"]>) => void;
  resetFilters: () => void;
}

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const initialState = {
  month: currentMonth,
  year: currentYear,
};

export const useOrderDashboardStore = create<OrderDashboardState>((set) => ({
  filters: initialState,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (filters) => 
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: initialState }),
}));
