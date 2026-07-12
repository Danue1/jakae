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
import { worldviewDisplayName, type FieldDefinition } from "@/core/model";
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
  const [newConnector, setNewConnector] = useState("");
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
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
      group: { id: crypto.randomUUID(), name },
    });
  };

  const addConnector = () => {
    const connector = newConnector.trim();
    setNewConnector("");
    if (!connector || worldview.connectors.includes(connector)) return;
    dispatchCommand({
      type: "set-connectors",
      connectors: [...worldview.connectors, connector],
    });
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-6 sm:px-6">
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
        <SectionCaption>{t("settings.groupsTitle")}</SectionCaption>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {worldview.groups.map((group) => (
            <span
              key={group.id}
              className="flex items-center gap-1.5 rounded-full bg-hover px-3.5 py-1.5 text-sm"
            >
              {group.name}
              <button
                aria-label={`${group.name} ✕`}
                className="text-muted hover:text-danger"
                onClick={() =>
                  dispatchCommand({ type: "remove-group", groupId: group.id })
                }
              >
                <X size={13} aria-hidden="true" />
              </button>
            </span>
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
        <SectionCaption>{t("settings.connectorsTitle")}</SectionCaption>
        <p className="mt-1 text-xs text-muted">
          {t("settings.connectorsHint")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {worldview.connectors.map((connector) => (
            <span
              key={connector}
              className="flex items-center gap-1.5 rounded-full bg-hover px-3.5 py-1.5 text-sm"
            >
              {connector}
              <button
                aria-label={`${connector} ✕`}
                className="text-muted hover:text-danger"
                onClick={() =>
                  dispatchCommand({
                    type: "set-connectors",
                    connectors: worldview.connectors.filter(
                      (existing) => existing !== connector,
                    ),
                  })
                }
              >
                <X size={13} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Input
            className="bg-hover"
            placeholder={t("settings.connectorPlaceholder")}
            value={newConnector}
            onChange={(event) => setNewConnector(event.target.value)}
            onKeyDown={guardedKeyDownHandler({ Enter: addConnector })}
          />
          <Button size="sm" onClick={addConnector}>
            <Plus size={15} aria-hidden="true" />
            {t("settings.addConnector")}
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
