"use client";

import {
  ChevronLeft,
  EllipsisVertical,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { DetailItem } from "@/components/DetailItem";
import { CharacterImages } from "@/components/CharacterImages";
import { CharacterTimeline } from "@/components/CharacterTimeline";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { PaletteEditor } from "@/components/PaletteEditor";
import { QuoteEditor } from "@/components/QuoteEditor";
import { References } from "@/components/References";
import { RelationGraph } from "@/components/RelationGraph";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
import { CharacterTagsEditor } from "@/components/CharacterTagsEditor";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  parseSelectValue,
  serializeSelectValue,
  worldviewDisplayName,
  type Character,
  type FieldDefinition,
} from "@/core/model";
import { DETAIL_LAYOUTS, orderedDetailKeys } from "@/core/detailLayout";
import { LOCALES, type Locale } from "@/locales";
import { charactersHref, characterHref, settingsHref } from "@/react/links";
import { useFieldBinding } from "@/react/useFieldBinding";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand, duplicateCharacter } from "@/store/worldviewStore";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

// 텍스트 필드 — 언어별 값(localized)을 편집 로케일 슬롯으로 다룬다. maxLength 제한을 강제한다.
function TextFieldEditor({
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
  const locale = useLocale();
  const [editingLocale, setEditingLocale] = useState<Locale>(locale);
  const binding = useFieldBinding(
    character.id,
    fieldDefinition.id,
    fieldDefinition.localized ? editingLocale : undefined,
  );
  return (
    <>
      <Input {...binding} maxLength={fieldDefinition.config.maxLength ?? undefined} />
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
    </>
  );
}

// 숫자·선택·날짜 — 언어 무관 원본 값(fieldValues)만 편집한다.
function StructuredFieldEditor({
  character,
  fieldDefinition,
  primaryLocale,
}: {
  character: Character;
  fieldDefinition: FieldDefinition;
  primaryLocale: string;
}) {
  const t = useTranslations();
  const { config } = fieldDefinition;
  const rawValue = character.fieldValues[fieldDefinition.id] ?? "";
  const setValue = (value: string) =>
    dispatchCommand({
      type: "set-field-value",
      characterId: character.id,
      fieldDefinitionId: fieldDefinition.id,
      value,
      locale: primaryLocale,
    });

  if (config.type === "number") {
    return (
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="-"
          value={rawValue}
          min={config.min ?? undefined}
          max={config.max ?? undefined}
          onChange={(event) => setValue(event.target.value)}
        />
        {config.unit && (
          <span className="shrink-0 text-sm text-muted">{config.unit}</span>
        )}
      </div>
    );
  }

  if (config.type === "date") {
    const [month = "", day = ""] = rawValue.split("-");
    const commit = (nextMonth: string, nextDay: string) =>
      setValue(nextMonth || nextDay ? `${nextMonth}-${nextDay}` : "");
    return (
      <div className="flex flex-1 items-center gap-1.5">
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={12}
          className="w-14 text-center"
          placeholder="--"
          value={month}
          onChange={(event) => commit(event.target.value, day)}
        />
        <span className="text-sm text-muted">{t("field.monthLabel")}</span>
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          className="w-14 text-center"
          placeholder="--"
          value={day}
          onChange={(event) => commit(month, event.target.value)}
        />
        <span className="text-sm text-muted">{t("field.dayLabel")}</span>
      </div>
    );
  }

  // select
  const selectedIds = parseSelectValue(rawValue);
  if (config.multiple) {
    const toggle = (optionId: string) =>
      setValue(
        serializeSelectValue(
          selectedIds.includes(optionId)
            ? selectedIds.filter((id) => id !== optionId)
            : [...selectedIds, optionId],
        ),
      );
    return (
      <div className="flex flex-1 flex-wrap gap-1.5">
        {config.options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              aria-pressed={selected}
              onClick={() => toggle(option.id)}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                selected
                  ? "bg-accent-soft font-semibold text-accent"
                  : "bg-hover text-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
  const selectedId = selectedIds[0] ?? "";
  return (
    <div className="flex flex-1 items-center gap-1">
      <Select
        value={selectedId || undefined}
        onValueChange={(value) => setValue(value)}
      >
        <SelectTrigger className="bg-hover">
          <SelectValue placeholder={t("field.selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedId && (
        <button
          aria-label={t("field.clear")}
          className="shrink-0 rounded p-1 text-muted hover:text-ink"
          onClick={() => setValue("")}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
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
  return (
    <div className="flex items-center gap-2 border-b border-line py-1 last:border-b-0">
      <span className="flex w-24 shrink-0 items-center gap-1 truncate text-sm text-muted">
        <span className="truncate">{fieldDefinition.label}</span>
        {fieldDefinition.config.required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {fieldDefinition.config.type === "text" ? (
        <TextFieldEditor
          character={character}
          fieldDefinition={fieldDefinition}
          primaryLocale={primaryLocale}
          primaryLabel={primaryLabel}
        />
      ) : (
        <StructuredFieldEditor
          character={character}
          fieldDefinition={fieldDefinition}
          primaryLocale={primaryLocale}
        />
      )}
    </div>
  );
}

export function CharacterPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const characterId = searchParams.get("ch");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
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
      router.replace(charactersHref(locale, worldviewId));
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
    router.replace(charactersHref(locale, worldview.id));
  };

  const duplicateAndOpen = async () => {
    const copiedCharacterId = await duplicateCharacter(
      character.id,
      t("character.copySuffix"),
    );
    if (copiedCharacterId)
      router.push(characterHref(locale, worldview.id, copiedCharacterId));
  };

  const mainItems: Record<string, ReactNode> = {
    profile: (
      <>
        <div className="flex items-baseline justify-between">
          <SectionCaption>{t("character.profile")}</SectionCaption>
          <Link
            href={settingsHref(locale, worldview.id)}
            className="flex items-center gap-1 text-xs text-accent"
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
            {t("character.manageFields")}
          </Link>
        </div>
        {worldview.fieldDefinitions.map((fieldDefinition) => (
          <ProfileFieldRow
            key={fieldDefinition.id}
            character={character}
            fieldDefinition={fieldDefinition}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        ))}
      </>
    ),
    palette: (
      <>
        <SectionCaption>{t("palette.title")}</SectionCaption>
        <PaletteEditor target={{ kind: "character", character }} />
      </>
    ),
  };
  const asideItems: Record<string, ReactNode> = {
    personality: (
      <>
        <SectionCaption>{t("character.personality")}</SectionCaption>
        <TagEditor character={character} />
      </>
    ),
    tags: (
      <>
        <SectionCaption>{t("character.tags")}</SectionCaption>
        <CharacterTagsEditor character={character} />
      </>
    ),
    quotes: (
      <>
        <SectionCaption>{t("quote.title")}</SectionCaption>
        <QuoteEditor character={character} />
      </>
    ),
    story: (
      <>
        <SectionCaption>{t("character.story")}</SectionCaption>
        <Textarea
          className="min-h-36"
          placeholder={t("character.storyPlaceholder")}
          value={character.story}
          onChange={(event) =>
            dispatchCommand({
              type: "set-story",
              characterId: character.id,
              story: event.target.value,
            })
          }
        />
      </>
    ),
    relations: (
      <>
        <SectionCaption>{t("character.relations")}</SectionCaption>
        <RelationGraph
          worldview={worldview}
          character={character}
          characters={characters}
        />
        <References
          worldview={worldview}
          characters={characters}
          kind="character"
          id={character.id}
        />
      </>
    ),
    timeline: (
      <>
        <SectionCaption>{t("timeline.characterSectionTitle")}</SectionCaption>
        <CharacterTimeline worldview={worldview} character={character} />
      </>
    ),
  };
  const orderedMainKeys = orderedDetailKeys(
    DETAIL_LAYOUTS["character-main"],
    worldview.detailOrders["character-main"],
  );
  const orderedAsideKeys = orderedDetailKeys(
    DETAIL_LAYOUTS["character-aside"],
    worldview.detailOrders["character-aside"],
  );

  return (
    <WorldShell active="characters" worldviewId={worldview.id}>
    <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={charactersHref(locale, worldview.id)}
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
              ? t("world.unfavorite")
              : t("world.favorite")
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
            aria-label={t("common.more")}
            className="rounded-lg p-2 text-muted outline-none hover:bg-hover hover:text-ink"
          >
            <EllipsisVertical size={19} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => void duplicateAndOpen()}>
              {t("character.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onSelect={moveToTrash}>
              {t("character.moveToTrash")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-detail lg:gap-10">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <CharacterImages character={character} />
          <div className="mt-3">
            <BackgroundPicker character={character} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Input
              className="text-2xl font-extrabold tracking-tight"
              placeholder={
                nameLocale !== worldview.primaryLocale
                  ? character.name || t("character.namePlaceholder")
                  : t("character.namePlaceholder")
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
              primaryLabel={t("settings.primaryLocaleLabel")}
            />
          </div>

          {orderedMainKeys.map((key, index) => (
            <DetailItem
              key={key}
              className="mt-5"
              layoutId="character-main"
              itemKey={key}
              index={index}
              total={orderedMainKeys.length}
            >
              {mainItems[key]}
            </DetailItem>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-7 lg:mt-0">
          {orderedAsideKeys.map((key, index) => (
            <DetailItem
              key={key}
              layoutId="character-aside"
              itemKey={key}
              index={index}
              total={orderedAsideKeys.length}
            >
              {asideItems[key]}
            </DetailItem>
          ))}
        </div>
      </div>
    </div>
    </WorldShell>
  );
}
