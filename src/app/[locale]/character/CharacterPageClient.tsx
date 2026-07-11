"use client";

import {
  ChevronLeft,
  EllipsisVertical,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { RelationEditor } from "@/components/RelationEditor";
import { SavedIndicator } from "@/components/SavedIndicator";
import { TagEditor } from "@/components/TagEditor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  worldviewDisplayName,
  type Character,
  type FieldDefinition,
} from "@/core/model";
import { LOCALES, type Locale } from "@/locales";
import { characterHref, settingsHref, worldHref } from "@/react/links";
import { useFieldBinding } from "@/react/useFieldBinding";
import { useLocale } from "@/react/localeContext";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import {
  attachCharacterImage,
  dispatchCommand,
  duplicateCharacter,
} from "@/store/worldviewStore";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

function ProfileFieldRow({
  character,
  fieldDefinition,
  primaryLocale,
  primaryLabel,
}: {
  character: Character;
  fieldDefinition: FieldDefinition;
  primaryLocale: string;
  primaryLabel: string;
}) {
  const { locale } = useLocale();
  const [editingLocale, setEditingLocale] = useState<Locale>(locale);
  const binding = useFieldBinding(
    character.id,
    fieldDefinition.id,
    fieldDefinition.localized ? editingLocale : undefined,
  );
  return (
    <div className="flex items-center gap-2 border-b border-line py-1 last:border-b-0">
      <span className="w-24 shrink-0 truncate text-sm text-muted">
        {fieldDefinition.label}
      </span>
      <Input {...binding} />
      {fieldDefinition.localized && (
        <LocaleTabs
          value={editingLocale}
          onChange={setEditingLocale}
          filledLocales={LOCALES.filter((availableLocale) =>
            availableLocale === primaryLocale
              ? Boolean(character.fieldValues[fieldDefinition.id])
              : Boolean(
                  character.fieldValueTranslations[fieldDefinition.id]?.[
                    availableLocale
                  ],
                ),
          )}
          primaryLocale={primaryLocale}
          primaryLabel={primaryLabel}
        />
      )}
    </div>
  );
}

export function CharacterPageClient() {
  const { locale, dictionary } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const characterId = searchParams.get("ch");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [nameLocale, setNameLocale] = useState<Locale>(locale);

  const character = characters.find(
    (existing) => existing.id === characterId && existing.deletedAt === null,
  );

  const characterMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    !character;

  useEffect(() => {
    if (characterMissing && worldviewId) {
      router.replace(worldHref(locale, worldviewId));
    }
  }, [characterMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (
    loadStatus !== "ready" ||
    !worldview ||
    worldview.id !== worldviewId ||
    !character
  ) {
    return null;
  }

  const moveToTrash = () => {
    dispatchCommand({ type: "move-to-trash", characterId: character.id });
    router.replace(worldHref(locale, worldview.id));
  };

  const duplicateAndOpen = async () => {
    const copiedCharacterId = await duplicateCharacter(
      character.id,
      dictionary.character.copySuffix,
    );
    if (copiedCharacterId)
      router.push(characterHref(locale, worldview.id, copiedCharacterId));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={worldHref(locale, worldview.id)}
          className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {worldviewDisplayName(worldview, locale) || "-"}
          </span>
        </Link>
        <span className="ml-auto">
          <SavedIndicator />
        </span>
        <Button
          variant="subtle"
          size="icon"
          aria-label={
            character.favorite
              ? dictionary.world.unfavorite
              : dictionary.world.favorite
          }
          className={cn(character.favorite && "text-star")}
          onClick={() =>
            dispatchCommand({
              type: "set-favorite",
              characterId: character.id,
              favorite: !character.favorite,
            })
          }
        >
          <Star
            size={20}
            aria-hidden="true"
            fill={character.favorite ? "currentColor" : "none"}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={dictionary.common.more}
            className="rounded-lg p-2 text-muted outline-none hover:bg-hover hover:text-ink"
          >
            <EllipsisVertical size={19} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => void duplicateAndOpen()}>
              {dictionary.character.duplicate}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onSelect={moveToTrash}>
              {dictionary.character.moveToTrash}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-detail lg:gap-10">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <button
            aria-label={dictionary.character.attachImage}
            className="block w-full rounded-card hover:opacity-90"
            onClick={() => imageInputRef.current?.click()}
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
          <div className="mt-3">
            <BackgroundPicker character={character} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Input
              className="text-2xl font-extrabold tracking-tight"
              placeholder={
                nameLocale !== worldview.primaryLocale
                  ? character.name || dictionary.character.namePlaceholder
                  : dictionary.character.namePlaceholder
              }
              value={
                nameLocale !== worldview.primaryLocale
                  ? (character.nameTranslations[nameLocale] ?? "")
                  : character.name
              }
              onChange={(event) =>
                dispatchCommand({
                  type: "rename-character",
                  characterId: character.id,
                  name: event.target.value,
                  locale: nameLocale,
                })
              }
            />
            <LocaleTabs
              value={nameLocale}
              onChange={setNameLocale}
              filledLocales={LOCALES.filter((availableLocale) =>
                availableLocale === worldview.primaryLocale
                  ? Boolean(character.name)
                  : Boolean(character.nameTranslations[availableLocale]),
              )}
              primaryLocale={worldview.primaryLocale}
              primaryLabel={dictionary.settings.primaryLocaleLabel}
            />
          </div>

          <section className="mt-5">
            <div className="flex items-baseline justify-between">
              <SectionCaption>{dictionary.character.profile}</SectionCaption>
              <Link
                href={settingsHref(locale, worldview.id)}
                className="flex items-center gap-1 text-xs text-accent"
              >
                <SlidersHorizontal size={13} aria-hidden="true" />
                {dictionary.character.manageFields}
              </Link>
            </div>
            {worldview.fieldDefinitions.map((fieldDefinition) => (
              <ProfileFieldRow
                key={fieldDefinition.id}
                character={character}
                fieldDefinition={fieldDefinition}
                primaryLocale={worldview.primaryLocale}
                primaryLabel={dictionary.settings.primaryLocaleLabel}
              />
            ))}
          </section>
        </div>

        <div className="mt-7 flex flex-col gap-7 lg:mt-0">
          <section>
            <SectionCaption>{dictionary.character.personality}</SectionCaption>
            <TagEditor character={character} />
          </section>

          <section>
            <SectionCaption>{dictionary.character.story}</SectionCaption>
            <Textarea
              className="min-h-36"
              placeholder={dictionary.character.storyPlaceholder}
              value={character.story}
              onChange={(event) =>
                dispatchCommand({
                  type: "set-story",
                  characterId: character.id,
                  story: event.target.value,
                })
              }
            />
          </section>

          <section>
            <SectionCaption>{dictionary.character.relations}</SectionCaption>
            <RelationEditor
              worldview={worldview}
              character={character}
              characters={characters}
            />
          </section>

          {worldview.groups.length > 0 && (
            <section>
              <SectionCaption>{dictionary.character.groups}</SectionCaption>
              <div className="flex flex-wrap gap-1.5">
                {worldview.groups.map((group) => {
                  const assigned = character.groupIds.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-sm",
                        assigned
                          ? "bg-accent-soft font-semibold text-accent"
                          : "bg-hover text-muted hover:text-ink",
                      )}
                      onClick={() =>
                        dispatchCommand({
                          type: "set-group-membership",
                          characterId: character.id,
                          groupId: group.id,
                          assigned: !assigned,
                        })
                      }
                    >
                      {group.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
