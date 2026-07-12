"use client";

import { ChevronDown, X } from "lucide-react";
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
import { characterDisplayName, type Character } from "../core/model";
import { useLocale, useTranslations } from "next-intl";
import { RELATION_CONNECTOR, type Locale } from "@/locales";
import { guardedKeyDownHandler } from "../react/inputGuards";
import { dispatchCommand } from "../store/worldviewStore";
import { Avatar } from "./Avatar";

// 상대 캐릭터가 이 캐릭터를 가리키는 역관계의 인덱스 — 없으면 -1.
function reverseRelationIndex(target: Character, selfId: string): number {
  return target.relations.findIndex(
    (relation) => relation.targetCharacterId === selfId,
  );
}

// 확장 시 한 방향(주체 → 상대)의 라벨 편집 줄.
function DirectionRow({
  subjectName,
  label,
  placeholder,
  onChange,
}: {
  subjectName: string;
  label: string;
  placeholder: string;
  onChange: (label: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 truncate text-xs text-muted">
        {subjectName} →
      </span>
      <Input
        className="bg-ground"
        placeholder={placeholder}
        value={label}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function RelationEditor({
  character,
  characters,
}: {
  character: Character;
  characters: Character[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const connector = RELATION_CONNECTOR[locale];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [label, setLabel] = useState("");

  const characterById = new Map(
    characters.map((existing) => [existing.id, existing]),
  );
  const relationTargets = characters.filter(
    (candidate) => candidate.deletedAt === null && candidate.id !== character.id,
  );
  const selfName = characterDisplayName(character, locale) || "-";

  const addRelation = () => {
    if (!targetCharacterId) return;
    dispatchCommand({
      type: "add-relation",
      characterId: character.id,
      relation: { targetCharacterId, label: label.trim() },
    });
    setTargetCharacterId("");
    setLabel("");
  };

  const updateSelf = (
    relationIndex: number,
    targetId: string,
    nextLabel: string,
  ) =>
    dispatchCommand({
      type: "set-relation",
      characterId: character.id,
      relationIndex,
      relation: { targetCharacterId: targetId, label: nextLabel },
    });

  // 상대 카드의 역관계를 편집 — 없으면 생성한다.
  const updateReverse = (
    target: Character,
    reverseIndex: number,
    nextLabel: string,
  ) => {
    if (reverseIndex >= 0) {
      dispatchCommand({
        type: "set-relation",
        characterId: target.id,
        relationIndex: reverseIndex,
        relation: { targetCharacterId: character.id, label: nextLabel },
      });
      return;
    }
    dispatchCommand({
      type: "add-relation",
      characterId: target.id,
      relation: { targetCharacterId: character.id, label: nextLabel },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {character.relations.map((relation, relationIndex) => {
          const target = characterById.get(relation.targetCharacterId);
          if (!target || target.deletedAt !== null) return null;
          const targetName = characterDisplayName(target, locale) || "-";

          if (expandedIndex !== relationIndex) {
            return (
              <button
                key={`${relation.targetCharacterId}-${relationIndex}`}
                className="flex items-center gap-2 rounded-xl bg-hover py-1.5 pl-1.5 pr-3 text-left hover:bg-accent-soft"
                onClick={() => setExpandedIndex(relationIndex)}
              >
                <Avatar character={target} className="w-9 rounded-lg" />
                <span className="text-sm leading-tight">
                  <span className="block whitespace-nowrap text-xs text-muted">
                    {targetName}
                    {connector}
                  </span>
                  <b>{relation.label || "-"}</b>
                </span>
              </button>
            );
          }

          const reverseIndex = reverseRelationIndex(target, character.id);
          const reverse =
            reverseIndex >= 0 ? target.relations[reverseIndex] : null;
          return (
            <div
              key={`${relation.targetCharacterId}-${relationIndex}`}
              className="w-full rounded-xl border border-accent bg-ground p-3"
            >
              <div className="flex items-center gap-2">
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() => setExpandedIndex(null)}
                >
                  <Avatar character={target} className="w-8 rounded-lg" />
                  <b className="truncate text-sm">{targetName}</b>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                </button>
                <button
                  aria-label={t("common.delete")}
                  className="shrink-0 p-1 text-muted hover:text-danger"
                  onClick={() => {
                    setExpandedIndex(null);
                    dispatchCommand({
                      type: "remove-relation",
                      characterId: character.id,
                      relationIndex,
                    });
                  }}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2.5 flex flex-col gap-2">
                <DirectionRow
                  subjectName={selfName}
                  label={relation.label}
                  placeholder={t("character.relationLabelPlaceholder")}
                  onChange={(nextLabel) =>
                    updateSelf(
                      relationIndex,
                      relation.targetCharacterId,
                      nextLabel,
                    )
                  }
                />
                <DirectionRow
                  subjectName={targetName}
                  label={reverse?.label ?? ""}
                  placeholder={t("character.reverseRelationPlaceholder")}
                  onChange={(nextLabel) =>
                    updateReverse(target, reverseIndex, nextLabel)
                  }
                />
              </div>
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
                placeholder={t("character.relationTargetPlaceholder")}
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
          <Input
            className="min-w-28 flex-1 bg-hover"
            placeholder={t("character.relationLabelPlaceholder")}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addRelation })}
          />
          <Button size="sm" onClick={addRelation}>
            {t("character.addRelation")}
          </Button>
        </div>
      )}
    </div>
  );
}
