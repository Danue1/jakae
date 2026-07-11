"use client";

import { useLocale } from "../react/localeContext";

const CONTACT_HANDLE = "@_danuel_";
const CONTACT_URL = "https://twitter.com/_danuel_";

export function SiteFooter() {
  const { dictionary } = useLocale();

  return (
    <footer className="mx-auto max-w-2xl px-5 pb-12">
      <div className="border-t border-line pt-4 text-center text-xs text-muted">
        {dictionary.library.prereleaseNote} · {dictionary.library.contactLabel}{" "}
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
