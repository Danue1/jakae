"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_NAMES, LOCALES } from "../locales";
import { libraryHref } from "../react/links";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full bg-hover px-3.5 py-1.5 text-sm text-muted outline-none hover:text-ink">
        <Globe size={16} aria-hidden="true" />
        {LOCALE_NAMES[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LOCALES.map((availableLocale) => (
          <DropdownMenuItem
            key={availableLocale}
            className={availableLocale === locale ? "font-bold text-accent" : ""}
            onSelect={() => router.push(libraryHref(availableLocale))}
          >
            {LOCALE_NAMES[availableLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
