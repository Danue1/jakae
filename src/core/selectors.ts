import { characterDisplayName, type Character } from "./model";

export type ViewName = "all" | "favorites" | "trash";

export interface ViewState {
  view: ViewName;
  groupId: string | null;
  query: string;
}

export const defaultViewState: ViewState = {
  view: "all",
  groupId: null,
  query: "",
};

export function hasActiveFilters(viewState: ViewState): boolean {
  return (
    viewState.view === "favorites" ||
    viewState.groupId !== null ||
    viewState.query.trim() !== ""
  );
}

// 검색은 언어를 가리지 않는다 — 원본 이름·모든 언어의 이름·태그를 함께 매치.
function matchesQuery(character: Character, query: string): boolean {
  const loweredQuery = query.toLowerCase();
  return (
    [character.name, ...Object.values(character.nameTranslations)].some(
      (name) => name.toLowerCase().includes(loweredQuery),
    ) ||
    character.personalityTags.some((tag) =>
      tag.toLowerCase().includes(loweredQuery),
    )
  );
}

export function selectVisibleCharacters(
  characters: Character[],
  viewState: ViewState,
  locale: string,
): Character[] {
  let visible =
    viewState.view === "trash"
      ? characters.filter((character) => character.deletedAt !== null)
      : characters.filter((character) => character.deletedAt === null);
  if (viewState.view === "favorites")
    visible = visible.filter((character) => character.favorite);
  if (viewState.groupId !== null) {
    const groupId = viewState.groupId;
    visible = visible.filter((character) => character.groupIds.includes(groupId));
  }
  const trimmedQuery = viewState.query.trim();
  if (trimmedQuery)
    visible = visible.filter((character) => matchesQuery(character, trimmedQuery));

  return [...visible].sort((first, second) =>
    characterDisplayName(first, locale).localeCompare(
      characterDisplayName(second, locale),
      locale,
    ),
  );
}

export function selectActiveCharacters(characters: Character[]): Character[] {
  return characters.filter((character) => character.deletedAt === null);
}

export function worldviewPreviewCharacters(
  characters: Character[],
  limit = 4,
): Character[] {
  return [...selectActiveCharacters(characters)]
    .sort((first, second) => second.modifiedAt - first.modifiedAt)
    .slice(0, limit);
}
