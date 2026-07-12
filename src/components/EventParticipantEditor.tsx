"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  characterDisplayName,
  type Character,
  type TimelineEvent,
  type Worldview,
} from "@/core/model";
import { useLocale, useTranslations } from "next-intl";
import { characterHref } from "@/react/links";
import { guardedKeyDownHandler } from "@/react/inputGuards";
import { dispatchCommand } from "@/store/worldviewStore";

export function EventParticipantEditor({
  worldview,
  event,
  characters,
}: {
  worldview: Worldview;
  event: TimelineEvent;
  characters: Character[];
}) {
  const locale = useLocale();
  const t = useTranslations();
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [role, setRole] = useState("");

  const characterById = new Map(
    characters.map((existing) => [existing.id, existing]),
  );
  const participantIds = new Set(
    event.participants.map((participant) => participant.characterId),
  );
  const candidates = characters.filter(
    (candidate) =>
      candidate.deletedAt === null && !participantIds.has(candidate.id),
  );

  const addParticipant = () => {
    if (!targetCharacterId) return;
    dispatchCommand({
      type: "add-event-participant",
      eventId: event.id,
      participant: { characterId: targetCharacterId, role: role.trim() },
    });
    setTargetCharacterId("");
    setRole("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {event.participants.map((participant, participantIndex) => {
        const target = characterById.get(participant.characterId);
        if (!target || target.deletedAt !== null) return null;
        return (
          <div
            key={`${participant.characterId}-${participantIndex}`}
            className="group flex items-center gap-2 rounded-xl bg-hover py-1.5 pl-1.5 pr-2"
          >
            <Link
              href={characterHref(locale, worldview.id, target.id)}
              className="flex min-w-0 items-center gap-2"
            >
              <Avatar subject={target} className="w-9 rounded-lg" />
              <span className="min-w-0 truncate text-xs text-muted">
                {characterDisplayName(target, locale) || "-"}
              </span>
            </Link>
            <Input
              className="ml-auto max-w-40 bg-ground"
              placeholder={t("event.rolePlaceholder")}
              value={participant.role}
              onChange={(changeEvent) =>
                dispatchCommand({
                  type: "set-event-participant-role",
                  eventId: event.id,
                  participantIndex,
                  role: changeEvent.target.value,
                })
              }
            />
            <button
              aria-label="✕"
              className="text-muted opacity-60 hover:text-danger group-hover:opacity-100"
              onClick={() =>
                dispatchCommand({
                  type: "remove-event-participant",
                  eventId: event.id,
                  participantIndex,
                })
              }
            >
              ✕
            </button>
          </div>
        );
      })}
      {candidates.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Select
            value={targetCharacterId || undefined}
            onValueChange={setTargetCharacterId}
          >
            <SelectTrigger className="bg-hover py-1.5">
              <SelectValue
                placeholder={t("event.participantSelectPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {characterDisplayName(candidate, locale) || "-"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="min-w-28 flex-1 bg-hover"
            placeholder={t("event.rolePlaceholder")}
            value={role}
            onChange={(changeEvent) => setRole(changeEvent.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addParticipant })}
          />
          <Button size="sm" onClick={addParticipant}>
            {t("event.addParticipant")}
          </Button>
        </div>
      )}
    </div>
  );
}
