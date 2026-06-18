import { create } from "zustand";
import { DebtStatus, DebtType, DebtPaymentStatus } from "../../../types/debt";

export interface DebtFilters {
  page: number;
  search: string;
  status: DebtStatus | "";
  type: DebtType | "";
  businessUnitId: string;
  lenderName: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface DebtPaymentFilters {
  page: number;
  status: DebtPaymentStatus | "";
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface DebtStore {
  filters: DebtFilters;
  paymentFilters: DebtPaymentFilters;
  setFilter: <K extends keyof DebtFilters>(key: K, value: DebtFilters[K]) => void;
  setPaymentFilter: <K extends keyof DebtPaymentFilters>(key: K, value: DebtPaymentFilters[K]) => void;
  resetFilters: () => void;
  resetPaymentFilters: () => void;
}

const defaultFilters: DebtFilters = {
  page: 1,
  search: "",
  status: "",
  type: "",
  businessUnitId: "",
  lenderName: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultPaymentFilters: DebtPaymentFilters = {
  page: 1,
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useDebtStore = create<DebtStore>((set) => ({
  filters: defaultFilters,
  paymentFilters: defaultPaymentFilters,
  
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        // Reset page to 1 when changing filters other than page
        ...(key !== "page" ? { page: 1 } : {}),
      },
    })),
    
  setPaymentFilter: (key, value) =>
    set((state) => ({
      paymentFilters: {
        ...state.paymentFilters,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
      },
    })),
    
  resetFilters: () =>
    set(() => ({
      filters: defaultFilters,
    })),

  resetPaymentFilters: () =>
    set(() => ({
      paymentFilters: defaultPaymentFilters,
    })),
}));
