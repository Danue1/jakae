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
  tag: string | null;
  query: string;
}

export const defaultViewState: ViewState = {
  view: "all",
  groupId: null,
  tag: null,
  query: "",
};

export function hasActiveFilters(viewState: ViewState): boolean {
  return (
    viewState.view === "favorites" ||
    viewState.groupId !== null ||
    viewState.tag !== null ||
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
    [...character.personalityTags, ...character.tags].some((tag) =>
      tag.toLowerCase().includes(loweredQuery),
    )
  );
}

// 활성 캐릭터 전체에서 쓰인 분류 태그를 중복 없이 모아 이름순으로 반환한다.
export function selectAllTags(characters: Character[]): string[] {
  const tags = new Set<string>();
  for (const character of characters) {
    if (character.deletedAt !== null) continue;
    for (const tag of character.tags) tags.add(tag);
  }
  return [...tags].sort((first, second) => first.localeCompare(second));
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
  if (viewState.tag !== null) {
    const tag = viewState.tag;
    visible = visible.filter((character) => character.tags.includes(tag));
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

// 전체 연표 = 개인 사건을 포함한 모든 사건을 구간 순서대로 묶은 그룹. 미분류는 마지막 그룹.
// 개인 사건도 여기 보이며(소유 자캐는 배지로 구분), 사건 순서는 worldview.events 배열 순서를 따른다.
export function selectWorldTimeline(worldview: Worldview): ChapterGroup[] {
  const chapterIds = new Set(worldview.chapters.map((chapter) => chapter.id));
  const groups: ChapterGroup[] = worldview.chapters.map((chapter) => ({
    chapter,
    events: worldview.events.filter((event) => event.chapterId === chapter.id),
  }));
  const unassigned = worldview.events.filter(
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

// 사건을 형제 목록(같은 구간·같은 자캐 연표 등) 안에서 위/아래로 옮길 때 move-event에 넘길
// 전역 배열 targetIndex. 이동할 곳이 없으면 null. move-event의 "원소 제거 후 삽입" 의미와 맞춘다.
export function eventMoveTargetIndex(
  events: TimelineEvent[],
  siblings: TimelineEvent[],
  eventId: string,
  direction: -1 | 1,
): number | null {
  const position = siblings.findIndex((event) => event.id === eventId);
  const swapWith = siblings[position + direction];
  if (!swapWith) return null;
  const withoutEvent = events.filter((event) => event.id !== eventId);
  const swapIndex = withoutEvent.findIndex((event) => event.id === swapWith.id);
  return direction > 0 ? swapIndex + 1 : swapIndex;
}
