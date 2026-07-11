"use client";

import { EllipsisVertical, FolderInput, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
import { worldviewDisplayName, type Worldview } from "@/core/model";
import { WorldFileError } from "@/core/worldFormat";
import { worldHref } from "@/react/links";
import { useLocale } from "@/react/localeContext";
import {
  createAndSaveWorldview,
  deleteWorldview,
  importWorldFile,
  listWorldviewEntries,
  type WorldviewListEntry,
} from "@/store/library";
import { seedSampleWorldviewIfEmpty } from "@/store/sample";

export default function LibraryPage() {
  const { locale, dictionary } = useLocale();
  const router = useRouter();
  const [entries, setEntries] = useState<WorldviewListEntry[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Worldview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      await seedSampleWorldviewIfEmpty(dictionary.seed, locale);
      setEntries(await listWorldviewEntries());
    })();
  }, [dictionary, locale]);

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(timestamp),
    );

  const createAndOpen = async () => {
    const worldview = await createAndSaveWorldview(
      dictionary.library.newWorldviewName,
      {
        fieldLabels: dictionary.seed.fieldLabels,
        connectors: dictionary.seed.connectors,
      },
      locale,
    );
    router.push(worldHref(locale, worldview.id));
  };

  const handleImportFile = async (file: File) => {
    try {
      const worldviewId = await importWorldFile(file);
      router.push(worldHref(locale, worldviewId));
    } catch (error) {
      if (error instanceof WorldFileError) {
        alert(
          error.code === "newer-version"
            ? dictionary.library.importFailedNewerVersion
            : dictionary.library.importFailedInvalid,
        );
        return;
      }
      alert(dictionary.library.importFailed);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteWorldview(pendingDelete.id);
    setPendingDelete(null);
    setEntries(await listWorldviewEntries());
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-14">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {dictionary.library.title}
        </h1>
        <div className="ml-auto">
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
          {dictionary.library.newWorldview}
        </Button>
        <Button
          variant="subtle"
          className="flex-1 bg-hover py-2.5 sm:flex-none sm:px-5"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderInput size={17} aria-hidden="true" />
          {dictionary.library.importFile}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".world,.zip"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImportFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {entries && entries.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted">
          {dictionary.library.empty}
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
                      character={character}
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
                  ? `${dictionary.world.eraPrefix} ${worldview.era} · `
                  : ""}
                {dictionary.library.modified(formatDate(worldview.modifiedAt))}
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={dictionary.common.more}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted outline-none hover:bg-ground hover:text-ink"
              >
                <EllipsisVertical size={17} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-danger"
                  onSelect={() => setPendingDelete(worldview)}
                >
                  {dictionary.common.delete}
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
            {dictionary.library.deleteWorldviewTitle(
              pendingDelete
                ? worldviewDisplayName(pendingDelete, locale) || "-"
                : "-",
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dictionary.library.deleteWorldviewDescription}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{dictionary.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger"
              onClick={() => void confirmDelete()}
            >
              {dictionary.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
