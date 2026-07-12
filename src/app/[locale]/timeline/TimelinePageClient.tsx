"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import {
  chapterDisplayName,
  createChapter,
  createTimelineEvent,
  eventDisplayTitle,
  worldviewDisplayName,
  type Character,
  type TimelineEvent,
} from "@/core/model";
import { selectWorldTimeline } from "@/core/selectors";
import {
  chapterHref,
  eventHref,
  libraryHref,
  settingsHref,
  worldHref,
} from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

function EventRow({
  event,
  characters,
  href,
}: {
  event: TimelineEvent;
  characters: Character[];
  href: string;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const participants = event.participants
    .map((participant) =>
      characters.find(
        (character) =>
          character.id === participant.characterId &&
          character.deletedAt === null,
      ),
    )
    .filter((character): character is Character => Boolean(character));
  return (
    <Link
      href={href}
      className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-hover"
    >
      <span className="min-w-0 flex-1">
        {event.when && (
          <span className="text-xs font-bold text-accent">{event.when}</span>
        )}
        <span className="block truncate text-sm font-semibold">
          {eventDisplayTitle(event, locale) || t("timeline.untitledEvent")}
        </span>
        {participants.length > 0 && (
          <span className="mt-1 flex">
            {participants.slice(0, 5).map((character) => (
              <Avatar
                key={character.id}
                character={character}
                className="-mr-1.5 w-6 rounded-md border-2 border-ground"
              />
            ))}
          </span>
        )}
      </span>
      <ChevronRight
        size={16}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-muted"
      />
    </Link>
  );
}

export function TimelinePageClient() {
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

  const groups = selectWorldTimeline(worldview);

  const addChapter = () => {
    const chapter = createChapter();
    dispatchCommand({ type: "add-chapter", chapter });
    router.push(chapterHref(locale, worldview.id, chapter.id));
  };

  const addEvent = (chapterId: string | null) => {
    const event = createTimelineEvent({ chapterId });
    dispatchCommand({ type: "add-event", event });
    router.push(eventHref(locale, worldview.id, event.id));
  };

  const chipClassName = (active: boolean) =>
    active
      ? "shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground"
      : "shrink-0 rounded-full bg-hover px-4 py-1.5 text-sm text-ink hover:bg-accent-soft";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={libraryHref(locale)}
          className="flex items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" />
          {t("library.title")}
        </Link>
        <span className="ml-auto">
          <SavedIndicator />
        </span>
        <Link
          href={settingsHref(locale, worldview.id)}
          aria-label={t("world.settings")}
          className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
        >
          <Settings size={19} aria-hidden="true" />
        </Link>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        {worldviewDisplayName(worldview, locale) || "-"}
      </h1>

      <div className="mt-4 flex gap-2">
        <Link
          href={worldHref(locale, worldview.id)}
          className={chipClassName(false)}
        >
          {t("timeline.tabCharacters")}
        </Link>
        <span className={chipClassName(true)}>
          {t("timeline.tabTimeline")}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          {t("timeline.empty")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-7">
          {groups.map((group) => (
            <section key={group.chapter?.id ?? "__unassigned__"}>
              <div className="flex items-baseline gap-2 border-b border-line pb-1.5">
                <h2 className="text-base font-extrabold">
                  {group.chapter
                    ? chapterDisplayName(group.chapter, locale) ||
                      t("timeline.untitledChapter")
                    : t("timeline.unassigned")}
                </h2>
                {group.chapter?.era && (
                  <span className="text-xs text-muted">{group.chapter.era}</span>
                )}
                {group.chapter && (
                  <Link
                    href={chapterHref(locale, worldview.id, group.chapter.id)}
                    className="ml-auto flex items-center gap-1 text-xs text-accent"
                  >
                    <Pencil size={12} aria-hidden="true" />
                    {t("timeline.editChapter")}
                  </Link>
                )}
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {group.events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    characters={characters}
                    href={eventHref(locale, worldview.id, event.id)}
                  />
                ))}
              </div>
              {group.chapter && (
                <button
                  className="mt-2 flex items-center gap-1 px-2 text-xs font-bold text-accent hover:underline"
                  onClick={() => addEvent(group.chapter?.id ?? null)}
                >
                  <Plus size={13} aria-hidden="true" />
                  {t("timeline.addEventToChapter")}
                </button>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line py-2.5 text-sm font-bold text-accent hover:bg-accent-soft"
          onClick={addChapter}
        >
          <Plus size={16} aria-hidden="true" />
          {t("timeline.addChapter")}
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line py-2.5 text-sm font-bold text-accent hover:bg-accent-soft"
          onClick={() => addEvent(null)}
        >
          <Plus size={16} aria-hidden="true" />
          {t("timeline.addEvent")}
        </button>
      </div>
    </div>
  );
}
