export interface FieldDefinition {
  id: string;
  label: string;
  localized: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export interface Relation {
  targetCharacterId: string;
  connector: string;
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
  description: string;
  participants: EventParticipant[];
}

export interface Worldview {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  era: string;
  primaryLocale: string;
  fieldDefinitions: FieldDefinition[];
  connectors: string[];
  groups: Group[];
  chapters: Chapter[];
  events: TimelineEvent[];
  createdAt: number;
  modifiedAt: number;
}

export interface CharacterAppearance {
  backgroundColor: string | null;
}

export interface Character {
  id: string;
  worldviewId: string;
  name: string;
  nameTranslations: Record<string, string>;
  imageId: string | null;
  appearance: CharacterAppearance;
  fieldValues: Record<string, string>;
  fieldValueTranslations: Record<string, Record<string, string>>;
  personalityTags: string[];
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
  connectors: string[];
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
    era,
    primaryLocale,
    fieldDefinitions: seedDefaults.fieldLabels.map((label) => ({
      id: crypto.randomUUID(),
      label,
      localized: false,
    })),
    connectors: [...seedDefaults.connectors],
    groups: [],
    chapters: [],
    events: [],
    createdAt: timestamp,
    modifiedAt: timestamp,
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
    imageId: null,
    appearance: { backgroundColor: null },
    fieldValues: {},
    fieldValueTranslations: {},
    personalityTags: [],
    story: "",
    relations: [],
    groupIds: [],
    favorite: false,
    deletedAt: null,
    createdAt: timestamp,
    modifiedAt: timestamp,
  };
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

export function chapterDisplayName(chapter: Chapter, locale: string): string {
  return chapter.nameTranslations[locale] || chapter.name;
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
