"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Character, Item } from "../core/model";
import type { WorldviewCommand } from "../core/commands";
import { dispatchCommand } from "../store/worldviewStore";
import { PRESET_BACKGROUND_COLORS } from "./Avatar";

// 배경색은 캐릭터·아이템 모두 appearance.backgroundColor에 있고 커맨드 계열만 다르다.
export type BackgroundTarget =
  | { kind: "character"; character: Character }
  | { kind: "item"; item: Item };

function backgroundColorOf(target: BackgroundTarget): string | null {
  return target.kind === "character"
    ? target.character.appearance.backgroundColor
    : target.item.appearance.backgroundColor;
}

function setBackgroundCommand(
  target: BackgroundTarget,
  backgroundColor: string | null,
): WorldviewCommand {
  return target.kind === "character"
    ? {
        type: "set-character-background-color",
        characterId: target.character.id,
        backgroundColor,
      }
    : {
        type: "set-item-background-color",
        itemId: target.item.id,
        backgroundColor,
      };
}

export function BackgroundPicker({ target }: { target: BackgroundTarget }) {
  const t = useTranslations();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const currentColor = backgroundColorOf(target);
  const isPresetOrAuto =
    currentColor === null || PRESET_BACKGROUND_COLORS.includes(currentColor);

  const setBackgroundColor = (backgroundColor: string | null) =>
    dispatchCommand(setBackgroundCommand(target, backgroundColor));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">
        {t("character.background")}
      </span>
      <button
        aria-label={t("character.backgroundAuto")}
        title={t("character.backgroundAuto")}
        className={cn(
          "h-7 w-7 rounded-full border-2 border-line bg-gradient-to-br from-accent-soft to-hover",
          currentColor === null && "border-accent",
        )}
        onClick={() => setBackgroundColor(null)}
      />
      {PRESET_BACKGROUND_COLORS.map((presetColor) => (
        <button
          key={presetColor}
          aria-label={presetColor}
          className={cn(
            "h-7 w-7 rounded-full border-2 border-line",
            currentColor === presetColor && "border-accent",
          )}
          style={{ background: presetColor }}
          onClick={() => setBackgroundColor(presetColor)}
        />
      ))}
      <button
        aria-label={t("character.backgroundCustom")}
        title={t("character.backgroundCustom")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-line text-muted",
          !isPresetOrAuto && "border-accent",
        )}
        style={!isPresetOrAuto && currentColor ? { background: currentColor } : undefined}
        onClick={() => colorInputRef.current?.click()}
      >
        {isPresetOrAuto && <Plus size={13} aria-hidden="true" />}
      </button>
      <input
        ref={colorInputRef}
        type="color"
        hidden
        value={currentColor ?? "#dde7f5"}
        onChange={(event) => setBackgroundColor(event.target.value)}
      />
    </div>
  );
}
