import { create } from 'zustand';

interface CustomersFilters {
  search?: string;
  customerType?: string;
  status?: string;
  source?: string;
  businessUnitId?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CustomersState {
  filters: CustomersFilters;
  setFilter: (key: keyof CustomersFilters, value: any) => void;
  resetFilters: () => void;
}

const defaultFilters: CustomersFilters = {
  page: 1,
  limit: 10,
};

export const useCustomersStore = create<CustomersState>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) => 
    set((state) => ({
      filters: { ...state.filters, [key]: value, ...(key !== 'page' && { page: 1 }) },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
