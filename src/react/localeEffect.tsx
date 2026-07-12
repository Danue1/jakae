"use client";

import { useEffect } from "react";
import { LOCALE_STORAGE_KEY, type Locale } from "@/locales";

export function LocaleEffect({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return null;
}
