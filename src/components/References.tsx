"use client";

import { Plus, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  createReference,
  ENTITY_KINDS,
  entityDisplayName,
  listEntities,
  type Character,
  type EntityKind,
  type Worldview,
} from "@/core/model";
import {
  selectIncomingReferences,
  selectOutgoingReferences,
} from "@/core/selectors";
import { ENTITY_KIND_UI } from "@/react/entityLinks";
import type { Locale } from "@/locales";
import { dispatchCommand } from "@/store/worldviewStore";

function entityKindLabelKey(kind: EntityKind) {
  return `entityKind.${kind}` as
    | "entityKind.character"
    | "entityKind.group"
    | "entityKind.place"
    | "entityKind.race"
    | "entityKind.glossary"
    | "entityKind.chapter"
    | "entityKind.event";
}

function EntityLink({
  icon: Icon,
  href,
  name,
}: {
  icon: LucideIcon;
  href: string;
  name: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-1.5 text-sm font-semibold hover:text-accent"
    >
      <Icon size={14} aria-hidden="true" className="shrink-0 text-muted" />
      <span className="truncate">{name || "-"}</span>
    </Link>
  );
}

// 엔티티 상호참조(관계) 패널 — 나가는 연결(추가·라벨·삭제)과 들어오는 연결(백링크)을 한 곳에서.
// 어떤 엔티티 상세에서든 재사용한다. 참조는 worldview.references(독립 컬렉션)에 산다.
export function References({
  worldview,
  characters,
  kind,
  id,
}: {
  worldview: Worldview;
  characters: Character[];
  kind: EntityKind;
  id: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [targetKind, setTargetKind] = useState<EntityKind>("character");
  const [targetId, setTargetId] = useState("");
  const [label, setLabel] = useState("");
  const [reverseLabel, setReverseLabel] = useState("");

  const nameOf = (entityKind: EntityKind, entityId: string) =>
    entityDisplayName(entityKind, worldview, characters, entityId, locale);

  const outgoing = selectOutgoingReferences(worldview, kind, id).filter(
    (reference) => nameOf(reference.targetKind, reference.targetId) !== null,
  );
  const incoming = selectIncomingReferences(worldview, kind, id).filter(
    (reference) => nameOf(reference.sourceKind, reference.sourceId) !== null,
  );
  const candidates = listEntities(targetKind, worldview, characters, locale).filter(
    (option) => !(targetKind === kind && option.id === id),
  );

  const addReference = () => {
    if (!targetId) return;
    dispatchCommand({
      type: "add-reference",
      reference: createReference(kind, id, targetKind, targetId, label.trim()),
    });
    if (reverseLabel.trim())
      dispatchCommand({
        type: "add-reference",
        reference: createReference(
          targetKind,
          targetId,
          kind,
          id,
          reverseLabel.trim(),
        ),
      });
    setTargetId("");
    setLabel("");
    setReverseLabel("");
  };

  return (
    <div className="flex flex-col gap-3">
      {outgoing.length > 0 && (
        <div className="flex flex-col">
          {outgoing.map((reference) => {
            const ui = ENTITY_KIND_UI[reference.targetKind];
            return (
              <div
                key={reference.id}
                className="flex items-center gap-2 border-b border-line py-2"
              >
                <div className="min-w-0 flex-1">
                  <EntityLink
                    icon={ui.icon}
                    href={ui.href(locale, worldview.id, reference.targetId)}
                    name={nameOf(reference.targetKind, reference.targetId) || "-"}
                  />
                </div>
                <Input
                  className="w-28 shrink-0 bg-hover sm:w-36"
                  placeholder={t("reference.labelPlaceholder")}
                  value={reference.label}
                  onChange={(event) =>
                    dispatchCommand({
                      type: "set-reference-label",
                      referenceId: reference.id,
                      label: event.target.value,
                    })
                  }
                />
                <button
                  aria-label={t("common.delete")}
                  className="shrink-0 rounded p-1 text-muted hover:text-danger"
                  onClick={() =>
                    dispatchCommand({
                      type: "remove-reference",
                      referenceId: reference.id,
                    })
                  }
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={targetKind}
          onValueChange={(value) => {
            setTargetKind(value as EntityKind);
            setTargetId("");
          }}
        >
          <SelectTrigger className="w-28 bg-hover">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_KINDS.map((entityKind) => (
              <SelectItem key={entityKind} value={entityKind}>
                {t(entityKindLabelKey(entityKind))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={targetId || undefined} onValueChange={setTargetId}>
          <SelectTrigger className="min-w-36 flex-1 bg-hover">
            <SelectValue placeholder={t("reference.pick")} />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name || "-"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-28 bg-hover"
          placeholder={t("reference.labelPlaceholder")}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <Input
          className="w-28 bg-hover"
          placeholder={t("reference.reverseLabelPlaceholder")}
          value={reverseLabel}
          onChange={(event) => setReverseLabel(event.target.value)}
        />
        <Button size="sm" disabled={!targetId} onClick={addReference}>
          <Plus size={15} aria-hidden="true" />
          {t("reference.add")}
        </Button>
      </div>

      {incoming.length > 0 && (
        <div>
          <div className="mb-1 mt-1 text-xs font-bold tracking-wide text-muted">
            {t("reference.backlinksTitle")}
          </div>
          <div className="flex flex-col">
            {incoming.map((reference) => {
              const ui = ENTITY_KIND_UI[reference.sourceKind];
              return (
                <div
                  key={reference.id}
                  className="flex items-center gap-2 border-b border-line py-2"
                >
                  <div className="min-w-0 flex-1">
                    <EntityLink
                      icon={ui.icon}
                      href={ui.href(locale, worldview.id, reference.sourceId)}
                      name={
                        nameOf(reference.sourceKind, reference.sourceId) || "-"
                      }
                    />
                  </div>
                  {reference.label && (
                    <span className="shrink-0 rounded-full bg-hover px-2.5 py-0.5 text-xs text-muted">
                      {reference.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
