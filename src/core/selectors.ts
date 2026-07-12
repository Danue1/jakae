import {
  characterDisplayName,
  type Character,
  type Chapter,
  type TimelineEvent,
  type Worldview,
} from "./model";

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

export interface ChapterGroup {
  chapter: Chapter | null;
  events: TimelineEvent[];
}

// 세계관 연표 = 개인 사건을 제외한 사건을 구간 순서대로 묶은 그룹. 미분류는 마지막 그룹.
// 사건의 순서는 worldview.events 배열 순서를 그대로 따른다.
export function selectWorldTimeline(worldview: Worldview): ChapterGroup[] {
  const worldEvents = worldview.events.filter(
    (event) => event.ownerCharacterId === null,
  );
  const chapterIds = new Set(worldview.chapters.map((chapter) => chapter.id));
  const groups: ChapterGroup[] = worldview.chapters.map((chapter) => ({
    chapter,
    events: worldEvents.filter((event) => event.chapterId === chapter.id),
  }));
  const unassigned = worldEvents.filter(
    (event) => event.chapterId === null || !chapterIds.has(event.chapterId),
  );
  if (unassigned.length > 0) groups.push({ chapter: null, events: unassigned });
  return groups;
}

// 자캐 개인 연표 = 그 자캐가 소유한 개인 사건 + 참여한 세계관 사건. 배열 순서 유지.
export function selectCharacterTimeline(
  worldview: Worldview,
  characterId: string,
): TimelineEvent[] {
  return worldview.events.filter(
    (event) =>
      event.ownerCharacterId === characterId ||
      (event.ownerCharacterId === null &&
        event.participants.some(
          (participant) => participant.characterId === characterId,
        )),
  );
}
