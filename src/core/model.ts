export interface FieldDefinition {
  id: string;
  label: string;
  localized: boolean;
}

// 조직(세력·단체) — 캐릭터를 묶는 그룹에서 승격된 로어 엔티티. 다국어 이름·설명을 갖는다.
// 캐릭터 소속은 여전히 Character.groupIds로 표현한다.
export interface Group {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  description: string;
}

export interface Relation {
  targetCharacterId: string;
  label: string;
}

// 연표 구간(막·에피소드) — 세계관 사건을 묶는 상위 계층. 시대는 자유 라벨(구조화 날짜 아님).
export interface Chapter {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  era: string;
  description: string;
}

// 장소 — 지역·건물·방을 하나의 엔티티로 다룬다. kind는 자유 라벨(행성·도시·건물…),
// parentId로 포함 계층(우주선 > 조종실)을 표현한다. 세계관 사건이 placeId로 이곳을 가리킨다.
export interface Place {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  kind: string;
  parentId: string | null;
  description: string;
}

// 설정 용어 사전 항목 — 마법체계·개념·고유명사 등 세계관 설정을 이름+설명으로 모은다.
export interface GlossaryTerm {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  description: string;
}

export interface EventParticipant {
  characterId: string;
  role: string;
}

// 사건 — chapterId로 세계관 연표에 묶이고, ownerCharacterId가 있으면 그 자캐 전용 개인 사건이다.
// 개인 사건은 세계관 연표에 나타나지 않고 소유 자캐의 연표에만 보인다.
export interface TimelineEvent {
  id: string;
  chapterId: string | null;
  ownerCharacterId: string | null;
  title: string;
  titleTranslations: Record<string, string>;
  when: string;
  place: string;
  placeId: string | null;
  description: string;
  participants: EventParticipant[];
}

export interface Worldview {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  // 세계관 개요 — 원본 값 + 언어별 번역. 이름과 동일한 다국어 규칙을 따른다.
  synopsis: string;
  synopsisTranslations: Record<string, string>;
  genreTags: string[];
  palette: PaletteColor[];
  era: string;
  primaryLocale: string;
  fieldDefinitions: FieldDefinition[];
  groups: Group[];
  places: Place[];
  glossary: GlossaryTerm[];
  chapters: Chapter[];
  events: TimelineEvent[];
  createdAt: number;
  modifiedAt: number;
}

// 팔레트 한 칸 — 역할(머리·눈·포인트 등)은 자유 라벨, color는 HEX.
export interface PaletteColor {
  id: string;
  role: string;
  color: string;
}

export interface CharacterAppearance {
  backgroundColor: string | null;
  palette: PaletteColor[];
}

// 캐릭터 이미지 한 장 — id는 목록 내 안정 키, blobId는 이미지 저장소 키.
export interface CharacterImage {
  id: string;
  blobId: string;
  caption: string;
}

// 대사 표본 — 스토리와 별개로 말투를 드러내는 자료. 번역 대상 아님(사용자 데이터).
export interface CharacterQuote {
  id: string;
  line: string;
  situation: string;
}

export interface Character {
  id: string;
  worldviewId: string;
  name: string;
  nameTranslations: Record<string, string>;
  images: CharacterImage[];
  coverImageId: string | null;
  appearance: CharacterAppearance;
  fieldValues: Record<string, string>;
  fieldValueTranslations: Record<string, Record<string, string>>;
  personalityTags: string[];
  // 분류·필터용 자유 태그 — 성격 태그와 별개. 번역하지 않는 사용자 데이터.
  tags: string[];
  quotes: CharacterQuote[];
  story: string;
  relations: Relation[];
  groupIds: string[];
  favorite: boolean;
  deletedAt: number | null;
  createdAt: number;
  modifiedAt: number;
}

export interface WorldviewSeedDefaults {
  fieldLabels: string[];
}

export function createWorldview(
  name: string,
  seedDefaults: WorldviewSeedDefaults,
  primaryLocale: string,
  era = "",
  timestamp = Date.now(),
): Worldview {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    synopsis: "",
    synopsisTranslations: {},
    genreTags: [],
    palette: [],
    era,
    primaryLocale,
    fieldDefinitions: seedDefaults.fieldLabels.map((label) => ({
      id: crypto.randomUUID(),
      label,
      localized: false,
    })),
    groups: [],
    places: [],
    glossary: [],
    chapters: [],
    events: [],
    createdAt: timestamp,
    modifiedAt: timestamp,
  };
}

