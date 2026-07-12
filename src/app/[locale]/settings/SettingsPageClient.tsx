"use client";

import { ChevronDown, ChevronLeft, ChevronUp, Globe, Plus, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isLocale, LOCALE_NAMES, LOCALES, type Locale } from "@/locales";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PaletteEditor } from "@/components/PaletteEditor";
import {
  createGlossaryTerm,
  createGroup,
  createPlace,
  placeDisplayName,
  worldviewDisplayName,
  type FieldDefinition,
} from "@/core/model";
import { guardedKeyDownHandler } from "@/react/inputGuards";
import { worldHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="text-xs font-bold tracking-wide text-muted">{children}</div>
  );
}

export function SettingsPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newGlossaryName, setNewGlossaryName] = useState("");
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [synopsisLocale, setSynopsisLocale] = useState<Locale>(locale);
  const [pendingDeleteField, setPendingDeleteField] =
    useState<FieldDefinition | null>(null);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addField = () => {
    const label = newFieldLabel.trim();
    setNewFieldLabel("");
    if (!label) return;
    dispatchCommand({
      type: "add-field-definition",
      fieldDefinition: { id: crypto.randomUUID(), label, localized: false },
    });
  };

  const addGroup = () => {
    const name = newGroupName.trim();
    setNewGroupName("");
    if (!name) return;
    dispatchCommand({
      type: "add-group",
      group: createGroup(name),
    });
  };

  const addPlace = () => {
    const name = newPlaceName.trim();
    setNewPlaceName("");
    if (!name) return;
    dispatchCommand({ type: "add-place", place: createPlace(name) });
  };

  const addGlossaryTerm = () => {
    const name = newGlossaryName.trim();
    setNewGlossaryName("");
    if (!name) return;
    dispatchCommand({ type: "add-glossary-term", term: createGlossaryTerm(name) });
  };

  const addGenre = () => {
    const tag = newGenre.trim().replace(/,+$/, "");
    setNewGenre("");
    if (!tag || worldview.genreTags.includes(tag)) return;
    dispatchCommand({
      type: "set-worldview-genre-tags",
      genreTags: [...worldview.genreTags, tag],
    });
  };

  const removeGenre = (tag: string) =>
    dispatchCommand({
      type: "set-worldview-genre-tags",
      genreTags: worldview.genreTags.filter((existing) => existing !== tag),
    });

  return (
    <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6">
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
      </div>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
        {t("settings.title")}
      </h1>

      <section className="mt-7">
        <SectionCaption>{t("settings.basicInfo")}</SectionCaption>
        <div className="mt-1 flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-24 shrink-0 text-sm text-muted">
            {t("settings.nameLabel")}
          </span>
          <Input
            placeholder={
              nameLocale !== worldview.primaryLocale
                ? worldview.name || "-"
                : "-"
            }
            value={
              nameLocale !== worldview.primaryLocale
                ? (worldview.nameTranslations[nameLocale] ?? "")
                : worldview.name
            }
            onChange={(event) =>
              dispatchCommand({
                type: "rename-worldview",
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
                ? Boolean(worldview.name)
                : Boolean(worldview.nameTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>
        <div className="flex items-start gap-2 border-b border-line py-1.5">
          <span className="w-24 shrink-0 pt-2 text-sm text-muted">
            {t("settings.synopsisLabel")}
          </span>
          <Textarea
            rows={3}
            placeholder={
              synopsisLocale !== worldview.primaryLocale
                ? worldview.synopsis || "-"
                : "-"
            }
            value={
              synopsisLocale !== worldview.primaryLocale
                ? (worldview.synopsisTranslations[synopsisLocale] ?? "")
                : worldview.synopsis
            }
            onChange={(event) =>
              dispatchCommand({
                type: "set-worldview-synopsis",
                synopsis: event.target.value,
                locale: synopsisLocale,
              })
            }
          />
          <LocaleTabs
            value={synopsisLocale}
            onChange={setSynopsisLocale}
            filledLocales={LOCALES.filter((availableLocale) =>
              availableLocale === worldview.primaryLocale
                ? Boolean(worldview.synopsis)
                : Boolean(worldview.synopsisTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>
        <div className="flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-24 shrink-0 text-sm text-muted">
            {t("settings.eraLabel")}
          </span>
          <Input
            placeholder="-"
            value={worldview.era}
            onChange={(event) =>
              dispatchCommand({
                type: "set-worldview-era",
                era: event.target.value,
              })
            }
          />
        </div>
        <div className="flex items-center gap-2 py-1.5">
          <span className="w-24 shrink-0 text-sm text-muted">
            {t("settings.primaryLocaleLabel")}
          </span>
          <Select
            value={isLocale(worldview.primaryLocale) ? worldview.primaryLocale : undefined}
            onValueChange={(primaryLocale) =>
              dispatchCommand({ type: "set-primary-locale", primaryLocale })
            }
          >
            <SelectTrigger className="bg-hover">
              <SelectValue placeholder={worldview.primaryLocale} />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((availableLocale) => (
                <SelectItem key={availableLocale} value={availableLocale}>
                  {LOCALE_NAMES[availableLocale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.fieldsTitle")}</SectionCaption>
        <p className="mt-1 text-xs text-muted">{t("settings.fieldsHint")}</p>
        <div className="mt-2">
          {worldview.fieldDefinitions.map((fieldDefinition, fieldIndex) => (
            <div
              key={fieldDefinition.id}
              className="flex items-center gap-1.5 border-b border-line py-1.5"
            >
              <div className="flex flex-col">
                <button
                  aria-label={t("settings.moveUp")}
                  disabled={fieldIndex === 0}
                  className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                  onClick={() =>
                    dispatchCommand({
                      type: "move-field-definition",
                      fieldDefinitionId: fieldDefinition.id,
                      targetIndex: fieldIndex - 1,
                    })
                  }
                >
                  <ChevronUp size={15} aria-hidden="true" />
                </button>
                <button
                  aria-label={t("settings.moveDown")}
                  disabled={fieldIndex === worldview.fieldDefinitions.length - 1}
                  className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
                  onClick={() =>
                    dispatchCommand({
                      type: "move-field-definition",
                      fieldDefinitionId: fieldDefinition.id,
                      targetIndex: fieldIndex + 1,
                    })
                  }
                >
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
              </div>
              <Input
                value={fieldDefinition.label}
                placeholder={t("settings.fieldNamePlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "rename-field-definition",
                    fieldDefinitionId: fieldDefinition.id,
                    label: event.target.value,
                  })
                }
              />
              <Button
                variant="subtle"
                size="icon"
                aria-label={t("settings.localizedToggle")}
                aria-pressed={fieldDefinition.localized}
                title={t("settings.localizedToggle")}
                className={cn(fieldDefinition.localized && "text-accent")}
                onClick={() =>
                  dispatchCommand({
                    type: "set-field-localized",
                    fieldDefinitionId: fieldDefinition.id,
                    localized: !fieldDefinition.localized,
                  })
                }
              >
                <Globe size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setPendingDeleteField(fieldDefinition)}
              >
                {t("common.delete")}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.fieldNamePlaceholder")}
            value={newFieldLabel}
            onChange={(event) => setNewFieldLabel(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addField })}
          />
          <Button size="sm" onClick={addField}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addField")}
          </Button>
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.genreTitle")}</SectionCaption>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {worldview.genreTags.map((tag) => (
            <Badge key={tag} className="py-1 text-sm">
              {tag}
              <button
                aria-label={`${tag} · ${t("common.delete")}`}
                className="-my-2 -mr-2 p-2 opacity-60 hover:opacity-100"
                onClick={() => removeGenre(tag)}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.genrePlaceholder")}
            value={newGenre}
            onChange={(event) => setNewGenre(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addGenre })}
          />
          <Button size="sm" onClick={addGenre}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addGenre")}
          </Button>
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.paletteTitle")}</SectionCaption>
        <div className="mt-2">
          <PaletteEditor target={{ kind: "worldview", worldview }} />
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.groupsTitle")}</SectionCaption>
        <div className="mt-2">
          {worldview.groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-1.5 border-b border-line py-1.5"
            >
              <Input
                className="w-40 shrink-0"
                value={group.name}
                placeholder={t("settings.groupPlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "rename-group",
                    groupId: group.id,
                    name: event.target.value,
                    locale: worldview.primaryLocale,
                  })
                }
              />
              <Input
                value={group.description}
                placeholder={t("settings.orgDescriptionPlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "set-group-description",
                    groupId: group.id,
                    description: event.target.value,
                  })
                }
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  dispatchCommand({ type: "remove-group", groupId: group.id })
                }
              >
                {t("common.delete")}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.groupPlaceholder")}
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addGroup })}
          />
          <Button size="sm" onClick={addGroup}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addGroup")}
          </Button>
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.placesTitle")}</SectionCaption>
        <div className="mt-2">
          {worldview.places.map((place) => (
            <div
              key={place.id}
              className="flex flex-col gap-1.5 border-b border-line py-2"
            >
              <div className="flex items-center gap-1.5">
                <Input
                  className="w-40 shrink-0"
                  value={place.name}
                  placeholder={t("settings.placeNamePlaceholder")}
                  onChange={(event) =>
                    dispatchCommand({
                      type: "rename-place",
                      placeId: place.id,
                      name: event.target.value,
                      locale: worldview.primaryLocale,
                    })
                  }
                />
                <Input
                  className="w-32 shrink-0"
                  value={place.kind}
                  placeholder={t("settings.placeKindPlaceholder")}
                  onChange={(event) =>
                    dispatchCommand({
                      type: "set-place-kind",
                      placeId: place.id,
                      kind: event.target.value,
                    })
                  }
                />
                <Select
                  value={place.parentId ?? "__none__"}
                  onValueChange={(value) =>
                    dispatchCommand({
                      type: "set-place-parent",
                      placeId: place.id,
                      parentId: value === "__none__" ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="bg-hover">
                    <SelectValue placeholder={t("settings.placeParentLabel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      {t("settings.placeParentNone")}
                    </SelectItem>
                    {worldview.places
                      .filter((candidate) => candidate.id !== place.id)
                      .map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {placeDisplayName(candidate, locale) || "-"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    dispatchCommand({ type: "remove-place", placeId: place.id })
                  }
                >
                  {t("common.delete")}
                </Button>
              </div>
              <Input
                value={place.description}
                placeholder={t("settings.placeDescriptionPlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "set-place-description",
                    placeId: place.id,
                    description: event.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.placeNamePlaceholder")}
            value={newPlaceName}
            onChange={(event) => setNewPlaceName(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addPlace })}
          />
          <Button size="sm" onClick={addPlace}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addPlace")}
          </Button>
        </div>
      </section>

      <section className="mt-9">
        <SectionCaption>{t("settings.glossaryTitle")}</SectionCaption>
        <div className="mt-2">
          {worldview.glossary.map((term) => (
            <div
              key={term.id}
              className="flex items-center gap-1.5 border-b border-line py-1.5"
            >
              <Input
                className="w-40 shrink-0"
                value={term.name}
                placeholder={t("settings.glossaryNamePlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "rename-glossary-term",
                    termId: term.id,
                    name: event.target.value,
                    locale: worldview.primaryLocale,
                  })
                }
              />
              <Input
                value={term.description}
                placeholder={t("settings.glossaryDescriptionPlaceholder")}
                onChange={(event) =>
                  dispatchCommand({
                    type: "set-glossary-term-description",
                    termId: term.id,
                    description: event.target.value,
                  })
                }
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  dispatchCommand({
                    type: "remove-glossary-term",
                    termId: term.id,
                  })
                }
              >
                {t("common.delete")}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.glossaryNamePlaceholder")}
            value={newGlossaryName}
            onChange={(event) => setNewGlossaryName(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addGlossaryTerm })}
          />
          <Button size="sm" onClick={addGlossaryTerm}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addGlossary")}
          </Button>
        </div>
      </section>

      <AlertDialog
        open={pendingDeleteField !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteField(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {t("settings.deleteFieldTitle", {
              label: pendingDeleteField?.label ?? "",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("settings.deleteFieldDescription")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger"
              onClick={() => {
                if (pendingDeleteField)
                  dispatchCommand({
                    type: "delete-field-definition",
                    fieldDefinitionId: pendingDeleteField.id,
                  });
                setPendingDeleteField(null);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
