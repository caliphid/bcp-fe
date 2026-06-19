import { create } from "zustand";

interface AdPlatformState {
  params: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  resetFilters: () => void;
}

export const useAdPlatformStore = create<AdPlatformState>((set) => ({
  params: {
    page: 1,
    limit: 10,
    search: "",
    status: "",
  },
  setFilter: (key, value) =>
    set((state) => ({
      params: {
        ...state.params,
        [key]: value,
        ...(key !== "page" && { page: 1 }), // Reset page on filter change
      },
    })),
  resetFilters: () =>
    set({
      params: {
        page: 1,
        limit: 10,
        search: "",
        status: "",
      },
    }),
}));
