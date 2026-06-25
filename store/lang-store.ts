import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "id" | "en";

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      language: "id",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "bcp-language",
    }
  )
);
