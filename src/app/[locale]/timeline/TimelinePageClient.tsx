"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  EllipsisVertical,
  Pencil,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  chapterDisplayName,
  createChapter,
  createTimelineEvent,
  eventDisplayTitle,
  worldviewDisplayName,
  type Character,
  type Chapter,
  type TimelineEvent,
  type Worldview,
} from "@/core/model";
import { eventMoveTargetIndex, selectWorldTimeline } from "@/core/selectors";
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

function ReorderButtons({
  onUp,
  onDown,
  upLabel,
  downLabel,
}: {
  onUp: (() => void) | null;
  onDown: (() => void) | null;
  upLabel: string;
  downLabel: string;
}) {
  return (
    <div className="flex flex-col">
      <button
        aria-label={upLabel}
        disabled={!onUp}
        className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
        onClick={() => onUp?.()}
      >
        <ChevronUp size={15} aria-hidden="true" />
      </button>
      <button
        aria-label={downLabel}
        disabled={!onDown}
        className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
        onClick={() => onDown?.()}
      >
        <ChevronDown size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function EventRow({
  event,
  worldview,
  characters,
  siblings,
  index,
  groupChapterId,
}: {
  event: TimelineEvent;
  worldview: Worldview;
  characters: Character[];
  siblings: TimelineEvent[];
  index: number;
  groupChapterId: string | null;
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

  const move = (direction: -1 | 1) => {
    const targetIndex = eventMoveTargetIndex(
      worldview.events,
      siblings,
      event.id,
      direction,
    );
    if (targetIndex === null) return;
    dispatchCommand({ type: "move-event", eventId: event.id, targetIndex });
  };

  const moveTargets = worldview.chapters.filter(
    (chapter) => chapter.id !== groupChapterId,
  );
  const showMenu = moveTargets.length > 0 || groupChapterId !== null;

  return (
    <div className="flex items-center gap-1">
      <ReorderButtons
        onUp={index > 0 ? () => move(-1) : null}
        onDown={index < siblings.length - 1 ? () => move(1) : null}
        upLabel={t("timeline.moveUp")}
        downLabel={t("timeline.moveDown")}
      />
      <Link
        href={eventHref(locale, worldview.id, event.id)}
        className="flex min-w-0 flex-1 items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-hover"
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
        {event.ownerCharacterId !== null && (
          <span className="mt-0.5 shrink-0 rounded-full bg-hover px-2 py-0.5 text-xs font-semibold text-muted">
            {t("timeline.badgePersonal")}
          </span>
        )}
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-muted"
        />
      </Link>
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("timeline.moveToChapter")}
            className="rounded-lg p-1.5 text-muted outline-none hover:bg-hover hover:text-ink"
          >
            <EllipsisVertical size={17} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {groupChapterId !== null && (
              <DropdownMenuItem
                onSelect={() =>
                  dispatchCommand({
                    type: "set-event-chapter",
                    eventId: event.id,
                    chapterId: null,
                  })
                }
              >
                {t("timeline.unassigned")}
              </DropdownMenuItem>
            )}
            {moveTargets.map((chapter) => (
              <DropdownMenuItem
                key={chapter.id}
                onSelect={() =>
                  dispatchCommand({
                    type: "set-event-chapter",
                    eventId: event.id,
                    chapterId: chapter.id,
                  })
                }
              >
                {chapterDisplayName(chapter, locale) ||
                  t("timeline.untitledChapter")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const groups = selectWorldTimeline(worldview);

  const toggleCollapsed = (key: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const moveChapter = (chapter: Chapter, direction: -1 | 1) => {
    const currentIndex = worldview.chapters.findIndex(
      (existing) => existing.id === chapter.id,
    );
    const swapWith = worldview.chapters[currentIndex + direction];
    if (!swapWith) return;
    const withoutChapter = worldview.chapters.filter(
      (existing) => existing.id !== chapter.id,
    );
    const swapIndex = withoutChapter.findIndex(
      (existing) => existing.id === swapWith.id,
    );
    dispatchCommand({
      type: "move-chapter",
      chapterId: chapter.id,
      targetIndex: direction > 0 ? swapIndex + 1 : swapIndex,
    });
  };

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
    <div className="mx-auto max-w-page px-4 pb-28 pt-6 sm:px-6">
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
        <Link href={worldHref(locale, worldview.id)} className={chipClassName(false)}>
          {t("timeline.tabCharacters")}
        </Link>
        <span className={chipClassName(true)}>{t("timeline.tabTimeline")}</span>
      </div>

      {groups.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          {t("timeline.empty")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-7">
          {groups.map((group, groupIndex) => {
            const key = group.chapter?.id ?? "__unassigned__";
            const isCollapsed = collapsed.has(key);
            return (
              <section key={key}>
                <div className="flex items-center gap-1 border-b border-line pb-1.5">
                  <button
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg py-1 pr-2 text-left hover:text-ink"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleCollapsed(key)}
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-muted"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-muted"
                      />
                    )}
                    <h2 className="truncate text-base font-extrabold">
                      {group.chapter
                        ? chapterDisplayName(group.chapter, locale) ||
                          t("timeline.untitledChapter")
                        : t("timeline.unassigned")}
                    </h2>
                    {group.chapter?.era && (
                      <span className="shrink-0 text-xs text-muted">
                        {group.chapter.era}
                      </span>
                    )}
                  </button>
                  {group.chapter && (
                    <ReorderButtons
                      onUp={
                        groupIndex > 0
                          ? () => moveChapter(group.chapter as Chapter, -1)
                          : null
                      }
                      onDown={
                        groupIndex < worldview.chapters.length - 1
                          ? () => moveChapter(group.chapter as Chapter, 1)
                          : null
                      }
                      upLabel={t("timeline.moveUp")}
                      downLabel={t("timeline.moveDown")}
                    />
                  )}
                  {group.chapter && (
                    <Link
                      href={chapterHref(locale, worldview.id, group.chapter.id)}
                      className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-accent hover:bg-accent-soft"
                    >
                      <Pencil size={12} aria-hidden="true" />
                      {t("timeline.editChapter")}
                    </Link>
                  )}
                </div>

                {!isCollapsed && (
                  <>
                    <div className="mt-2 flex flex-col gap-1">
                      {group.events.map((event, eventIndex) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          worldview={worldview}
                          characters={characters}
                          siblings={group.events}
                          index={eventIndex}
                          groupChapterId={group.chapter?.id ?? null}
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
                  </>
                )}
              </section>
            );
          })}
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
