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

export interface Worldview {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  era: string;
  primaryLocale: string;
  fieldDefinitions: FieldDefinition[];
  connectors: string[];
  groups: Group[];
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
    createdAt: timestamp,
    modifiedAt: timestamp,
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
