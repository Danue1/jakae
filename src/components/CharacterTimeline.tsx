"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createTimelineEvent,
  eventDisplayTitle,
  type Character,
  type Worldview,
} from "@/core/model";
import { selectCharacterTimeline } from "@/core/selectors";
import { useLocale, useTranslations } from "next-intl";
import { eventHref } from "@/react/links";
import { dispatchCommand } from "@/store/worldviewStore";

export function CharacterTimeline({
  worldview,
  character,
}: {
  worldview: Worldview;
  character: Character;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const events = selectCharacterTimeline(worldview, character.id);

  const addEvent = () => {
    const event = createTimelineEvent({ ownerCharacterId: character.id });
    dispatchCommand({ type: "add-event", event });
    router.push(eventHref(locale, worldview.id, event.id));
  };

  return (
    <div className="flex flex-col gap-1">
      {events.map((event) => {
        const isPersonal = event.ownerCharacterId !== null;
        return (
          <Link
            key={event.id}
            href={eventHref(locale, worldview.id, event.id)}
            className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-hover"
          >
            <span className="min-w-0 flex-1">
              {event.when && (
                <span className="text-xs font-bold text-accent">
                  {event.when}
                </span>
              )}
              <span className="block truncate text-sm font-semibold">
                {eventDisplayTitle(event, locale) ||
                  t("timeline.untitledEvent")}
              </span>
            </span>
            <span
              className={
                isPersonal
                  ? "shrink-0 rounded-full bg-hover px-2 py-0.5 text-xs font-semibold text-muted"
                  : "shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent"
              }
            >
              {isPersonal
                ? t("timeline.badgePersonal")
                : t("timeline.badgeWorld")}
            </span>
            <ChevronRight
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-muted"
            />
          </Link>
        );
      })}
      <button
        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line py-2.5 text-sm font-bold text-accent hover:bg-accent-soft"
        onClick={addEvent}
      >
        <Plus size={16} aria-hidden="true" />
        {t("timeline.addEvent")}
      </button>
    </div>
  );
}
