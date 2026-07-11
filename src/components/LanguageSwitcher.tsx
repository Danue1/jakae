"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDictionary, LOCALES } from "../locales";
import { libraryHref } from "../react/links";
import { useLocale } from "../react/localeContext";

export function LanguageSwitcher() {
  const { locale, dictionary } = useLocale();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full bg-hover px-3.5 py-1.5 text-sm text-muted outline-none hover:text-ink">
        <Globe size={16} aria-hidden="true" />
        {dictionary.languageName}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LOCALES.map((availableLocale) => (
          <DropdownMenuItem
            key={availableLocale}
            className={availableLocale === locale ? "font-bold text-accent" : ""}
            onSelect={() => router.push(libraryHref(availableLocale))}
          >
            {getDictionary(availableLocale).languageName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
