"use client";

import { Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FieldsSection } from "@/components/FieldsSection";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLocale, LOCALE_NAMES, LOCALES, type Locale } from "@/locales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PaletteEditor } from "@/components/PaletteEditor";
import { guardedKeyDownHandler } from "@/react/inputGuards";
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
  const [newGenre, setNewGenre] = useState("");
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [synopsisLocale, setSynopsisLocale] = useState<Locale>(locale);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

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
    <WorldShell active="settings" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("settings.title")}
          </h1>
          <span className="ml-auto hidden lg:block">
            <SavedIndicator />
          </span>
        </div>

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
        <FieldsSection worldview={worldview} />
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
      </div>
    </WorldShell>
  );
}
