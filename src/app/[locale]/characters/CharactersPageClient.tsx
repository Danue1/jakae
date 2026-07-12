"use client";

import { Plus, Search, Star, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { ListHeader } from "@/components/ListHeader";
import { galleryGridClass, tableClass } from "@/components/EntityList";
import { MissingWorldview } from "@/components/MissingWorldview";
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
import {
  characterDisplayName,
  createCharacter,
  type Character,
} from "@/core/model";
import {
  hasActiveFilters,
  selectAllTags,
  selectVisibleCharacters,
  type ViewState,
} from "@/core/selectors";
import { characterHref, charactersHref, parseViewState } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";
import { cn } from "@/lib/utils";

export function CharactersPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const viewState = parseViewState(searchParams);

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
  const [searchDraft, setSearchDraft] = useState(viewState.query);
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateViewState = (patch: Partial<ViewState>) => {
    if (!worldviewId) return;
    // charactersHref는 필터·검색만 싣는다 — 갤러리/표 선택(list)은 별도 파라미터라 유지해 준다.
    const href = charactersHref(locale, worldviewId, { ...viewState, ...patch });
    const list = searchParams.get("list");
    router.replace(list ? `${href}&list=${list}` : href);
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

  const visibleCharacters = selectVisibleCharacters(
    worldview,
    characters,
    viewState,
    locale,
  );
  const inTrash = viewState.view === "trash";
  const allTags = selectAllTags(characters);

  const addCharacter = () => {
    const character = createCharacter(worldview.id);
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
    <WorldShell active="characters" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <ListHeader
          icon={Users}
          title={t("nav.characters")}
          view={view}
          onViewChange={setView}
          trailing={
            inTrash ? undefined : (
              <Button size="sm" onClick={addCharacter}>
                <Plus size={15} aria-hidden="true" />
                {t("world.addCharacter")}
              </Button>
            )
          }
        />

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-hover px-3.5 py-2.5">
          <Search size={16} aria-hidden="true" className="shrink-0 text-muted" />
          <input
            ref={searchInputRef}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            placeholder={t("world.searchPlaceholder")}
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
            {t("world.chipAll")}
          </button>
          <button
            className={chipClassName(viewState.view === "favorites")}
            onClick={() => updateViewState({ view: "favorites", groupId: null })}
          >
            <Star size={14} aria-hidden="true" className="inline align-[-2px]" />
            <span className="sr-only">{t("world.favorite")}</span>
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
            {t("world.chipTrash")}
          </button>
        </div>

        {!inTrash && allTags.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={chipClassName(viewState.tag === tag)}
                onClick={() =>
                  updateViewState({
                    tag: viewState.tag === tag ? null : tag,
                  })
                }
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {visibleCharacters.length === 0 && inTrash ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("world.trashEmpty")}
          </p>
        ) : visibleCharacters.length === 0 && hasActiveFilters(viewState) ? (
          <div className="py-20 text-center text-sm text-muted">
            {t("world.emptyFiltered")}
            <div className="mt-2">
              <Button
                size="sm"
                onClick={() =>
                  updateViewState({
                    view: "all",
                    groupId: null,
                    tag: null,
                    query: "",
                  })
                }
              >
                {t("world.resetFilters")}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mt-4",
              view === "gallery" ? galleryGridClass : tableClass,
            )}
          >
            {visibleCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                worldview={worldview}
                view={view}
                inTrash={inTrash}
                onRequestDeleteForever={setPendingDelete}
              />
            ))}
          </div>
        )}

        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogTitle>
              {t("world.deleteCharacterTitle", {
                name: pendingDelete
                  ? characterDisplayName(pendingDelete, locale) || "-"
                  : "-",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("world.deleteCharacterDescription")}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
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
                {t("world.deleteForever")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </WorldShell>
  );
}
