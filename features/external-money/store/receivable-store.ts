import { create } from "zustand";

interface ReceivableFilters {
  page?: number;
  limit?: number;
  search?: string;
  externalPartyId?: string;
  businessUnitId?: string;
  receivableType?: string;
  status?: string;
  dateRangeMode?: string;
  receivableDateFrom?: string;
  receivableDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasOutstanding?: boolean | "";
  hasWriteOff?: boolean | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ReceivableState {
  filters: ReceivableFilters;
  setFilter: (key: keyof ReceivableFilters, value: unknown) => void;
  resetFilters: () => void;
}

const d = new Date();
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, "0");
const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();

const initialFilters: ReceivableFilters = {
  page: 1,
  limit: 100,
  search: "",
  externalPartyId: "",
  businessUnitId: "",
  receivableType: "",
  status: "",
  dateRangeMode: "this_month",
  receivableDateFrom: `${year}-${month}-01`,
  receivableDateTo: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  dueDateFrom: "",
  dueDateTo: "",
  hasOutstanding: "",
  hasWriteOff: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useReceivableStore = create<ReceivableState>((set) => ({
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
