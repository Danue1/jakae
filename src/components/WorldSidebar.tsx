"use client";

import {
  BookText,
  Building2,
  ChevronRight,
  CircleDot,
  Clock,
  Dna,
  Library,
  MapPin,
  Search,
  Settings,
  SlidersHorizontal,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  chapterDisplayName,
  characterDisplayName,
  glossaryTermDisplayName,
  groupDisplayName,
  itemDisplayName,
  placeDisplayName,
  raceDisplayName,
  worldviewDisplayName,
} from "@/core/model";
import {
  selectActiveCharacters,
  selectChildItems,
  selectChildPlaces,
  selectChildRaces,
  selectRootItems,
  selectRootPlaces,
  selectRootRaces,
} from "@/core/selectors";
import {
  chapterHref,
  characterHref,
  charactersHref,
  glossaryHref,
  glossaryListHref,
  itemHref,
  itemListHref,
  libraryHref,
  organizationHref,
  organizationListHref,
  placeHref,
  placeListHref,
  preferencesHref,
  raceHref,
  raceListHref,
  settingsHref,
  timelineHref,
  worldHref,
} from "@/react/links";
import { cn } from "@/lib/utils";
import { useWorldviewStore } from "@/react/useWorldviewStore";

export type WorldSection =
  | "overview"
  | "characters"
  | "organizations"
  | "places"
  | "races"
  | "items"
  | "glossary"
  | "timeline"
  | "settings";

// 펼침 가능한 카테고리(리프를 가진 것)만 여기 든다. overview·settings는 리프가 없다.
const EXPANDABLE: WorldSection[] = [
  "characters",
  "organizations",
  "places",
  "races",
  "items",
  "glossary",
  "timeline",
];

