"use client";

import { ChevronLeft, Info, Check, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  aboutHref,
  libraryHref,
  preferencesHref,
  updatesHref,
} from "@/react/links";
import { LOCALE_NAMES, LOCALES } from "@/locales";
import { cn } from "@/lib/utils";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function PreferencesPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={libraryHref(locale)}
          className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{t("library.title")}</span>
        </Link>
      </div>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
        {t("preferences.title")}
      </h1>

      <section className="mt-7">
        <SectionCaption>{t("preferences.languageTitle")}</SectionCaption>
        <div className="overflow-hidden rounded-2xl border border-line">
          {LOCALES.map((availableLocale) => {
            const active = availableLocale === locale;
            return (
              <button
                key={availableLocale}
                className={cn(
                  "flex w-full items-center gap-2 border-b border-line px-4 py-3 text-left text-sm last:border-b-0",
                  active ? "font-bold text-accent" : "hover:bg-hover",
                )}
                onClick={() => router.push(preferencesHref(availableLocale))}
              >
                <span className="flex-1">{LOCALE_NAMES[availableLocale]}</span>
                {active && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("preferences.languageHint")}
        </p>
      </section>

      <section className="mt-8">
        <SectionCaption>{t("preferences.aboutTitle")}</SectionCaption>
        <div className="overflow-hidden rounded-2xl border border-line">
          <Link
            href={aboutHref(locale)}
            className="flex items-center gap-3 border-b border-line px-4 py-3 text-sm hover:bg-hover"
          >
            <Info size={17} aria-hidden="true" className="shrink-0 text-muted" />
            <span className="flex-1">{t("about.title")}</span>
            <ChevronLeft
              size={16}
              aria-hidden="true"
              className="shrink-0 rotate-180 text-muted"
            />
          </Link>
          <Link
            href={updatesHref(locale)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-hover"
          >
            <Bell size={17} aria-hidden="true" className="shrink-0 text-muted" />
            <span className="flex-1">{t("updates.navLabel")}</span>
            <ChevronLeft
              size={16}
              aria-hidden="true"
              className="shrink-0 rotate-180 text-muted"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
