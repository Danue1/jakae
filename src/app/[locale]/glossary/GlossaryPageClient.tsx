"use client";

import { BookText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleTabs } from "@/components/LocaleTabs";
import {
  EntityCard,
  EntityRow,
  IconCardThumb,
  IconRowThumb,
  galleryGridClass,
  tableClass,
} from "@/components/EntityList";
import { ListHeader } from "@/components/ListHeader";
import { References } from "@/components/References";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
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
import {
  createGlossaryTerm,
  glossaryTermDisplayName,
  type GlossaryTerm,
} from "@/core/model";
import { LOCALES, type Locale } from "@/locales";
import { glossaryHref, glossaryListHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";
import { cn } from "@/lib/utils";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function GlossaryPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const termId = searchParams.get("g");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState<GlossaryTerm | null>(null);

  const term = worldview?.glossary.find((entry) => entry.id === termId);
  const termMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    termId !== null &&
    !term;

  useEffect(() => {
    if (termMissing && worldviewId) {
      router.replace(glossaryListHref(locale, worldviewId));
    }
  }, [termMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addTerm = () => {
    const created = createGlossaryTerm();
    dispatchCommand({ type: "add-glossary-term", term: created });
    router.push(glossaryHref(locale, worldview.id, created.id));
  };

  return (
    <WorldShell active="glossary" worldviewId={worldview.id}>
      {termId && term ? (
        <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
          <div className="mb-3 flex items-center">
            <Link
              href={glossaryListHref(locale, worldview.id)}
              className="text-sm text-muted hover:text-ink"
            >
              {t("glossary.tab")}
            </Link>
            <span className="ml-auto hidden lg:block">
              <SavedIndicator />
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Input
              className="text-2xl font-extrabold tracking-tight"
              placeholder={
                nameLocale !== worldview.primaryLocale
                  ? term.name || t("glossary.namePlaceholder")
                  : t("glossary.namePlaceholder")
              }
              value={
                nameLocale !== worldview.primaryLocale
                  ? (term.nameTranslations[nameLocale] ?? "")
                  : term.name
              }
              onChange={(event) =>
                dispatchCommand({
                  type: "rename-glossary-term",
                  termId: term.id,
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
                  ? Boolean(term.name)
                  : Boolean(term.nameTranslations[availableLocale]),
              )}
              primaryLocale={worldview.primaryLocale}
              primaryLabel={t("settings.primaryLocaleLabel")}
            />
          </div>

          <section className="mt-6">
            <SectionCaption>{t("glossary.descriptionLabel")}</SectionCaption>
            <Textarea
              className="min-h-40"
              placeholder={t("glossary.descriptionPlaceholder")}
              value={term.description}
              onChange={(event) =>
                dispatchCommand({
                  type: "set-glossary-term-description",
                  termId: term.id,
                  description: event.target.value,
                })
              }
            />
          </section>

          <section className="mt-6">
            <SectionCaption>{t("reference.sectionTitle")}</SectionCaption>
            <References
              worldview={worldview}
              characters={characters}
              kind="glossary"
              id={term.id}
            />
          </section>

          <section className="mt-8">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setPendingDelete(term)}
            >
              {t("glossary.deleteTerm")}
            </Button>
          </section>

          <AlertDialog
            open={pendingDelete !== null}
            onOpenChange={(open) => {
              if (!open) setPendingDelete(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogTitle>
                {t("glossary.deleteTitle", {
                  name: glossaryTermDisplayName(term, locale) || "-",
                })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("glossary.deleteDescription")}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-danger"
                  onClick={() => {
                    dispatchCommand({
                      type: "remove-glossary-term",
                      termId: term.id,
                    });
                    setPendingDelete(null);
                    router.replace(glossaryListHref(locale, worldview.id));
                  }}
                >
                  {t("common.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
          <ListHeader
            icon={BookText}
            title={t("glossary.tab")}
            view={view}
            onViewChange={setView}
            trailing={
              <Button size="sm" onClick={addTerm}>
                <Plus size={15} aria-hidden="true" />
                {t("glossary.add")}
              </Button>
            }
          />

          {worldview.glossary.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted">
              {t("glossary.listEmpty")}
            </p>
          ) : (
            <div
              className={cn(
                "mt-4",
                view === "gallery" ? galleryGridClass : tableClass,
              )}
            >
              {worldview.glossary.map((entry) => {
                const props = {
                  href: glossaryHref(locale, worldview.id, entry.id),
                  name: glossaryTermDisplayName(entry, locale) || "-",
                  subtitle: entry.description,
                };
                return view === "gallery" ? (
                  <EntityCard
                    key={entry.id}
                    {...props}
                    thumb={<IconCardThumb icon={BookText} />}
                  />
                ) : (
                  <EntityRow
                    key={entry.id}
                    {...props}
                    thumb={<IconRowThumb icon={BookText} />}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </WorldShell>
  );
}
