"use client";

import { Plus, Star, X } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  characterCoverImage,
  itemCoverImage,
  type Character,
  type CharacterImage,
  type Item,
} from "../core/model";
import type { WorldviewCommand } from "../core/commands";
import { useImageUrl } from "../react/useImageUrl";
import {
  attachCharacterImage,
  attachItemImage,
  dispatchCommand,
} from "../store/worldviewStore";
import { Avatar, type AvatarSubject } from "./Avatar";

// 이미지 갤러리는 캐릭터·아이템 모두 images·coverImageId를 가지므로 대상 유니온으로 공유한다.
export type ImageTarget =
  | { kind: "character"; character: Character }
  | { kind: "item"; item: Item };

function subjectOf(target: ImageTarget): AvatarSubject {
  return target.kind === "character" ? target.character : target.item;
}

function coverOf(target: ImageTarget): CharacterImage | null {
  return target.kind === "character"
    ? characterCoverImage(target.character)
    : itemCoverImage(target.item);
}

function setCoverCommand(
  target: ImageTarget,
  coverImageId: string,
): WorldviewCommand {
  return target.kind === "character"
    ? { type: "set-cover-image", characterId: target.character.id, coverImageId }
    : { type: "set-item-cover-image", itemId: target.item.id, coverImageId };
}

function removeImageCommand(
  target: ImageTarget,
  imageId: string,
): WorldviewCommand {
  return target.kind === "character"
    ? { type: "remove-character-image", characterId: target.character.id, imageId }
    : { type: "remove-item-image", itemId: target.item.id, imageId };
}

function setCaptionCommand(
  target: ImageTarget,
  imageId: string,
  caption: string,
): WorldviewCommand {
  return target.kind === "character"
    ? {
        type: "set-image-caption",
        characterId: target.character.id,
        imageId,
        caption,
      }
    : { type: "set-item-image-caption", itemId: target.item.id, imageId, caption };
}

function attach(target: ImageTarget, file: Blob): Promise<void> {
  return target.kind === "character"
    ? attachCharacterImage(target.character.id, file)
    : attachItemImage(target.item.id, file);
}

function Thumbnail({
  target,
  image,
  isCover,
}: {
  target: ImageTarget;
  image: CharacterImage;
  isCover: boolean;
}) {
  const t = useTranslations();
  const imageUrl = useImageUrl(image.blobId);
  return (
    <div className="group relative shrink-0">
      <button
        aria-label={t("images.setCover")}
        className={cn(
          "block h-14 w-14 overflow-hidden rounded-lg border-2",
          isCover ? "border-accent" : "border-transparent hover:border-line",
        )}
        onClick={() => dispatchCommand(setCoverCommand(target, image.id))}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image.caption || subjectOf(target).name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="block h-full w-full bg-hover" />
        )}
      </button>
      {isCover && (
        <Star
          size={13}
          aria-hidden="true"
          fill="currentColor"
          className="pointer-events-none absolute left-1 top-1 text-star drop-shadow"
        />
      )}
      <button
        aria-label={t("images.deleteImage")}
        className="absolute -right-1.5 -top-1.5 rounded-full bg-ground p-0.5 text-muted opacity-0 shadow-popover hover:text-danger group-hover:opacity-100"
        onClick={() => dispatchCommand(removeImageCommand(target, image.id))}
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

export function EntityImages({ target }: { target: ImageTarget }) {
  const t = useTranslations();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const subject = subjectOf(target);
  const cover = coverOf(target);

  const pickFile = () => imageInputRef.current?.click();

  return (
    <div>
      <button
        aria-label={t("character.attachImage")}
        className="block w-full rounded-card hover:opacity-90"
        onClick={pickFile}
      >
        <Avatar subject={subject} className="w-full rounded-2xl" />
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void attach(target, file);
          event.target.value = "";
        }}
      />

      {cover && (
        <Input
          className="mt-2 border-0 bg-transparent px-0 text-center text-xs text-muted"
          placeholder={t("images.captionPlaceholder")}
          value={cover.caption}
          onChange={(event) =>
            dispatchCommand(setCaptionCommand(target, cover.id, event.target.value))
          }
        />
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {subject.images.map((image) => (
          <Thumbnail
            key={image.id}
            target={target}
            image={image}
            isCover={image.id === cover?.id}
          />
        ))}
        <button
          aria-label={t("images.addImage")}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-line text-accent hover:bg-hover"
          onClick={pickFile}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
