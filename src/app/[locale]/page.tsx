"use client";

import { EllipsisVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UpdatesBell } from "@/components/UpdatesBell";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { worldviewDisplayName, type Worldview } from "@/core/model";
import { getSeedContent } from "@/locales";
import { worldHref } from "@/react/links";
import {
  createAndSaveWorldview,
  deleteWorldview,
  listWorldviewEntries,
  type WorldviewListEntry,
} from "@/store/library";
import { seedSampleWorldviewIfEmpty } from "@/store/sample";

export default function LibraryPage() {
  const locale = useLocale();
  const t = useTranslations();
  const seed = getSeedContent(locale);
  const router = useRouter();
  const [entries, setEntries] = useState<WorldviewListEntry[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Worldview | null>(null);

  useEffect(() => {
    void (async () => {
      await seedSampleWorldviewIfEmpty(seed, locale);
      setEntries(await listWorldviewEntries());
    })();
  }, [seed, locale]);

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(timestamp),
    );

  const createAndOpen = async () => {
    const worldview = await createAndSaveWorldview(
      t("library.newWorldviewName"),
      { fieldLabels: seed.fieldLabels },
      locale,
    );
    router.push(worldHref(locale, worldview.id));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteWorldview(pendingDelete.id);
    setPendingDelete(null);
    setEntries(await listWorldviewEntries());
  };

  return (
    <div className="mx-auto max-w-page px-5 pb-24 pt-10 sm:pt-14">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t("library.title")}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <UpdatesBell />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          variant="ghost"
          className="flex-1 bg-accent-soft py-2.5 sm:flex-none sm:px-5"
          onClick={() => void createAndOpen()}
        >
          <Plus size={17} aria-hidden="true" />
          {t("library.newWorldview")}
        </Button>
      </div>

      {entries && entries.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted">
          {t("library.empty")}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {entries?.map(({ worldview, previewCharacters }) => (
          <div key={worldview.id} className="relative">
            <Link
              href={worldHref(locale, worldview.id)}
              className="block rounded-2xl bg-hover p-4 outline-none hover:bg-accent-soft focus-visible:bg-accent-soft"
            >
              {previewCharacters.length > 0 && (
                <span className="mb-2.5 flex">
                  {previewCharacters.map((character) => (
                    <Avatar
                      key={character.id}
                      subject={character}
                      className="-mr-2 w-10 rounded-card border-2 border-ground"
                    />
                  ))}
                </span>
              )}
              <span className="block text-base font-bold">
                {worldviewDisplayName(worldview, locale) || "-"}
              </span>
              <span className="text-xs text-muted">
                {worldview.era
                  ? `${t("world.eraPrefix")} ${worldview.era} · `
                  : ""}
                {t("library.modified", {
                  date: formatDate(worldview.modifiedAt),
                })}
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t("common.more")}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted outline-none hover:bg-ground hover:text-ink"
              >
                <EllipsisVertical size={17} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-danger"
                  onSelect={() => setPendingDelete(worldview)}
                >
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {t("library.deleteWorldviewTitle", {
              name: pendingDelete
                ? worldviewDisplayName(pendingDelete, locale) || "-"
                : "-",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("library.deleteWorldviewDescription")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger"
              onClick={() => void confirmDelete()}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
