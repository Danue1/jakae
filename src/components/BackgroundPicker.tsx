"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { Character } from "../core/model";
import { useLocale } from "../react/localeContext";
import { dispatchCommand } from "../store/worldviewStore";
import { PRESET_BACKGROUND_COLORS } from "./Avatar";

export function BackgroundPicker({ character }: { character: Character }) {
  const { dictionary } = useLocale();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const currentColor = character.appearance.backgroundColor;
  const isPresetOrAuto =
    currentColor === null || PRESET_BACKGROUND_COLORS.includes(currentColor);

  const setBackgroundColor = (backgroundColor: string | null) =>
    dispatchCommand({
      type: "set-character-background-color",
      characterId: character.id,
      backgroundColor,
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">
        {dictionary.character.background}
      </span>
      <button
        aria-label={dictionary.character.backgroundAuto}
        title={dictionary.character.backgroundAuto}
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
        aria-label={dictionary.character.backgroundCustom}
        title={dictionary.character.backgroundCustom}
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
