import { create } from "zustand";

export interface ImportBatchFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  activeYear: string;
}

export interface ImportRowFilters {
  page: number;
  search: string;
  searchInput: string;
  status: string;
  sheetName: string;
  month: string;
}

interface ImportStore {
  batchFilters: ImportBatchFilters;
  rowFilters: ImportRowFilters;
  
  setBatchFilter: <K extends keyof ImportBatchFilters>(key: K, value: ImportBatchFilters[K]) => void;
  setRowFilter: <K extends keyof ImportRowFilters>(key: K, value: ImportRowFilters[K]) => void;
  resetBatchFilters: () => void;
  resetRowFilters: () => void;
}

const defaultBatchFilters: ImportBatchFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  activeYear: "",
};

const defaultRowFilters: ImportRowFilters = {
  page: 1,
  search: "",
  searchInput: "",
  status: "",
  sheetName: "",
  month: "",
};

export const useImportStore = create<ImportStore>((set) => ({
  batchFilters: defaultBatchFilters,
  rowFilters: defaultRowFilters,
  
  setBatchFilter: (key, value) =>
    set((state) => ({
      batchFilters: { ...state.batchFilters, [key]: value },
    })),
    
  setRowFilter: (key, value) =>
    set((state) => ({
      rowFilters: { ...state.rowFilters, [key]: value },
    })),
    
  resetBatchFilters: () =>
    set(() => ({
      batchFilters: defaultBatchFilters,
    })),
    
  resetRowFilters: () =>
    set(() => ({
      rowFilters: defaultRowFilters,
    })),
}));
