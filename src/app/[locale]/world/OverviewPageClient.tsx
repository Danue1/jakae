"use client";

import {
  BookText,
  Building2,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
import {
  characterDisplayName,
  createCharacter,
  worldviewDisplayName,
  worldviewDisplaySynopsis,
} from "@/core/model";
import {
  selectActiveCharacters,
  worldviewPreviewCharacters,
} from "@/core/selectors";
import {
  characterHref,
  charactersHref,
  glossaryListHref,
  organizationListHref,
  placeListHref,
  settingsHref,
  timelineHref,
} from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

export function OverviewPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const synopsis = worldviewDisplaySynopsis(worldview, locale);
  const recent = worldviewPreviewCharacters(characters);
  const activeCount = selectActiveCharacters(characters).length;
  const paletteColors = worldview.palette.map((entry) => entry.color);
  const coverBackground =
    paletteColors.length >= 2
      ? `linear-gradient(120deg, ${paletteColors.slice(0, 4).join(", ")})`
      : "linear-gradient(120deg, #7f9bc9, #3e6db5 60%, #2c4f86)";

  const addCharacter = () => {
    const character = createCharacter(worldview.id);
    dispatchCommand({ type: "create-character", character });
    router.push(characterHref(locale, worldview.id, character.id));
  };

  const jumps: { icon: LucideIcon; label: string; href: string }[] = [
    {
      icon: Users,
      label: t("nav.characters"),
      href: charactersHref(locale, worldview.id),
    },
    {
      icon: Building2,
      label: t("nav.organizations"),
      href: organizationListHref(locale, worldview.id),
    },
    {
      icon: MapPin,
      label: t("nav.places"),
      href: placeListHref(locale, worldview.id),
    },
    {
      icon: BookText,
      label: t("nav.glossary"),
      href: glossaryListHref(locale, worldview.id),
    },
    {
      icon: Clock,
      label: t("nav.timeline"),
      href: timelineHref(locale, worldview.id),
    },
    {
      icon: Pencil,
      label: t("nav.worldSettings"),
      href: settingsHref(locale, worldview.id),
    },
  ];

  return (
    <WorldShell active="overview" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
        <div className="mb-3 hidden justify-end lg:flex">
          <SavedIndicator />
        </div>

        <div
          className="h-28 rounded-2xl sm:h-32"
          style={{ background: coverBackground }}
          aria-hidden="true"
        />

        <div className="-mt-8 flex items-end gap-4 px-1">
          <span
            className="grid size-20 shrink-0 place-items-center rounded-2xl border-[3px] border-ground text-2xl font-extrabold text-accent-foreground shadow-popover"
            style={{ background: coverBackground }}
          >
            {(worldviewDisplayName(worldview, locale) || "-").slice(0, 1)}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2 pb-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">
              {worldviewDisplayName(worldview, locale) || "-"}
            </h1>
            <Link
              href={settingsHref(locale, worldview.id)}
              className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg bg-hover px-3 py-1.5 text-sm font-semibold text-ink hover:bg-accent-soft hover:text-accent"
            >
              <Pencil size={14} aria-hidden="true" />
              {t("overview.editOverview")}
            </Link>
          </div>
        </div>

        {(worldview.genreTags.length > 0 || worldview.era) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {worldview.era && (
              <span className="rounded-full bg-hover px-3 py-1 text-xs text-muted">
                {t("world.eraPrefix")} {worldview.era}
              </span>
            )}
            {worldview.genreTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-hover px-3 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 max-w-prose text-sm text-muted">
          {synopsis || t("overview.synopsisEmpty")}
        </p>

        {worldview.palette.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2.5 text-xs font-bold tracking-wide text-muted">
              {t("overview.paletteTitle")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {worldview.palette.map((entry) => (
                <span
                  key={entry.id}
                  className="size-8 rounded-lg border border-line"
                  style={{ background: entry.color }}
                  title={entry.role || undefined}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-2.5 text-xs font-bold tracking-wide text-muted">
            {t("overview.recentTitle")}
          </h2>
          {activeCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
              <p className="text-sm font-bold">{t("overview.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted">
                {t("overview.emptyBody")}
              </p>
              <button
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
                onClick={addCharacter}
              >
                <Plus size={16} aria-hidden="true" />
                {t("overview.addCharacter")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recent.map((character) => (
                <Link
                  key={character.id}
                  href={characterHref(locale, worldview.id, character.id)}
                  className="flex items-center gap-2.5 rounded-xl bg-hover p-2 hover:bg-accent-soft"
                >
                  <Avatar character={character} className="w-9 shrink-0" />
                  <span className="truncate text-sm font-semibold">
                    {characterDisplayName(character, locale) || "-"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-2.5 text-xs font-bold tracking-wide text-muted">
            {t("overview.jumpTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {jumps.map((jump) => (
              <Link
                key={jump.href}
                href={jump.href}
                className="flex items-center gap-3 rounded-xl bg-hover px-4 py-3.5 hover:bg-accent-soft"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ground text-accent">
                  <jump.icon size={17} aria-hidden="true" />
                </span>
                <span className="truncate text-sm font-bold">{jump.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WorldShell>
  );
}
