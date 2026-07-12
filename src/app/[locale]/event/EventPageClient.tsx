"use client";

import { ChevronLeft, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventParticipantEditor } from "@/components/EventParticipantEditor";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  chapterDisplayName,
  characterDisplayName,
  eventDisplayTitle,
} from "@/core/model";
import { LOCALES, type Locale } from "@/locales";
import { characterHref, timelineHref, worldHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

const NO_CHAPTER = "__none__";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function EventPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const eventId = searchParams.get("e");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const [titleLocale, setTitleLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState(false);

  const event = worldview?.events.find((existing) => existing.id === eventId);
  const owner = event?.ownerCharacterId
    ? characters.find((character) => character.id === event.ownerCharacterId)
    : null;
  const backHref =
    worldview && event?.ownerCharacterId
      ? characterHref(locale, worldview.id, event.ownerCharacterId)
      : worldview
        ? timelineHref(locale, worldview.id)
        : "";

  const eventMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    !event;

  useEffect(() => {
    if (eventMissing && worldviewId) {
      router.replace(timelineHref(locale, worldviewId));
    }
  }, [eventMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (
    loadStatus !== "ready" ||
    !worldview ||
    worldview.id !== worldviewId ||
    !event
  ) {
    return null;
  }

  const deleteEvent = () => {
    dispatchCommand({ type: "remove-event", eventId: event.id });
    router.replace(backHref || worldHref(locale, worldview.id));
  };

  const isWorldEvent = event.ownerCharacterId === null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={backHref}
          className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {owner
              ? characterDisplayName(owner, locale) || "-"
              : t("event.back")}
          </span>
        </Link>
        <span className="ml-auto">
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
              {t("event.deleteEvent")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {owner && (
        <p className="mt-3 text-xs font-semibold text-accent">
          {t("event.personalOwner", {
            name: characterDisplayName(owner, locale) || "-",
          })}
        </p>
      )}

      <div className="mt-3 flex items-start gap-2">
        <Input
          className="text-2xl font-extrabold tracking-tight"
          placeholder={t("event.titlePlaceholder")}
          value={
            titleLocale !== worldview.primaryLocale
              ? (event.titleTranslations[titleLocale] ?? "")
              : event.title
          }
          onChange={(changeEvent) =>
            dispatchCommand({
              type: "set-event-title",
              eventId: event.id,
              title: changeEvent.target.value,
              locale: titleLocale,
            })
          }
        />
        <div className="pt-2">
          <LocaleTabs
            value={titleLocale}
            onChange={setTitleLocale}
            filledLocales={LOCALES.filter((availableLocale) =>
              availableLocale === worldview.primaryLocale
                ? Boolean(event.title)
                : Boolean(event.titleTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-16 shrink-0 text-sm text-muted">
            {t("event.whenLabel")}
          </span>
          <Input
            placeholder={t("event.whenPlaceholder")}
            value={event.when}
            onChange={(changeEvent) =>
              dispatchCommand({
                type: "set-event-when",
                eventId: event.id,
                when: changeEvent.target.value,
              })
            }
          />
        </div>
        {isWorldEvent && (
          <div className="flex items-center gap-2 border-b border-line py-1.5">
            <span className="w-16 shrink-0 text-sm text-muted">
              {t("event.chapterLabel")}
            </span>
            <Select
              value={event.chapterId ?? NO_CHAPTER}
              onValueChange={(value) =>
                dispatchCommand({
                  type: "set-event-chapter",
                  eventId: event.id,
                  chapterId: value === NO_CHAPTER ? null : value,
                })
              }
            >
              <SelectTrigger className="bg-hover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CHAPTER}>
                  {t("event.chapterNone")}
                </SelectItem>
                {worldview.chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapterDisplayName(chapter, locale) ||
                      t("timeline.untitledChapter")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-16 shrink-0 text-sm text-muted">
            {t("event.placeLabel")}
          </span>
          <Input
            placeholder="-"
            value={event.place}
            onChange={(changeEvent) =>
              dispatchCommand({
                type: "set-event-place",
                eventId: event.id,
                place: changeEvent.target.value,
              })
            }
          />
        </div>
      </div>

      <section className="mt-6">
        <SectionCaption>{t("event.descriptionLabel")}</SectionCaption>
        <Textarea
          className="min-h-40"
          placeholder={t("event.descriptionPlaceholder")}
          value={event.description}
          onChange={(changeEvent) =>
            dispatchCommand({
              type: "set-event-description",
              eventId: event.id,
              description: changeEvent.target.value,
            })
          }
        />
      </section>

      <section className="mt-6">
        <SectionCaption>{t("event.participantsLabel")}</SectionCaption>
        <EventParticipantEditor
          worldview={worldview}
          event={event}
          characters={characters}
        />
      </section>

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => setPendingDelete(open)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {t("event.deleteEventTitle", {
              title:
                eventDisplayTitle(event, locale) ||
                t("timeline.untitledEvent"),
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("event.deleteEventDescription")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-danger" onClick={deleteEvent}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
