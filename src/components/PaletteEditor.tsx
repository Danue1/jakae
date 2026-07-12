"use client";

import { Plus, X } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import type { Character, PaletteColor, Worldview } from "../core/model";
import type { WorldviewCommand } from "../core/commands";
import { dispatchCommand } from "../store/worldviewStore";

// 팔레트는 캐릭터·세계관 양쪽에서 쓰이며, 대상에 따라 커맨드 계열만 달라진다.
export type PaletteTarget =
  | { kind: "character"; character: Character }
  | { kind: "worldview"; worldview: Worldview };

function paletteColors(target: PaletteTarget): PaletteColor[] {
  return target.kind === "character"
    ? target.character.appearance.palette
    : target.worldview.palette;
}

function setColorCommand(
  target: PaletteTarget,
  colorIndex: number,
  color: PaletteColor,
): WorldviewCommand {
  return target.kind === "character"
    ? { type: "set-palette-color", characterId: target.character.id, colorIndex, color }
    : { type: "set-worldview-palette-color", colorIndex, color };
}

function removeColorCommand(
  target: PaletteTarget,
  colorIndex: number,
): WorldviewCommand {
  return target.kind === "character"
    ? { type: "remove-palette-color", characterId: target.character.id, colorIndex }
    : { type: "remove-worldview-palette-color", colorIndex };
}

function addColorCommand(
  target: PaletteTarget,
  color: PaletteColor,
): WorldviewCommand {
  return target.kind === "character"
    ? { type: "add-palette-color", characterId: target.character.id, color }
    : { type: "add-worldview-palette-color", color };
}

function PaletteSwatch({
  target,
  color,
  colorIndex,
}: {
  target: PaletteTarget;
  color: PaletteColor;
  colorIndex: number;
}) {
  const t = useTranslations();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<PaletteColor>) =>
    dispatchCommand(setColorCommand(target, colorIndex, { ...color, ...patch }));

  return (
    <div className="group relative flex w-20 flex-col items-center gap-1">
      <button
        aria-label={t("palette.pickColor")}
        className="h-12 w-12 rounded-full border-2 border-line"
        style={{ background: color.color }}
        onClick={() => colorInputRef.current?.click()}
      />
      <input
        ref={colorInputRef}
        type="color"
        hidden
        value={color.color}
        onChange={(event) => update({ color: event.target.value })}
      />
      <Input
        className="h-auto border-0 bg-transparent p-0 text-center text-xs"
        placeholder={t("palette.rolePlaceholder")}
        value={color.role}
        onChange={(event) => update({ role: event.target.value })}
      />
      <span className="font-mono text-xs uppercase text-muted">
        {color.color}
      </span>
      <button
        aria-label={`${color.role || color.color} · ${t("common.delete")}`}
        className="absolute -right-1 -top-1 rounded-full bg-ground p-1 text-muted opacity-0 shadow-popover hover:text-danger group-hover:opacity-100"
        onClick={() => dispatchCommand(removeColorCommand(target, colorIndex))}
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

export function PaletteEditor({ target }: { target: PaletteTarget }) {
  const t = useTranslations();

  const addColor = () =>
    dispatchCommand(
      addColorCommand(target, {
        id: crypto.randomUUID(),
        role: "",
        color: "#7ec8e3",
      }),
    );

  return (
    <div className="flex flex-wrap items-start gap-3">
      {paletteColors(target).map((color, colorIndex) => (
        <PaletteSwatch
          key={color.id}
          target={target}
          color={color}
          colorIndex={colorIndex}
        />
      ))}
      <button
        className="flex w-20 flex-col items-center gap-1 text-accent"
        onClick={addColor}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-line">
          <Plus size={16} aria-hidden="true" />
        </span>
        <span className="text-xs">{t("palette.addColor")}</span>
      </button>
    </div>
  );
}
