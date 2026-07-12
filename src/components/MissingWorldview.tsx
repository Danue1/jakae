"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { libraryHref } from "../react/links";

export function MissingWorldview() {
  const locale = useLocale();
  const t = useTranslations();
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-lg font-bold">{t("world.missingTitle")}</h1>
      <p className="mt-2 text-sm text-muted">{t("world.missingBody")}</p>
      <Link
        href={libraryHref(locale)}
        className="mt-6 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        {t("world.goLibrary")}
      </Link>
    </div>
  );
}
