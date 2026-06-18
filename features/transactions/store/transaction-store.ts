import { create } from "zustand";
import { TransactionStatus } from "../../../types/enums";

export interface TransactionFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  type: string;
  businessUnitId: string;
  accountId: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  month: string;
  year: string;
  sortBy: string;
  sortOrder: string;
}

interface TransactionStore {
  filters: TransactionFilters;
  setFilter: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: (isStaffInput: boolean) => void;
}

const defaultFilters: TransactionFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  type: "",
  businessUnitId: "",
  accountId: "",
  categoryId: "",
  dateFrom: "",
  dateTo: "",
  month: "",
  year: "",
  sortBy: "transactionDate",
  sortOrder: "desc",
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: (isStaffInput) =>
    set(() => ({
      filters: {
        ...defaultFilters,
        status: isStaffInput ? TransactionStatus.POSTED : "",
      },
    })),
}));
