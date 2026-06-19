import { create } from "zustand";

interface AdsReportState {
  params: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  resetFilters: () => void;
}

export const useAdsReportStore = create<AdsReportState>((set) => ({
  params: {
    page: 1,
    limit: 10,
    search: "",
    status: "",
    businessUnitId: "",
    platformId: "",
    campaignId: "",
    dateFrom: "",
    dateTo: "",
    profitable: "",
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
        campaignId: "",
        dateFrom: "",
        dateTo: "",
        profitable: "",
      },
    }),
}));
