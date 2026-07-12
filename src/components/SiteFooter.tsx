"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { updatesHref } from "../react/links";

const CONTACT_HANDLE = "@_danuel_";
const CONTACT_URL = "https://twitter.com/_danuel_";

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <footer className="mx-auto max-w-2xl px-5 pb-12">
      <div className="border-t border-line pt-4 text-center text-xs text-muted">
        <Link
          href={updatesHref(locale)}
          className="font-semibold text-accent hover:underline"
        >
          {t("updates.navLabel")}
        </Link>{" "}
        ·{" "}
        {t("library.prereleaseNote")} · {t("library.contactLabel")}{" "}
        <a
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent hover:underline"
        >
          {CONTACT_HANDLE}
        </a>
      </div>
    </footer>
  );
}
