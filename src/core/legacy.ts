import {
  defaultFieldConfig,
  type Chapter,
  type Character,
  type CharacterAppearance,
  type CharacterImage,
  type CharacterQuote,
  type FieldConfig,
  type FieldDefinition,
  type FieldOption,
  type FieldType,
  type GlossaryTerm,
  type Group,
  type PaletteColor,
  type Place,
  type Relation,
  type TimelineEvent,
  type Worldview,
} from "./model";

const FIELD_TYPES: readonly FieldType[] = ["text", "number", "select", "date"];

function isFieldType(value: unknown): value is FieldType {
  return typeof value === "string" && FIELD_TYPES.includes(value as FieldType);
}

// v1~v3 데이터엔 config가 없다 — 누락 키를 기본값으로 채우고, 예전 flat type 힌트가 있으면 반영한다.
function normalizeFieldConfig(
  raw: Partial<FieldConfig> | undefined,
  legacyType: string | undefined,
): FieldConfig {
  const base = defaultFieldConfig();
  if (!raw) {
    return { ...base, type: isFieldType(legacyType) ? legacyType : base.type };
  }
  return {
    type: isFieldType(raw.type) ? raw.type : base.type,
    required: raw.required ?? base.required,
    multiple: raw.multiple ?? base.multiple,
    options: (raw.options ?? base.options).map(
      (option): FieldOption => ({ id: option.id, label: option.label }),
    ),
    unit: raw.unit ?? base.unit,
    min: raw.min ?? base.min,
    max: raw.max ?? base.max,
    maxLength: raw.maxLength ?? base.maxLength,
  };
}

// v1·v2 데이터(particles, builtIn 플래그, 다국어 필드 부재)를 v3 형태로 읽기 시점에 정규화한다.
// 파괴적 변환이 없으므로 저장소 스키마 버전은 올리지 않는다.

export interface LegacyWorldviewRecord
  extends Omit<
    Worldview,
    | "fieldDefinitions"
    | "primaryLocale"
    | "nameTranslations"
    | "synopsis"
    | "synopsisTranslations"
    | "genreTags"
    | "palette"
    | "groups"
    | "places"
    | "glossary"
    | "chapters"
    | "events"
  > {
  primaryLocale?: string;
  nameTranslations?: Record<string, string>;
  synopsis?: string;
  synopsisTranslations?: Record<string, string>;
  genreTags?: string[];
  palette?: PaletteColor[];
  // v1·v2 잔존 필드 — 읽되 무시한다(연결어는 언어 고정값으로 대체됨).
  connectors?: string[];
  particles?: string[];
  // 그룹은 조직으로 승격되며 다국어명·설명이 새로 붙는다(구 데이터엔 없음).
  groups: (Omit<Group, "nameTranslations" | "description"> & {
    nameTranslations?: Record<string, string>;
    description?: string;
  })[];
  places?: Place[];
  glossary?: GlossaryTerm[];
  chapters?: Chapter[];
  events?: (Omit<TimelineEvent, "placeId"> & { placeId?: string | null })[];
  fieldDefinitions: (Omit<FieldDefinition, "localized" | "config"> & {
    localized?: boolean;
    builtIn?: boolean;
    type?: string;
    config?: Partial<FieldConfig>;
  })[];
}

export interface LegacyCharacterRecord
  extends Omit<
    Character,
    | "appearance"
    | "relations"
    | "nameTranslations"
    | "fieldValueTranslations"
    | "images"
    | "coverImageId"
    | "quotes"
    | "tags"
  > {
  tags?: string[];
  nameTranslations?: Record<string, string>;
  fieldValueTranslations?: Record<string, Record<string, string>>;
  appearance?: Omit<CharacterAppearance, "palette"> & {
    palette?: PaletteColor[];
  };
  imageId?: string | null;
  images?: CharacterImage[];
  coverImageId?: string | null;
  quotes?: CharacterQuote[];
  relations: (Relation & {
    connector?: string;
    particle?: string;
  })[];
}

export function normalizeWorldviewRecord(
  record: LegacyWorldviewRecord,
): Worldview {
  return {
    id: record.id,
    name: record.name,
    nameTranslations: record.nameTranslations ?? {},
    synopsis: record.synopsis ?? "",
    synopsisTranslations: record.synopsisTranslations ?? {},
    genreTags: record.genreTags ?? [],
    palette: record.palette ?? [],
    era: record.era,
    primaryLocale: record.primaryLocale ?? "ko",
    fieldDefinitions: record.fieldDefinitions.map((fieldDefinition) => ({
      id: fieldDefinition.id,
      label: fieldDefinition.label,
      localized: fieldDefinition.localized ?? false,
      config: normalizeFieldConfig(fieldDefinition.config, fieldDefinition.type),
    })),
    groups: record.groups.map((group) => ({
      id: group.id,
      name: group.name,
      nameTranslations: group.nameTranslations ?? {},
      description: group.description ?? "",
    })),
    places: record.places ?? [],
    glossary: record.glossary ?? [],
    chapters: record.chapters ?? [],
    events: (record.events ?? []).map((event) => ({
      id: event.id,
      chapterId: event.chapterId ?? null,
      ownerCharacterId: event.ownerCharacterId ?? null,
      title: event.title,
      titleTranslations: event.titleTranslations ?? {},
      when: event.when ?? "",
      place: event.place ?? "",
      placeId: event.placeId ?? null,
      description: event.description ?? "",
      participants: (event.participants ?? []).map((participant) => ({
        characterId: participant.characterId,
        role: participant.role ?? "",
      })),
    })),
    createdAt: record.createdAt,
    modifiedAt: record.modifiedAt,
  };
}

export function normalizeCharacterRecord(
  record: LegacyCharacterRecord,
): Character {
  return {
    id: record.id,
    worldviewId: record.worldviewId,
    name: record.name,
    nameTranslations: record.nameTranslations ?? {},
    // 구 단일 imageId → 이미지 목록 1장. 항목 id는 blobId를 재사용해 읽을 때마다 안정적으로 둔다.
    images:
      record.images ??
      (record.imageId
        ? [{ id: record.imageId, blobId: record.imageId, caption: "" }]
        : []),
    coverImageId: record.coverImageId ?? record.imageId ?? null,
    appearance: {
      backgroundColor: record.appearance?.backgroundColor ?? null,
      palette: record.appearance?.palette ?? [],
    },
    fieldValues: record.fieldValues,
    fieldValueTranslations: record.fieldValueTranslations ?? {},
    personalityTags: record.personalityTags,
    tags: record.tags ?? [],
    quotes: record.quotes ?? [],
    story: record.story,
    relations: record.relations.map((relation) => ({
      targetCharacterId: relation.targetCharacterId,
      label: relation.label,
    })),
    groupIds: record.groupIds,
    favorite: record.favorite,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    modifiedAt: record.modifiedAt,
  };
}
