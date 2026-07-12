"use client";

import { ChevronDown, ChevronRight, ChevronUp, EllipsisVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createTimelineEvent,
  eventDisplayTitle,
  type Character,
  type TimelineEvent,
  type Worldview,
} from "@/core/model";
import { eventMoveTargetIndex, selectCharacterTimeline } from "@/core/selectors";
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

  const move = (event: TimelineEvent, direction: -1 | 1) => {
    const targetIndex = eventMoveTargetIndex(
      worldview.events,
      events,
      event.id,
      direction,
    );
    if (targetIndex === null) return;
    dispatchCommand({ type: "move-event", eventId: event.id, targetIndex });
  };

  // 개인→세계관: 이 자캐를 참여자로 보존해 개인 연표에서 사라지지 않게 한다.
  const makeWorld = (event: TimelineEvent) => {
    dispatchCommand({
      type: "set-event-owner",
      eventId: event.id,
      ownerCharacterId: null,
    });
    if (
      !event.participants.some(
        (participant) => participant.characterId === character.id,
      )
    ) {
      dispatchCommand({
        type: "add-event-participant",
        eventId: event.id,
        participant: { characterId: character.id, role: "" },
      });
    }
  };

  const makePersonal = (event: TimelineEvent) => {
    dispatchCommand({
      type: "set-event-owner",
      eventId: event.id,
      ownerCharacterId: character.id,
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {events.map((event, index) => {
        const isPersonal = event.ownerCharacterId !== null;
        return (
          <div key={event.id} className="flex items-start gap-1.5">
            <div className="flex flex-col pt-0.5">
              <button
                aria-label={t("timeline.moveUp")}
                disabled={index === 0}
                className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                onClick={() => move(event, -1)}
              >
                <ChevronUp size={15} aria-hidden="true" />
              </button>
              <button
                aria-label={t("timeline.moveDown")}
                disabled={index === events.length - 1}
                className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                onClick={() => move(event, 1)}
              >
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <Input
                className="text-xs font-bold text-accent placeholder:font-normal placeholder:text-muted"
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
              <Link
                href={eventHref(locale, worldview.id, event.id)}
                className="mt-0.5 flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-hover"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {eventDisplayTitle(event, locale) ||
                    t("timeline.untitledEvent")}
                </span>
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-muted"
                />
              </Link>
            </div>

            <span
              className={
                isPersonal
                  ? "mt-1.5 shrink-0 rounded-full bg-hover px-2 py-0.5 text-xs font-semibold text-muted"
                  : "mt-1.5 shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent"
              }
            >
              {isPersonal
                ? t("timeline.badgePersonal")
                : t("timeline.badgeWorld")}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t("common.more")}
                className="mt-0.5 rounded-lg p-1.5 text-muted outline-none hover:bg-hover hover:text-ink"
              >
                <EllipsisVertical size={17} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {isPersonal ? (
                  <DropdownMenuItem onSelect={() => makeWorld(event)}>
                    {t("timeline.makeWorldEvent")}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => makePersonal(event)}>
                    {t("timeline.makePersonalEvent")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
