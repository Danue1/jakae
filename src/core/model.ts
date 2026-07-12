// 필드 타입 — text는 자유 서술, number는 범위·단위, select는 옵션 중 고르기, date는 월·일.
// 엔티티 간 참조(관계)는 필드가 아니라 세계관 수준의 독립 컬렉션(worldview.references)으로 다룬다.
export type FieldType = "text" | "number" | "select" | "date";

// 참조 가능한 엔티티 종류 — 새 로어 엔티티가 생기면 여기에만 추가하면
// 참조 대상 후보·표시·백링크에 자동으로 편입된다.
export type EntityKind =
  | "character"
  | "group"
  | "place"
  | "race"
  | "glossary"
  | "chapter"
  | "event";

export const ENTITY_KINDS: EntityKind[] = [
  "character",
  "group",
  "place",
  "race",
  "glossary",
  "chapter",
  "event",
];

// 선택 필드의 옵션 한 칸 — id는 값 저장에 쓰는 안정 키, label은 표시 이름.
export interface FieldOption {
  id: string;
  label: string;
}

// 타입별 세부 제한. 해당 타입에서만 의미 있는 값은 다른 타입일 때 기본값(빈 배열·빈 문자열·null)으로 둔다.
export interface FieldConfig {
  type: FieldType;
  required: boolean;
  // select 전용
  multiple: boolean;
  options: FieldOption[];
  // number 전용
  unit: string;
  min: number | null;
  max: number | null;
  // text 전용
  maxLength: number | null;
}

export interface FieldDefinition {
  id: string;
  label: string;
  localized: boolean;
  config: FieldConfig;
}

// 다중 선택 값은 옵션 id들을 이 구분자로 이어 붙인 단일 문자열로 저장한다(옵션 id는 UUID라 충돌 없음).
export const MULTI_VALUE_SEPARATOR = ",";

export function defaultFieldConfig(): FieldConfig {
  return {
    type: "text",
    required: false,
    multiple: false,
    options: [],
    unit: "",
    min: null,
    max: null,
    maxLength: null,
  };
}

export function createFieldOption(label = ""): FieldOption {
  return { id: crypto.randomUUID(), label };
}

// 저장 문자열 ↔ 선택된 옵션 id 목록. 빈 문자열은 "선택 없음".
export function parseSelectValue(rawValue: string): string[] {
  return rawValue ? rawValue.split(MULTI_VALUE_SEPARATOR) : [];
}

export function serializeSelectValue(optionIds: string[]): string {
  return optionIds.join(MULTI_VALUE_SEPARATOR);
}

// 조직(세력·단체) — 캐릭터를 묶는 로어 엔티티. 다국어 이름·설명을 갖는다.
// 캐릭터의 소속은 worldview.references의 참조(대상 종류=group)로 표현한다.
export interface Group {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  description: string;
}

// 엔티티 간 참조(관계) — 어떤 엔티티든 다른 엔티티를 라벨 붙여 가리킨다. 방향이 있는 라벨 간선.
// 엔티티에 종속되지 않고 세계관 수준(worldview.references)에 독립적으로 모여 산다.
export interface Reference {
  id: string;
  sourceKind: EntityKind;
  sourceId: string;
  targetKind: EntityKind;
  targetId: string;
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

// 종족 간 관계 — 대상 종족과 자유 라벨(적대·동맹·파생 등). 캐릭터 관계(Relation)와 같은 형태.
export interface RaceRelation {
  targetRaceId: string;
  label: string;
}

// 종족의 구조화 속성 키 — 모두 자유 서술 문자열. 값 설정은 set-race-attribute 하나로 처리한다.
export type RaceAttributeKey = "lifespan" | "height" | "origin" | "language";

// 종족 — 캐릭터가 raceId로 소속되는 로어 엔티티. parentId로 계통(아종) 계층을 이루고,
// symbolColor는 상징색(HEX, 미지정 null), 속성·특성·종족 간 관계를 함께 갖는다.
export interface Race {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  symbolColor: string | null;
  parentId: string | null;
  lifespan: string;
  height: string;
  origin: string;
  language: string;
  traits: string[];
  relations: RaceRelation[];
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
  races: Race[];
  glossary: GlossaryTerm[];
  chapters: Chapter[];
  events: TimelineEvent[];
  // 엔티티 간 참조(관계)의 독립 컬렉션 — 어떤 엔티티든 출발점·대상이 될 수 있다.
  references: Reference[];
  // 상세 화면의 항목 순서 — 레이아웃 그룹(layoutId) → 항목 키 배열. 없으면 기본 순서(detailLayout.ts).
  detailOrders: Record<string, string[]>;
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
      config: defaultFieldConfig(),
    })),
    groups: [],
    places: [],
    races: [],
    glossary: [],
    chapters: [],
    events: [],
    references: [],
    detailOrders: {},
    createdAt: timestamp,
    modifiedAt: timestamp,
  };
}

