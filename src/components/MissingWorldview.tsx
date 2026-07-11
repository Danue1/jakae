"use client";

import Link from "next/link";
import { libraryHref } from "../react/links";
import { useLocale } from "../react/localeContext";

export function MissingWorldview() {
  const { locale, dictionary } = useLocale();
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-lg font-bold">{dictionary.world.missingTitle}</h1>
      <p className="mt-2 text-sm text-muted">{dictionary.world.missingBody}</p>
      <Link
        href={libraryHref(locale)}
        className="mt-6 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        {dictionary.world.goLibrary}
      </Link>
    </div>
  );
}
