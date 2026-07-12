"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Character } from "../core/model";
import { useTranslations } from "next-intl";
import { guardedKeyDownHandler } from "../react/inputGuards";
import { dispatchCommand } from "../store/worldviewStore";

export function TagEditor({ character }: { character: Character }) {
  const t = useTranslations();
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const tag = draft.trim().replace(/,+$/, "");
    setDraft("");
    if (!tag || character.personalityTags.includes(tag)) return;
    dispatchCommand({
      type: "set-personality-tags",
      characterId: character.id,
      personalityTags: [...character.personalityTags, tag],
    });
  };

  const removeTag = (tag: string) =>
    dispatchCommand({
      type: "set-personality-tags",
      characterId: character.id,
      personalityTags: character.personalityTags.filter(
        (existing) => existing !== tag,
      ),
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {character.personalityTags.map((tag) => (
        <Badge key={tag} className="py-1 text-sm">
          {tag}
          <button
            aria-label={`${tag} · ${t("common.delete")}`}
            className="-my-2 -mr-2 p-2 opacity-60 hover:opacity-100"
            onClick={() => removeTag(tag)}
          >
            <X size={13} aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <Input
        className="min-w-32 flex-1"
        placeholder={t("character.tagPlaceholder")}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={guardedKeyDownHandler({
          Enter: (event) => {
            event.preventDefault();
            commitDraft();
          },
          ",": (event) => {
            event.preventDefault();
            commitDraft();
          },
          " ": (event) => {
            event.preventDefault();
            commitDraft();
          },
        })}
      />
    </div>
  );
}
