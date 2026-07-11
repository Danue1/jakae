"use client";

import { ChevronLeft, Plus, Search, Settings, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
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
  characterDisplayName,
  createCharacter,
  worldviewDisplayName,
  type Character,
} from "@/core/model";
import {
  hasActiveFilters,
  selectVisibleCharacters,
  type ViewState,
} from "@/core/selectors";
import {
  characterHref,
  libraryHref,
  parseViewState,
  settingsHref,
  worldHref,
} from "@/react/links";
import { useLocale } from "@/react/localeContext";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";
import { cn } from "@/lib/utils";

export function WorldPageClient() {
  const { locale, dictionary } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const viewState = parseViewState(searchParams);

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const [searchDraft, setSearchDraft] = useState(viewState.query);
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateViewState = (patch: Partial<ViewState>) => {
    if (!worldviewId) return;
    router.replace(worldHref(locale, worldviewId, { ...viewState, ...patch }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDraft !== viewState.query) updateViewState({ query: searchDraft });
    }, 250);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (document.activeElement !== searchInputRef.current) {
      setSearchDraft(viewState.query);
    }
  }, [viewState.query]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const visibleCharacters = selectVisibleCharacters(characters, viewState, locale);
  const inTrash = viewState.view === "trash";

  const addCharacter = () => {
    const character = createCharacter(worldview.id);
    if (viewState.groupId) character.groupIds = [viewState.groupId];
    dispatchCommand({ type: "create-character", character });
    router.push(characterHref(locale, worldview.id, character.id));
  };

  const chipClassName = (active: boolean, dim = false) =>
    cn(
      "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm",
      active
        ? "bg-accent font-bold text-accent-foreground"
        : dim
          ? "bg-hover text-muted"
          : "bg-hover text-ink",
    );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={libraryHref(locale)}
          className="flex items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft size={17} aria-hidden="true" />
          {dictionary.library.title}
        </Link>
        <span className="ml-auto">
          <SavedIndicator />
        </span>
        <Link
          href={settingsHref(locale, worldview.id)}
          aria-label={dictionary.world.settings}
          className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
        >
          <Settings size={19} aria-hidden="true" />
        </Link>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        {worldviewDisplayName(worldview, locale) || "-"}
      </h1>
      {worldview.era && (
        <p className="mt-0.5 text-sm text-muted">
          {dictionary.world.eraPrefix} {worldview.era}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-hover px-3.5 py-2.5">
        <Search size={16} aria-hidden="true" className="shrink-0 text-muted" />
        <input
          ref={searchInputRef}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder={dictionary.world.searchPlaceholder}
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          className={chipClassName(
            viewState.view === "all" && viewState.groupId === null,
          )}
          onClick={() => updateViewState({ view: "all", groupId: null })}
        >
          {dictionary.world.chipAll}
        </button>
        <button
          className={chipClassName(viewState.view === "favorites")}
          onClick={() => updateViewState({ view: "favorites", groupId: null })}
        >
          <Star size={14} aria-hidden="true" className="inline align-[-2px]" />
          <span className="sr-only">{dictionary.world.favorite}</span>
        </button>
        {worldview.groups.map((group) => (
          <button
            key={group.id}
            className={chipClassName(viewState.groupId === group.id)}
            onClick={() =>
              updateViewState({
                view: "all",
                groupId: viewState.groupId === group.id ? null : group.id,
              })
            }
          >
            {group.name}
          </button>
        ))}
        <button
          className={chipClassName(inTrash, true)}
          onClick={() => updateViewState({ view: "trash", groupId: null })}
        >
          {dictionary.world.chipTrash}
        </button>
      </div>

      {visibleCharacters.length === 0 && inTrash ? (
        <p className="py-20 text-center text-sm text-muted">
          {dictionary.world.trashEmpty}
        </p>
      ) : visibleCharacters.length === 0 && hasActiveFilters(viewState) ? (
        <div className="py-20 text-center text-sm text-muted">
          {dictionary.world.emptyFiltered}
          <div className="mt-2">
            <Button
              size="sm"
              onClick={() =>
                updateViewState({ view: "all", groupId: null, query: "" })
              }
            >
              {dictionary.world.resetFilters}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              worldview={worldview}
              inTrash={inTrash}
              onRequestDeleteForever={setPendingDelete}
            />
          ))}
          {viewState.view === "all" && (
            <button
              className="hidden aspect-square items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line font-bold text-accent hover:bg-accent-soft sm:flex"
              onClick={addCharacter}
            >
              <Plus size={18} aria-hidden="true" />
              {dictionary.world.addCharacter}
            </button>
          )}
        </div>
      )}

      {viewState.view === "all" && (
        <button
          aria-label={dictionary.world.addCharacter}
          className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-popover sm:hidden"
          onClick={addCharacter}
        >
          <Plus size={26} aria-hidden="true" />
        </button>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {dictionary.world.deleteCharacterTitle(
              pendingDelete ? characterDisplayName(pendingDelete, locale) || "-" : "-",
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dictionary.world.deleteCharacterDescription}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{dictionary.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger"
              onClick={() => {
                if (pendingDelete)
                  dispatchCommand({
                    type: "delete-character-permanently",
                    characterId: pendingDelete.id,
                  });
                setPendingDelete(null);
              }}
            >
              {dictionary.world.deleteForever}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
