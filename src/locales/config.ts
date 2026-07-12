export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_STORAGE_KEY = "character-organizer.locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function detectPreferredLocale(navigatorLanguage: string): Locale {
  const languageCode = navigatorLanguage.toLowerCase().slice(0, 2);
  return isLocale(languageCode) ? languageCode : DEFAULT_LOCALE;
}
