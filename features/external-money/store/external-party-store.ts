import { create } from "zustand";

interface ExternalPartyFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: "CUSTOMER" | "VENDOR" | "PARTNER" | "EMPLOYEE" | "INDIVIDUAL" | "COMPANY" | "OTHER" | "";
  status?: "ACTIVE" | "INACTIVE" | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ExternalPartyState {
  filters: ExternalPartyFilters;
  setFilter: (key: keyof ExternalPartyFilters, value: unknown) => void;
  resetFilters: () => void;
}

const initialFilters: ExternalPartyFilters = {
  page: 1,
  limit: 100,
  search: "",
  type: "",
  status: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useExternalPartyStore = create<ExternalPartyState>((set) => ({
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
