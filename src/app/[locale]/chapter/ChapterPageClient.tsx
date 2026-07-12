"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  EllipsisVertical,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  chapterDisplayName,
  createTimelineEvent,
  eventDisplayTitle,
} from "@/core/model";
import { eventMoveTargetIndex } from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import { eventHref, timelineHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function ChapterPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const chapterId = searchParams.get("c");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState(false);

  const chapter = worldview?.chapters.find(
    (existing) => existing.id === chapterId,
  );

  const chapterMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    !chapter;

  useEffect(() => {
    if (chapterMissing && worldviewId) {
      router.replace(timelineHref(locale, worldviewId));
    }
  }, [chapterMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (
    loadStatus !== "ready" ||
    !worldview ||
    worldview.id !== worldviewId ||
    !chapter
  ) {
    return null;
  }

  const chapterEvents = worldview.events.filter(
    (event) => event.chapterId === chapter.id,
  );

  const addEvent = () => {
    const event = createTimelineEvent({ chapterId: chapter.id });
    dispatchCommand({ type: "add-event", event });
    router.push(eventHref(locale, worldview.id, event.id));
  };

  const moveEvent = (eventId: string, direction: -1 | 1) => {
    const targetIndex = eventMoveTargetIndex(
      worldview.events,
      chapterEvents,
      eventId,
      direction,
    );
    if (targetIndex === null) return;
    dispatchCommand({ type: "move-event", eventId, targetIndex });
  };

  const deleteChapter = () => {
    dispatchCommand({ type: "remove-chapter", chapterId: chapter.id });
    router.replace(timelineHref(locale, worldview.id));
  };

  return (
    <WorldShell active="timeline" worldviewId={worldview.id}>
    <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={timelineHref(locale, worldview.id)}
          className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{t("chapter.back")}</span>
        </Link>
        <span className="ml-auto hidden lg:block">
          <SavedIndicator />
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("common.more")}
            className="rounded-lg p-2 text-muted outline-none hover:bg-hover hover:text-ink"
          >
            <EllipsisVertical size={19} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-danger"
              onSelect={() => setPendingDelete(true)}
            >
              {t("chapter.deleteChapter")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <Input
          className="text-2xl font-extrabold tracking-tight"
          placeholder={t("chapter.namePlaceholder")}
          value={
            nameLocale !== worldview.primaryLocale
              ? (chapter.nameTranslations[nameLocale] ?? "")
              : chapter.name
          }
          onChange={(changeEvent) =>
            dispatchCommand({
              type: "rename-chapter",
              chapterId: chapter.id,
              name: changeEvent.target.value,
              locale: nameLocale,
            })
          }
        />
        <div className="pt-2">
          <LocaleTabs
            value={nameLocale}
            onChange={setNameLocale}
            filledLocales={LOCALES.filter((availableLocale) =>
              availableLocale === worldview.primaryLocale
                ? Boolean(chapter.name)
                : Boolean(chapter.nameTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-b border-line py-1.5">
        <span className="w-16 shrink-0 text-sm text-muted">
          {t("chapter.eraLabel")}
        </span>
        <Input
          placeholder={t("chapter.eraPlaceholder")}
          value={chapter.era}
          onChange={(changeEvent) =>
            dispatchCommand({
              type: "set-chapter-era",
              chapterId: chapter.id,
              era: changeEvent.target.value,
            })
          }
        />
      </div>

      <section className="mt-6">
        <SectionCaption>{t("chapter.descriptionLabel")}</SectionCaption>
        <Textarea
          placeholder={t("chapter.descriptionPlaceholder")}
          value={chapter.description}
          onChange={(changeEvent) =>
            dispatchCommand({
              type: "set-chapter-description",
              chapterId: chapter.id,
              description: changeEvent.target.value,
            })
          }
        />
      </section>

      <section className="mt-6">
        <SectionCaption>{t("chapter.eventsLabel")}</SectionCaption>
        {chapterEvents.length === 0 ? (
          <p className="py-2 text-sm text-muted">
            {t("chapter.eventsEmpty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {chapterEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2 py-2"
              >
                <div className="flex flex-col">
                  <button
                    aria-label={t("chapter.moveUp")}
                    disabled={index === 0}
                    className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                    onClick={() => moveEvent(event.id, -1)}
                  >
                    <ChevronUp size={15} aria-hidden="true" />
                  </button>
                  <button
                    aria-label={t("chapter.moveDown")}
                    disabled={index === chapterEvents.length - 1}
                    className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                    onClick={() => moveEvent(event.id, 1)}
                  >
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                </div>
                <Link
                  href={eventHref(locale, worldview.id, event.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 hover:bg-hover"
                >
                  {event.when && (
                    <span className="shrink-0 text-xs font-bold text-accent">
                      {event.when}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {eventDisplayTitle(event, locale) ||
                      t("timeline.untitledEvent")}
                  </span>
                  {event.ownerCharacterId !== null && (
                    <span className="shrink-0 rounded-full bg-hover px-2 py-0.5 text-xs font-semibold text-muted">
                      {t("timeline.badgePersonal")}
                    </span>
                  )}
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
        <button
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line py-2.5 text-sm font-bold text-accent hover:bg-accent-soft"
          onClick={addEvent}
        >
          <Plus size={16} aria-hidden="true" />
          {t("chapter.addEvent")}
        </button>
      </section>

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => setPendingDelete(open)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {t("chapter.deleteChapterTitle", {
              name:
                chapterDisplayName(chapter, locale) ||
                t("timeline.untitledChapter"),
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("chapter.deleteChapterDescription")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-danger" onClick={deleteChapter}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </WorldShell>
  );
}
