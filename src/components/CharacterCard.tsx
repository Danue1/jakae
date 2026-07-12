"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
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
import type { ListView } from "@/react/useListView";
import { useLocale, useTranslations } from "next-intl";
import { characterHref } from "../react/links";
import { dispatchCommand, duplicateCharacter } from "../store/worldviewStore";
import { Avatar } from "./Avatar";
import {
  EntityCardBody,
  EntityRowBody,
  Tag,
  entityCardClass,
  entityCardLinkClass,
  entityRowClass,
  entityRowLinkClass,
} from "./EntityList";

export function CharacterCard({
  character,
  worldview,
  view,
  inTrash,
  onRequestDeleteForever,
}: {
  character: Character;
  worldview: Worldview;
  view: ListView;
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

  const name = characterDisplayName(character, locale) || "-";
  const subtitle = characterCaptionDetail(worldview, character, locale);
  const favorite = !inTrash && character.favorite;

  const trashActions = (
    <>
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
    </>
  );
  const tagMeta =
    !inTrash && character.tags.length > 0
      ? character.tags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)
      : null;
  const meta: ReactNode = inTrash ? trashActions : tagMeta;

  const body =
    view === "gallery" ? (
      <EntityCardBody
        thumb={<Avatar subject={character} fill className="rounded-none" />}
        name={name}
        favorite={favorite}
        subtitle={subtitle}
        meta={meta}
      />
    ) : (
      <EntityRowBody
        thumb={<Avatar subject={character} className="size-7 shrink-0" />}
        name={name}
        favorite={favorite}
        subtitle={subtitle}
        meta={meta}
        chevron={!inTrash}
      />
    );
  const staticClass = view === "gallery" ? entityCardClass : entityRowClass;
  const linkClass = view === "gallery" ? entityCardLinkClass : entityRowLinkClass;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {inTrash ? (
          <div className={staticClass}>{body}</div>
        ) : (
          <Link
            href={characterHref(locale, worldview.id, character.id)}
            className={linkClass}
          >
            {body}
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
