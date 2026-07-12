"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Character, Worldview } from "../core/model";
import { characterCaptionDetail, characterDisplayName } from "../core/model";
import { useLocale, useTranslations } from "next-intl";
import { characterHref } from "../react/links";
import { dispatchCommand, duplicateCharacter } from "../store/worldviewStore";
import { Avatar } from "./Avatar";

export function CharacterCard({
  character,
  worldview,
  inTrash,
  onRequestDeleteForever,
}: {
  character: Character;
  worldview: Worldview;
  inTrash: boolean;
  onRequestDeleteForever: (character: Character) => void;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const duplicateAndOpen = async () => {
    const copiedCharacterId = await duplicateCharacter(
      character.id,
      t("character.copySuffix"),
    );
    if (copiedCharacterId)
      router.push(characterHref(locale, worldview.id, copiedCharacterId));
  };

  const cardBody = (
    <>
      <Avatar character={character} />
      {character.favorite && !inTrash && (
        <Star
          size={17}
          aria-hidden="true"
          fill="currentColor"
          className="absolute right-2.5 top-2.5 text-star"
        />
      )}
      <div className="mt-2 truncate text-sm font-semibold">
        {characterDisplayName(character, locale) || "-"}
      </div>
      <div className="truncate text-xs text-muted">
        {characterCaptionDetail(worldview, character, locale)}
      </div>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {inTrash ? (
          <div className="relative rounded-xl p-1.5 text-center">
            {cardBody}
            <div className="mt-1 flex justify-center gap-1">
              <Button
                variant="subtle"
                size="sm"
                onClick={() =>
                  dispatchCommand({
                    type: "restore-from-trash",
                    characterId: character.id,
                  })
                }
              >
                {t("world.restore")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRequestDeleteForever(character)}
              >
                {t("world.deleteForever")}
              </Button>
            </div>
          </div>
        ) : (
          <Link
            href={characterHref(locale, worldview.id, character.id)}
            className="relative block rounded-xl p-1.5 text-center outline-none hover:bg-hover focus-visible:bg-hover"
          >
            {cardBody}
          </Link>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {inTrash ? (
          <>
            <ContextMenuItem
              onSelect={() =>
                dispatchCommand({
                  type: "restore-from-trash",
                  characterId: character.id,
                })
              }
            >
              {t("world.restore")}
            </ContextMenuItem>
            <ContextMenuItem
              className="text-danger"
              onSelect={() => onRequestDeleteForever(character)}
            >
              {t("world.deleteForever")}
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem
              onSelect={() =>
                router.push(characterHref(locale, worldview.id, character.id))
              }
            >
              {t("world.edit")}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => void duplicateAndOpen()}>
              {t("world.duplicate")}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() =>
                dispatchCommand({
                  type: "set-favorite",
                  characterId: character.id,
                  favorite: !character.favorite,
                })
              }
            >
              {character.favorite
                ? t("world.unfavorite")
                : t("world.favorite")}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-danger"
              onSelect={() =>
                dispatchCommand({
                  type: "move-to-trash",
                  characterId: character.id,
                })
              }
            >
              {t("world.moveToTrash")}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
