export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_STORAGE_KEY = "character-organizer.locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

// 관계 표시의 언어 고정 연결어 — "상대이름 + 연결어 + 라벨"의 가운데 조사.
// 보는 언어에 맞춰 붙는다(예: 가가의 집사 / Gaga's butler / ガガの執事).
export const RELATION_CONNECTOR: Record<Locale, string> = {
  ko: "의",
  en: "'s",
  ja: "の",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function detectPreferredLocale(navigatorLanguage: string): Locale {
  const languageCode = navigatorLanguage.toLowerCase().slice(0, 2);
  return isLocale(languageCode) ? languageCode : DEFAULT_LOCALE;
}
