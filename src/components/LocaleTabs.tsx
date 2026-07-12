"use client";

import { cn } from "@/lib/utils";
import { LOCALE_NAMES, LOCALES, type Locale } from "../locales";

// 언어별 값 편집 슬롯 전환 — UI 언어와 무관하게 그 자리에서 대상 언어를 고른다.
export function LocaleTabs({
  value,
  onChange,
  filledLocales,
  primaryLocale,
  primaryLabel,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  filledLocales: string[];
  primaryLocale: string;
  primaryLabel: string;
}) {
  return (
    <div className="flex shrink-0 gap-0.5">
      {LOCALES.map((availableLocale) => {
        const selected = availableLocale === value;
        const filled = filledLocales.includes(availableLocale);
        return (
          <button
            key={availableLocale}
            aria-pressed={selected}
            title={
              LOCALE_NAMES[availableLocale] +
              (availableLocale === primaryLocale ? ` · ${primaryLabel}` : "")
            }
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase",
              selected
                ? "bg-accent text-accent-foreground"
                : filled
                  ? "bg-hover text-ink"
                  : "bg-hover text-muted",
            )}
            onClick={() => onChange(availableLocale)}
          >
            {availableLocale}
          </button>
        );
      })}
    </div>
  );
}
