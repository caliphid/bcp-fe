import { create } from "zustand";

interface CrewCashbonFilters {
  page?: number;
  limit?: number;
  search?: string;
  crewId?: string;
  businessUnitId?: string;
  status?: "ACTIVE" | "PARTIALLY_PAID" | "PAID_OFF" | "OVERDUE" | "VOID" | "INACTIVE" | "";
  cashbonDateFrom?: string;
  cashbonDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasOutstanding?: boolean | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CrewCashbonState {
  filters: CrewCashbonFilters;
  setFilter: (key: keyof CrewCashbonFilters, value: unknown) => void;
  resetFilters: () => void;
}

const initialFilters: CrewCashbonFilters = {
  page: 1,
  limit: 100,
  search: "",
  crewId: "",
  businessUnitId: "",
  status: "",
  cashbonDateFrom: "",
  cashbonDateTo: "",
  dueDateFrom: "",
  dueDateTo: "",
  hasOutstanding: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useCrewCashbonStore = create<CrewCashbonState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        ...(key !== "page" && { page: 1 }), // Reset to page 1 on any other filter change
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
