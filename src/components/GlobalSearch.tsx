"use client";

import {
  BookText,
  Clock,
  Dna,
  Hexagon,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  selectGlobalSearchResults,
  type SearchResultKind,
} from "@/core/selectors";
import {
  chapterHref,
  characterHref,
  eventHref,
  glossaryHref,
  organizationHref,
  placeHref,
  raceHref,
} from "@/react/links";
import { useWorldviewStore } from "@/react/useWorldviewStore";

const KIND_ICON: Record<SearchResultKind, typeof User> = {
  character: User,
  group: Hexagon,
  place: MapPin,
  race: Dna,
  glossary: BookText,
  chapter: Clock,
  event: Clock,
};

export function GlobalSearch({
  open,
  onOpenChange,
  worldviewId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldviewId: string;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const [query, setQuery] = useState("");

  const results = worldview
    ? selectGlobalSearchResults(worldview, characters, query, locale)
    : [];

  const kindLabel: Record<SearchResultKind, string> = {
    character: t("nav.characters"),
    group: t("nav.organizations"),
    place: t("nav.places"),
    race: t("nav.races"),
    glossary: t("nav.glossary"),
    chapter: t("timeline.heading"),
    event: t("timeline.heading"),
  };

  const hrefFor = (kind: SearchResultKind, id: string) => {
    switch (kind) {
      case "character":
        return characterHref(locale, worldviewId, id);
      case "group":
        return organizationHref(locale, worldviewId, id);
      case "place":
        return placeHref(locale, worldviewId, id);
      case "race":
        return raceHref(locale, worldviewId, id);
      case "glossary":
        return glossaryHref(locale, worldviewId, id);
      case "chapter":
        return chapterHref(locale, worldviewId, id);
      case "event":
        return eventHref(locale, worldviewId, id);
    }
  };

  const change = (next: boolean) => {
    onOpenChange(next);
    if (!next) setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">{t("nav.search")}</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Search size={18} aria-hidden="true" className="shrink-0 text-muted" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            placeholder={t("nav.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="overflow-y-auto py-1">
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {t("nav.searchEmpty")}
            </p>
          )}
          {results.map((result, index) => {
            const Icon = KIND_ICON[result.kind];
            const showHeader =
              index === 0 ||
              kindLabel[results[index - 1]!.kind] !== kindLabel[result.kind];
            return (
              <div key={`${result.kind}-${result.id}`}>
                {showHeader && (
                  <div className="px-4 pb-1 pt-3 text-xs font-bold tracking-wide text-muted">
                    {kindLabel[result.kind]}
                  </div>
                )}
                <button
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-hover"
                  onClick={() => {
                    change(false);
                    router.push(hrefFor(result.kind, result.id));
                  }}
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                  <span className="truncate text-sm">{result.name || "-"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
