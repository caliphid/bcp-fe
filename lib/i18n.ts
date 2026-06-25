import en from "../lang/en.json";
import id from "../lang/id.json";

type DeepRecord = { [key: string]: string | DeepRecord };

const translations: Record<string, DeepRecord> = { en, id };

export function getTranslation(lang: string, key: string): string {
  const dict = translations[lang] ?? translations.id;
  const parts = key.split(".");
  let current: string | DeepRecord = dict;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return key;
    current = current[part];
  }

  return typeof current === "string" ? current : key;
}
