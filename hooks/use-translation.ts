"use client";

import { useCallback } from "react";
import { useLangStore } from "../store/lang-store";
import { getTranslation } from "../lib/i18n";

export function useTranslation() {
  const language = useLangStore((state) => state.language);

  const t = useCallback(
    (key: string) => getTranslation(language, key),
    [language]
  );

  return { t, language };
}
