import { create } from "zustand";
import { InstallmentStatus, InstallmentPaymentStatus } from "../../../types/installment";

export interface InstallmentFilters {
  page: number;
  search: string;
  debtId: string;
  status: InstallmentStatus | "";
  businessUnitId: string;
  dueDateFrom: string;
  dueDateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface InstallmentPaymentFilters {
  page: number;
  status: InstallmentPaymentStatus | "";
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface InstallmentStore {
  filters: InstallmentFilters;
  paymentFilters: InstallmentPaymentFilters;
  setFilter: <K extends keyof InstallmentFilters>(key: K, value: InstallmentFilters[K]) => void;
  setPaymentFilter: <K extends keyof InstallmentPaymentFilters>(key: K, value: InstallmentPaymentFilters[K]) => void;
  resetFilters: () => void;
  resetPaymentFilters: () => void;
}

const defaultFilters: InstallmentFilters = {
  page: 1,
  search: "",
  debtId: "",
  status: "",
  businessUnitId: "",
  dueDateFrom: "",
  dueDateTo: "",
  sortBy: "dueDate",
  sortOrder: "asc",
};

const defaultPaymentFilters: InstallmentPaymentFilters = {
  page: 1,
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useInstallmentStore = create<InstallmentStore>((set) => ({
  filters: defaultFilters,
  paymentFilters: defaultPaymentFilters,
  
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
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
