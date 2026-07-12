"use client";

import { Plus, Star, X } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  characterCoverImage,
  type Character,
  type CharacterImage,
} from "../core/model";
import { useImageUrl } from "../react/useImageUrl";
import { attachCharacterImage, dispatchCommand } from "../store/worldviewStore";
import { Avatar } from "./Avatar";

function Thumbnail({
  character,
  image,
  isCover,
}: {
  character: Character;
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
        onClick={() =>
          dispatchCommand({
            type: "set-cover-image",
            characterId: character.id,
            coverImageId: image.id,
          })
        }
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image.caption || character.name}
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
        onClick={() =>
          dispatchCommand({
            type: "remove-character-image",
            characterId: character.id,
            imageId: image.id,
          })
        }
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

export function CharacterImages({ character }: { character: Character }) {
  const t = useTranslations();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cover = characterCoverImage(character);

  const pickFile = () => imageInputRef.current?.click();

  return (
    <div>
      <button
        aria-label={t("character.attachImage")}
        className="block w-full rounded-card hover:opacity-90"
        onClick={pickFile}
      >
        <Avatar character={character} className="w-full rounded-2xl" />
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void attachCharacterImage(character.id, file);
          event.target.value = "";
        }}
      />

      {cover && (
        <Input
          className="mt-2 border-0 bg-transparent px-0 text-center text-xs text-muted"
          placeholder={t("images.captionPlaceholder")}
          value={cover.caption}
          onChange={(event) =>
            dispatchCommand({
              type: "set-image-caption",
              characterId: character.id,
              imageId: cover.id,
              caption: event.target.value,
            })
          }
        />
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {character.images.map((image) => (
          <Thumbnail
            key={image.id}
            character={character}
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
