import { create } from "zustand";

interface AdCampaignState {
  params: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  resetFilters: () => void;
}

export const useAdCampaignStore = create<AdCampaignState>((set) => ({
  params: {
    page: 1,
    limit: 10,
    search: "",
    status: "",
    businessUnitId: "",
    platformId: "",
  },
  setFilter: (key, value) =>
    set((state) => ({
      params: {
        ...state.params,
        [key]: value,
        ...(key !== "page" && { page: 1 }),
      },
    })),
  resetFilters: () =>
    set({
      params: {
        page: 1,
        limit: 10,
        search: "",
        status: "",
        businessUnitId: "",
        platformId: "",
      },
    }),
}));
