import type {
  Character,
  CharacterAppearance,
  FieldDefinition,
  Relation,
  Worldview,
} from "./model";

// v1·v2 데이터(particles, builtIn 플래그, 다국어 필드 부재)를 v3 형태로 읽기 시점에 정규화한다.
// 파괴적 변환이 없으므로 저장소 스키마 버전은 올리지 않는다.

export interface LegacyWorldviewRecord
  extends Omit<
    Worldview,
    "connectors" | "fieldDefinitions" | "primaryLocale" | "nameTranslations"
  > {
  primaryLocale?: string;
  nameTranslations?: Record<string, string>;
  connectors?: string[];
  particles?: string[];
  fieldDefinitions: (Omit<FieldDefinition, "localized"> & {
    localized?: boolean;
    builtIn?: boolean;
    type?: string;
  })[];
}

export interface LegacyCharacterRecord
  extends Omit<
    Character,
    "appearance" | "relations" | "nameTranslations" | "fieldValueTranslations"
  > {
  nameTranslations?: Record<string, string>;
  fieldValueTranslations?: Record<string, Record<string, string>>;
  appearance?: CharacterAppearance;
  relations: (Omit<Relation, "connector"> & {
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
    era: record.era,
    primaryLocale: record.primaryLocale ?? "ko",
    fieldDefinitions: record.fieldDefinitions.map((fieldDefinition) => ({
      id: fieldDefinition.id,
      label: fieldDefinition.label,
      localized: fieldDefinition.localized ?? false,
    })),
    connectors: record.connectors ?? record.particles ?? [],
    groups: record.groups,
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
    imageId: record.imageId,
    appearance: record.appearance ?? { backgroundColor: null },
    fieldValues: record.fieldValues,
    fieldValueTranslations: record.fieldValueTranslations ?? {},
    personalityTags: record.personalityTags,
    story: record.story,
    relations: record.relations.map((relation) => ({
      targetCharacterId: relation.targetCharacterId,
      connector: relation.connector ?? relation.particle ?? "",
      label: relation.label,
    })),
    groupIds: record.groupIds,
    favorite: record.favorite,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    modifiedAt: record.modifiedAt,
  };
}