export function WorldSidebar({
  active,
  worldviewId,
  onOpenSearch,
  onNavigate,
}: {
  active: WorldSection;
  worldviewId: string;
  onOpenSearch: () => void;
  onNavigate?: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [active]: true,
  });

  if (!worldview) return null;

  const activeEntityId =
    searchParams.get("ch") ??
    searchParams.get("o") ??
    searchParams.get("p") ??
    searchParams.get("r") ??
    searchParams.get("i") ??
    searchParams.get("g") ??
    searchParams.get("c");

  const toggle = (section: WorldSection) =>
    setExpanded((current) => ({ ...current, [section]: !current[section] }));

  const rowClass = (on: boolean) =>
    cn(
      "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
      on ? "font-bold text-accent" : "text-ink hover:bg-hover",
    );
  const leafClass = (on: boolean) =>
    cn(
      "flex items-center gap-2 truncate rounded-lg py-1.5 pl-9 pr-2.5 text-sm",
      on
        ? "bg-accent-soft font-semibold text-accent"
        : "text-ink hover:bg-hover",
    );

  const Leaf = ({
    href,
    label,
    on,
  }: {
    href: string;
    label: string;
    on: boolean;
  }) => (
    <Link href={href} className={leafClass(on)} onClick={onNavigate}>
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-[2px]",
          on ? "bg-accent" : "bg-line",
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label || "-"}</span>
    </Link>
  );

  const Category = ({
    section,
    icon: Icon,
    label,
    listHref,
    children,
  }: {
    section: WorldSection;
    icon: LucideIcon;
    label: string;
    listHref: string;
    children?: React.ReactNode;
  }) => {
    const expandable = EXPANDABLE.includes(section);
    const isOpen = expanded[section] ?? false;
    return (
      <div>
        <div className="flex items-center">
          {expandable ? (
            <button
              aria-label={label}
              aria-expanded={isOpen}
              className="ml-0.5 rounded p-1 text-muted hover:text-ink"
              onClick={() => toggle(section)}
            >
              <ChevronRight
                size={14}
                aria-hidden="true"
                className={cn("transition-transform", isOpen && "rotate-90")}
              />
            </button>
          ) : (
            <span className="ml-0.5 w-6" aria-hidden="true" />
          )}
          <Link
            href={listHref}
            className={rowClass(active === section)}
            onClick={onNavigate}
          >
            <Icon size={16} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        </div>
        {expandable && isOpen && <div className="mt-0.5">{children}</div>}
      </div>
    );
  };

  const renderPlaceLeaves = (parentId: string | null, depth: number) => {
    const places =
      parentId === null
        ? selectRootPlaces(worldview)
        : selectChildPlaces(worldview, parentId);
    return places.map((place) => (
      <div key={place.id}>
        <Link
          href={placeHref(locale, worldviewId, place.id)}
          className={leafClass(activeEntityId === place.id)}
          style={depth > 0 ? { paddingLeft: `${2.25 + depth}rem` } : undefined}
          onClick={onNavigate}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-[2px]",
              activeEntityId === place.id ? "bg-accent" : "bg-line",
            )}
            aria-hidden="true"
          />
          <span className="truncate">
            {placeDisplayName(place, locale) || "-"}
          </span>
        </Link>
        {renderPlaceLeaves(place.id, depth + 1)}
      </div>
    ));
  };

  const renderRaceLeaves = (parentId: string | null, depth: number) => {
    const races =
      parentId === null
        ? selectRootRaces(worldview)
        : selectChildRaces(worldview, parentId);
    return races.map((race) => (
      <div key={race.id}>
        <Link
          href={raceHref(locale, worldviewId, race.id)}
          className={leafClass(activeEntityId === race.id)}
          style={depth > 0 ? { paddingLeft: `${2.25 + depth}rem` } : undefined}
          onClick={onNavigate}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-[2px]",
              activeEntityId === race.id ? "bg-accent" : "bg-line",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{raceDisplayName(race, locale) || "-"}</span>
        </Link>
        {renderRaceLeaves(race.id, depth + 1)}
      </div>
    ));
  };

  const renderItemLeaves = (parentId: string | null, depth: number) => {
    const items =
      parentId === null
        ? selectRootItems(worldview)
        : selectChildItems(worldview, parentId);
    return items.map((item) => (
      <div key={item.id}>
        <Link
          href={itemHref(locale, worldviewId, item.id)}
          className={leafClass(activeEntityId === item.id)}
          style={depth > 0 ? { paddingLeft: `${2.25 + depth}rem` } : undefined}
          onClick={onNavigate}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-[2px]",
              activeEntityId === item.id ? "bg-accent" : "bg-line",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{itemDisplayName(item, locale) || "-"}</span>
        </Link>
        {renderItemLeaves(item.id, depth + 1)}
      </div>
    ));
  };

  const sortedCharacters = [...selectActiveCharacters(characters)].sort(
    (first, second) =>
      characterDisplayName(first, locale).localeCompare(
        characterDisplayName(second, locale),
        locale,
      ),
  );

  return (
    <nav className="flex h-full flex-col p-3">
      <Link
        href={worldHref(locale, worldviewId)}
        className="flex items-center gap-2.5 px-2 pb-3 pt-1"
        onClick={onNavigate}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
          {(worldviewDisplayName(worldview, locale) || "-").slice(0, 1)}
        </span>
        <span className="truncate text-sm font-extrabold">
          {worldviewDisplayName(worldview, locale) || "-"}
        </span>
      </Link>

      <button
        className="mb-2 flex items-center gap-2.5 rounded-lg bg-hover px-3 py-2 text-sm text-muted hover:text-ink"
        onClick={onOpenSearch}
      >
        <Search size={16} aria-hidden="true" className="shrink-0" />
        {t("nav.search")}
      </button>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        <Category
          section="overview"
          icon={CircleDot}
          label={t("nav.overview")}
          listHref={worldHref(locale, worldviewId)}
        />
        <Category
          section="characters"
          icon={Users}
          label={t("nav.characters")}
          listHref={charactersHref(locale, worldviewId)}
        >
          {sortedCharacters.map((character) => (
            <Leaf
              key={character.id}
              href={characterHref(locale, worldviewId, character.id)}
              label={characterDisplayName(character, locale)}
              on={activeEntityId === character.id}
            />
          ))}
        </Category>
        <Category
          section="organizations"
          icon={Building2}
          label={t("nav.organizations")}
          listHref={organizationListHref(locale, worldviewId)}
        >
          {worldview.groups.map((group) => (
            <Leaf
              key={group.id}
              href={organizationHref(locale, worldviewId, group.id)}
              label={groupDisplayName(group, locale)}
              on={activeEntityId === group.id}
            />
          ))}
        </Category>
        <Category
          section="places"
          icon={MapPin}
          label={t("nav.places")}
          listHref={placeListHref(locale, worldviewId)}
        >
          {renderPlaceLeaves(null, 0)}
        </Category>
        <Category
          section="races"
          icon={Dna}
          label={t("nav.races")}
          listHref={raceListHref(locale, worldviewId)}
        >
          {renderRaceLeaves(null, 0)}
        </Category>
        <Category
          section="items"
          icon={Swords}
          label={t("nav.items")}
          listHref={itemListHref(locale, worldviewId)}
        >
          {renderItemLeaves(null, 0)}
        </Category>
        <Category
          section="glossary"
          icon={BookText}
          label={t("nav.glossary")}
          listHref={glossaryListHref(locale, worldviewId)}
        >
          {worldview.glossary.map((term) => (
            <Leaf
              key={term.id}
              href={glossaryHref(locale, worldviewId, term.id)}
              label={glossaryTermDisplayName(term, locale)}
              on={activeEntityId === term.id}
            />
          ))}
        </Category>
        <Category
          section="timeline"
          icon={Clock}
          label={t("nav.timeline")}
          listHref={timelineHref(locale, worldviewId)}
        >
          {worldview.chapters.map((chapter) => (
            <Leaf
              key={chapter.id}
              href={chapterHref(locale, worldviewId, chapter.id)}
              label={chapterDisplayName(chapter, locale)}
              on={activeEntityId === chapter.id}
            />
          ))}
        </Category>
      </div>

      <div className="mt-2 flex flex-col gap-0.5 border-t border-line pt-2">
        <Link
          href={settingsHref(locale, worldviewId)}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
            active === "settings"
              ? "font-bold text-accent"
              : "text-ink hover:bg-hover",
          )}
          onClick={onNavigate}
        >
          <Settings size={16} aria-hidden="true" className="shrink-0" />
          {t("nav.worldSettings")}
        </Link>
        <Link
          href={preferencesHref(locale)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-hover"
          onClick={onNavigate}
        >
          <SlidersHorizontal size={16} aria-hidden="true" className="shrink-0" />
          {t("nav.preferences")}
        </Link>
        <Link
          href={libraryHref(locale)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-hover"
          onClick={onNavigate}
        >
          <Library size={16} aria-hidden="true" className="shrink-0" />
          {t("nav.otherWorldviews")}
        </Link>
      </div>
    </nav>
  );
}