export function createGroup(name = ""): Group {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    description: "",
  };
}

export function createPlace(name = ""): Place {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    kind: "",
    parentId: null,
    description: "",
  };
}

export function createGlossaryTerm(name = ""): GlossaryTerm {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    description: "",
  };
}

export function createChapter(name = ""): Chapter {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    era: "",
    description: "",
  };
}

export function createTimelineEvent(options: {
  chapterId?: string | null;
  ownerCharacterId?: string | null;
}): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    chapterId: options.chapterId ?? null,
    ownerCharacterId: options.ownerCharacterId ?? null,
    title: "",
    titleTranslations: {},
    when: "",
    place: "",
    placeId: null,
    description: "",
    participants: [],
  };
}

export function createCharacter(
  worldviewId: string,
  name = "",
  timestamp = Date.now(),
): Character {
  return {
    id: crypto.randomUUID(),
    worldviewId,
    name,
    nameTranslations: {},
    images: [],
    coverImageId: null,
    appearance: { backgroundColor: null, palette: [] },
    fieldValues: {},
    fieldValueTranslations: {},
    personalityTags: [],
    tags: [],
    quotes: [],
    story: "",
    relations: [],
    groupIds: [],
    favorite: false,
    deletedAt: null,
    createdAt: timestamp,
    modifiedAt: timestamp,
  };
}

// 대표 이미지 = coverImageId가 가리키는 항목, 없으면 첫 이미지. 이미지가 없으면 null.
export function characterCoverImage(
  character: Character,
): CharacterImage | null {
  if (character.images.length === 0) return null;
  return (
    character.images.find((image) => image.id === character.coverImageId) ??
    character.images[0] ??
    null
  );
}

// 다국어 표시 규칙: 보는 언어의 값 → 없으면 원본 값. 빈 문자열은 "지정 안 함"으로 취급한다.
export function characterDisplayName(
  character: Character,
  locale: string,
): string {
  return character.nameTranslations[locale] || character.name;
}

export function worldviewDisplayName(
  worldview: Worldview,
  locale: string,
): string {
  return worldview.nameTranslations[locale] || worldview.name;
}

export function worldviewDisplaySynopsis(
  worldview: Worldview,
  locale: string,
): string {
  return worldview.synopsisTranslations[locale] || worldview.synopsis;
}

export function chapterDisplayName(chapter: Chapter, locale: string): string {
  return chapter.nameTranslations[locale] || chapter.name;
}

export function groupDisplayName(group: Group, locale: string): string {
  return group.nameTranslations[locale] || group.name;
}

export function placeDisplayName(place: Place, locale: string): string {
  return place.nameTranslations[locale] || place.name;
}

export function glossaryTermDisplayName(
  term: GlossaryTerm,
  locale: string,
): string {
  return term.nameTranslations[locale] || term.name;
}

export function eventDisplayTitle(event: TimelineEvent, locale: string): string {
  return event.titleTranslations[locale] || event.title;
}

export function fieldDisplayValue(
  worldview: Worldview,
  character: Character,
  fieldDefinitionId: string,
  locale: string,
): string {
  const fieldDefinition = worldview.fieldDefinitions.find(
    (existing) => existing.id === fieldDefinitionId,
  );
  if (!fieldDefinition) return "";
  const primaryValue = character.fieldValues[fieldDefinitionId] ?? "";
  if (!fieldDefinition.localized) return primaryValue;
  return (
    character.fieldValueTranslations[fieldDefinitionId]?.[locale] || primaryValue
  );
}

// 카드 캡션의 상세 줄 = 처음 두 필드의 값 — 필드 순서 관리가 곧 캡션 사용자화다.
export function characterCaptionDetail(
  worldview: Worldview,
  character: Character,
  locale: string,
): string {
  const leadingFields = worldview.fieldDefinitions.slice(0, 2);
  if (leadingFields.length === 0) return "";
  return leadingFields
    .map(
      (fieldDefinition) =>
        fieldDisplayValue(worldview, character, fieldDefinition.id, locale) ||
        "-",
    )
    .join(" · ");
}