export function createReference(
  sourceKind: EntityKind,
  sourceId: string,
  targetKind: EntityKind,
  targetId: string,
  label = "",
): Reference {
  return {
    id: crypto.randomUUID(),
    sourceKind,
    sourceId,
    targetKind,
    targetId,
    label,
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

export function createRace(name = ""): Race {
  return {
    id: crypto.randomUUID(),
    name,
    nameTranslations: {},
    symbolColor: null,
    parentId: null,
    lifespan: "",
    height: "",
    origin: "",
    language: "",
    traits: [],
    relations: [],
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

export function raceDisplayName(race: Race, locale: string): string {
  return race.nameTranslations[locale] || race.name;
}

export function eventDisplayTitle(event: TimelineEvent, locale: string): string {
  return event.titleTranslations[locale] || event.title;
}

// 선택 필드의 저장 값(옵션 id 문자열) → 옵션 라벨. 삭제된 옵션 id는 건너뛴다.
export function selectDisplayValue(config: FieldConfig, rawValue: string): string {
  return parseSelectValue(rawValue)
    .map((optionId) => config.options.find((option) => option.id === optionId))
    .filter((option): option is FieldOption => option !== undefined)
    .map((option) => option.label)
    .join(" · ");
}

// 엔티티 종류별 표시 이름 — id가 없거나 삭제된 대상이면 null. 참조 표시·백링크의 단일 진입점.
export function entityDisplayName(
  kind: EntityKind,
  worldview: Worldview,
  characters: Character[],
  id: string,
  locale: string,
): string | null {
  switch (kind) {
    case "character": {
      const character = characters.find(
        (existing) => existing.id === id && existing.deletedAt === null,
      );
      return character ? characterDisplayName(character, locale) : null;
    }
    case "group": {
      const group = worldview.groups.find((existing) => existing.id === id);
      return group ? groupDisplayName(group, locale) : null;
    }
    case "place": {
      const place = worldview.places.find((existing) => existing.id === id);
      return place ? placeDisplayName(place, locale) : null;
    }
    case "race": {
      const race = worldview.races.find((existing) => existing.id === id);
      return race ? raceDisplayName(race, locale) : null;
    }
    case "glossary": {
      const term = worldview.glossary.find((existing) => existing.id === id);
      return term ? glossaryTermDisplayName(term, locale) : null;
    }
    case "chapter": {
      const chapter = worldview.chapters.find((existing) => existing.id === id);
      return chapter ? chapterDisplayName(chapter, locale) : null;
    }
    case "event": {
      const event = worldview.events.find((existing) => existing.id === id);
      return event ? eventDisplayTitle(event, locale) : null;
    }
  }
}

// 참조 필드 후보 목록 — 해당 종류의 활성 인스턴스를 표시 이름순으로. 캐릭터는 휴지통 제외.
export function listEntities(
  kind: EntityKind,
  worldview: Worldview,
  characters: Character[],
  locale: string,
): { id: string; name: string }[] {
  const raw: { id: string; name: string }[] = (() => {
    switch (kind) {
      case "character":
        return characters
          .filter((character) => character.deletedAt === null)
          .map((character) => ({
            id: character.id,
            name: characterDisplayName(character, locale),
          }));
      case "group":
        return worldview.groups.map((group) => ({
          id: group.id,
          name: groupDisplayName(group, locale),
        }));
      case "place":
        return worldview.places.map((place) => ({
          id: place.id,
          name: placeDisplayName(place, locale),
        }));
      case "race":
        return worldview.races.map((race) => ({
          id: race.id,
          name: raceDisplayName(race, locale),
        }));
      case "glossary":
        return worldview.glossary.map((term) => ({
          id: term.id,
          name: glossaryTermDisplayName(term, locale),
        }));
      case "chapter":
        return worldview.chapters.map((chapter) => ({
          id: chapter.id,
          name: chapterDisplayName(chapter, locale),
        }));
      case "event":
        return worldview.events.map((event) => ({
          id: event.id,
          name: eventDisplayTitle(event, locale),
        }));
    }
  })();
  return raw.sort((first, second) =>
    (first.name || "-").localeCompare(second.name || "-", locale),
  );
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
  const rawValue = fieldDefinition.localized
    ? character.fieldValueTranslations[fieldDefinitionId]?.[locale] ||
      primaryValue
    : primaryValue;
  if (fieldDefinition.config.type === "select") {
    return selectDisplayValue(fieldDefinition.config, rawValue);
  }
  return rawValue;
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
