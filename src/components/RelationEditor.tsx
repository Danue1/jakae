"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { characterDisplayName, type Character, type Worldview } from "../core/model";
import { characterHref } from "../react/links";
import { guardedKeyDownHandler } from "../react/inputGuards";
import { useLocale } from "../react/localeContext";
import { dispatchCommand } from "../store/worldviewStore";
import { Avatar } from "./Avatar";

export function RelationEditor({
  worldview,
  character,
  characters,
}: {
  worldview: Worldview;
  character: Character;
  characters: Character[];
}) {
  const { locale, dictionary } = useLocale();
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [connector, setConnector] = useState(worldview.connectors[0] ?? "");
  const [label, setLabel] = useState("");

  const characterById = new Map(
    characters.map((existing) => [existing.id, existing]),
  );
  const relationTargets = characters.filter(
    (candidate) =>
      candidate.deletedAt === null && candidate.id !== character.id,
  );

  const addRelation = () => {
    if (!targetCharacterId) return;
    dispatchCommand({
      type: "add-relation",
      characterId: character.id,
      relation: { targetCharacterId, connector, label: label.trim() },
    });
    setTargetCharacterId("");
    setLabel("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {character.relations.map((relation, relationIndex) => {
          const target = characterById.get(relation.targetCharacterId);
          if (!target || target.deletedAt !== null) return null;
          return (
            <div
              key={`${relation.targetCharacterId}-${relationIndex}`}
              className="group flex items-center gap-2 rounded-xl bg-hover py-1.5 pl-1.5 pr-2.5"
            >
              <Link
                href={characterHref(locale, worldview.id, target.id)}
                className="flex items-center gap-2"
              >
                <Avatar character={target} className="w-9 rounded-lg" />
                <span className="text-sm leading-tight">
                  <span className="block whitespace-nowrap text-xs text-muted">
                    {characterDisplayName(target, locale) || "-"}
                    {relation.connector}
                  </span>
                  <b>{relation.label || "-"}</b>
                </span>
              </Link>
              <button
                aria-label="✕"
                className="text-muted opacity-60 hover:text-danger group-hover:opacity-100"
                onClick={() =>
                  dispatchCommand({
                    type: "remove-relation",
                    characterId: character.id,
                    relationIndex,
                  })
                }
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      {relationTargets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Select
            value={targetCharacterId || undefined}
            onValueChange={setTargetCharacterId}
          >
            <SelectTrigger className="bg-hover py-1.5">
              <SelectValue
                placeholder={dictionary.character.relationTargetPlaceholder}
              />
            </SelectTrigger>
            <SelectContent>
              {relationTargets.map((target) => (
                <SelectItem key={target.id} value={target.id}>
                  {characterDisplayName(target, locale) || "-"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {worldview.connectors.length > 0 && (
            <Select value={connector} onValueChange={setConnector}>
              <SelectTrigger className="bg-hover py-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {worldview.connectors.map((connectorOption) => (
                  <SelectItem key={connectorOption} value={connectorOption}>
                    {connectorOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            className="min-w-28 flex-1 bg-hover"
            placeholder={dictionary.character.relationLabelPlaceholder}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addRelation })}
          />
          <Button size="sm" onClick={addRelation}>
            {dictionary.character.addRelation}
          </Button>
        </div>
      )}
    </div>
  );
}
