"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  detectPreferredLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
} from "../locales";
import { libraryHref } from "../react/links";

export function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    const locale =
      savedLocale && isLocale(savedLocale)
        ? savedLocale
        : detectPreferredLocale(navigator.language);
    router.replace(libraryHref(locale));
  }, [router]);

  return null;
}
