import {
  characterDisplayName,
  chapterDisplayName,
  eventDisplayTitle,
  glossaryTermDisplayName,
  groupDisplayName,
  itemDisplayName,
  placeDisplayName,
  raceDisplayName,
  type Character,
  type Chapter,
  type EntityKind,
  type Item,
  type Place,
  type Race,
  type Reference,
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
  worldview: Worldview,
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
    visible = visible.filter((character) =>
      characterReferencesEntity(worldview, character, "group", groupId),
    );
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

export type SearchResultKind =
  | "character"
  | "group"
  | "place"
  | "race"
  | "item"
  | "glossary"
  | "chapter"
  | "event";

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  name: string;
}

// 전역 검색 — 모든 로어 엔티티를 언어 무관하게(원본+모든 번역) 이름으로 매치. 종류 순서로 묶어 반환한다.
// 표시 이름은 보는 언어 기준(fallback 원본). 휴지통 캐릭터는 제외.
export function selectGlobalSearchResults(
  worldview: Worldview,
  characters: Character[],
  query: string,
  locale: string,
): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const lowered = trimmed.toLowerCase();
  const matches = (name: string, translations: Record<string, string>) =>
    [name, ...Object.values(translations)].some((value) =>
      value.toLowerCase().includes(lowered),
    );

  const results: SearchResult[] = [];
  for (const character of selectActiveCharacters(characters)) {
    if (
      matches(character.name, character.nameTranslations) ||
      [...character.personalityTags, ...character.tags].some((tag) =>
        tag.toLowerCase().includes(lowered),
      )
    )
      results.push({
        kind: "character",
        id: character.id,
        name: characterDisplayName(character, locale),
      });
  }
  for (const group of worldview.groups)
    if (matches(group.name, group.nameTranslations))
      results.push({
        kind: "group",
        id: group.id,
        name: groupDisplayName(group, locale),
      });
  for (const place of worldview.places)
    if (matches(place.name, place.nameTranslations))
      results.push({
        kind: "place",
        id: place.id,
        name: placeDisplayName(place, locale),
      });
  for (const race of worldview.races)
    if (matches(race.name, race.nameTranslations))
      results.push({
        kind: "race",
        id: race.id,
        name: raceDisplayName(race, locale),
      });
  for (const item of worldview.items)
    if (matches(item.name, item.nameTranslations))
      results.push({
        kind: "item",
        id: item.id,
        name: itemDisplayName(item, locale),
      });
  for (const term of worldview.glossary)
    if (matches(term.name, term.nameTranslations))
      results.push({
        kind: "glossary",
        id: term.id,
        name: glossaryTermDisplayName(term, locale),
      });
  for (const chapter of worldview.chapters)
    if (matches(chapter.name, chapter.nameTranslations))
      results.push({
        kind: "chapter",
        id: chapter.id,
        name: chapterDisplayName(chapter, locale),
      });
  for (const event of worldview.events)
    if (matches(event.title, event.titleTranslations))
      results.push({
        kind: "event",
        id: event.id,
        name: eventDisplayTitle(event, locale),
      });
  return results;
}

// 참조(관계)는 worldview.references의 독립 간선이다. 아래 헬퍼들이 나가는/들어오는 참조와 필터를 담당한다.

// 이 캐릭터가 해당 엔티티를 (어떤 라벨로든) 가리키는가 — 캐릭터 목록의 조직별 필터에 쓴다.
export function characterReferencesEntity(
  worldview: Worldview,
  character: Character,
  targetKind: EntityKind,
  targetId: string,
): boolean {
  return worldview.references.some(
    (reference) =>
      reference.sourceKind === "character" &&
      reference.sourceId === character.id &&
      reference.targetKind === targetKind &&
      reference.targetId === targetId,
  );
}

// 이 엔티티에서 나가는 참조(이 엔티티가 출발점). 배열 순서 유지.
export function selectOutgoingReferences(
  worldview: Worldview,
  kind: EntityKind,
  id: string,
): Reference[] {
  return worldview.references.filter(
    (reference) => reference.sourceKind === kind && reference.sourceId === id,
  );
}

// 이 엔티티로 들어오는 참조(이 엔티티가 대상) = 백링크. 배열 순서 유지.
export function selectIncomingReferences(
  worldview: Worldview,
  kind: EntityKind,
  id: string,
): Reference[] {
  return worldview.references.filter(
    (reference) => reference.targetKind === kind && reference.targetId === id,
  );
}

// 이 엔티티를 참조하는 (휴지통 제외) 고유 캐릭터 — 목록의 구성원 아바타 등에 쓴다. 이름순.
export function selectReferencingCharacters(
  worldview: Worldview,
  characters: Character[],
  targetKind: EntityKind,
  targetId: string,
  locale: string,
): Character[] {
  const sourceIds = new Set(
    worldview.references
      .filter(
        (reference) =>
          reference.sourceKind === "character" &&
          reference.targetKind === targetKind &&
          reference.targetId === targetId,
      )
      .map((reference) => reference.sourceId),
  );
  return selectActiveCharacters(characters)
    .filter((character) => sourceIds.has(character.id))
    .sort((first, second) =>
      characterDisplayName(first, locale).localeCompare(
        characterDisplayName(second, locale),
        locale,
      ),
    );
}

export function selectChildPlaces(
  worldview: Worldview,
  parentId: string,
): Place[] {
  return worldview.places.filter((place) => place.parentId === parentId);
}

export function selectChildRaces(worldview: Worldview, parentId: string): Race[] {
  return worldview.races.filter((race) => race.parentId === parentId);
}

// 상위 종족이 없는(최상위 계통) 종족들 — 트리 루트. 부모 참조가 끊긴 경우도 루트로 취급.
export function selectRootRaces(worldview: Worldview): Race[] {
  const raceIds = new Set(worldview.races.map((race) => race.id));
  return worldview.races.filter(
    (race) => race.parentId === null || !raceIds.has(race.parentId),
  );
}

export function selectChildItems(worldview: Worldview, parentId: string): Item[] {
  return worldview.items.filter((item) => item.parentId === parentId);
}

// 상위 아이템이 없는(최상위 세트) 아이템들 — 트리 루트. 부모 참조가 끊긴 경우도 루트로 취급.
export function selectRootItems(worldview: Worldview): Item[] {
  const itemIds = new Set(worldview.items.map((item) => item.id));
  return worldview.items.filter(
    (item) => item.parentId === null || !itemIds.has(item.parentId),
  );
}

// 상위 장소가 없는(최상위) 장소들 — 트리 루트. 부모 참조가 끊긴 경우도 루트로 취급.
export function selectRootPlaces(worldview: Worldview): Place[] {
  const placeIds = new Set(worldview.places.map((place) => place.id));
  return worldview.places.filter(
    (place) => place.parentId === null || !placeIds.has(place.parentId),
  );
}

// 이 장소를 무대로 하는 사건 — 배열 순서 유지.
export function selectPlaceEvents(
  worldview: Worldview,
  placeId: string,
): TimelineEvent[] {
  return worldview.events.filter((event) => event.placeId === placeId);
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
// 개인 사건도 여기 보이며(소유 캐릭터는 배지로 구분), 사건 순서는 worldview.events 배열 순서를 따른다.
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

// 캐릭터 개인 연표 = 그 캐릭터가 소유한 개인 사건 + 참여한 세계관 사건. 배열 순서 유지.
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

// 사건을 형제 목록(같은 구간·같은 캐릭터 연표 등) 안에서 위/아래로 옮길 때 move-event에 넘길
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
