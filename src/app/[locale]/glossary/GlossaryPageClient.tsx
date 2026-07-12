"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleTabs } from "@/components/LocaleTabs";
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
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">
              {t("glossary.tab")}
            </h1>
            <span className="ml-auto hidden lg:block">
              <SavedIndicator />
            </span>
            <Button size="sm" onClick={addTerm}>
              <Plus size={15} aria-hidden="true" />
              {t("glossary.add")}
            </Button>
          </div>

          {worldview.glossary.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted">
              {t("glossary.listEmpty")}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {worldview.glossary.map((entry) => (
                <Link
                  key={entry.id}
                  href={glossaryHref(locale, worldview.id, entry.id)}
                  className="rounded-2xl border border-line p-4 hover:border-accent"
                >
                  <div className="truncate font-bold">
                    {glossaryTermDisplayName(entry, locale) || "-"}
                  </div>
                  {entry.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {entry.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </WorldShell>
  );
}
