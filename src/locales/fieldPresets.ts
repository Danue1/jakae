import {
  createFieldOption,
  defaultFieldConfig,
  type FieldDefinition,
  type FieldType,
} from "../core/model";
import { type Locale } from "./config";

export type FieldPresetCategory =
  | "basic"
  | "body"
  | "personality"
  | "relation";

// 프리셋은 옵션 라벨만 담는다 — 옵션 id는 필드로 추가하는 시점에 부여해 캐릭터 값과 연결되는 안정 키로 삼는다.
export interface FieldPreset {
  key: string;
  category: FieldPresetCategory;
  label: string;
  type: FieldType;
  required?: boolean;
  multiple?: boolean;
  optionLabels?: string[];
  unit?: string;
  min?: number | null;
  max?: number | null;
  maxLength?: number | null;
}

export function fieldDefinitionFromPreset(preset: FieldPreset): FieldDefinition {
  const config = defaultFieldConfig();
  config.type = preset.type;
  config.required = preset.required ?? false;
  config.multiple = preset.multiple ?? false;
  config.options = (preset.optionLabels ?? []).map(createFieldOption);
  config.unit = preset.unit ?? "";
  config.min = preset.min ?? null;
  config.max = preset.max ?? null;
  config.maxLength = preset.maxLength ?? null;
  return {
    id: crypto.randomUUID(),
    label: preset.label,
    localized: false,
    config,
  };
}

// 새 세계관·샘플의 기본 캐릭터 필드(스칼라) — 종족·소속 등 관계는 필드가 아니라
// worldview.references(독립 참조 컬렉션)로 다룬다. 순서가 곧 카드 캡션(앞 두 필드).
interface DefaultFieldSeed {
  label: string;
  type: FieldType;
  optionLabels?: string[];
  unit?: string;
}

const DEFAULT_FIELDS: Record<Locale, DefaultFieldSeed[]> = {
  ko: [
    { label: "나이", type: "number", unit: "세" },
    { label: "성별", type: "text" },
    { label: "신장", type: "text" },
  ],
  en: [
    { label: "Age", type: "number", unit: "yrs" },
    { label: "Gender", type: "text" },
    { label: "Height", type: "text" },
  ],
  ja: [
    { label: "年齢", type: "number", unit: "歳" },
    { label: "性別", type: "text" },
    { label: "身長", type: "text" },
  ],
};

export function defaultCharacterFields(locale: Locale): FieldDefinition[] {
  return (DEFAULT_FIELDS[locale] ?? DEFAULT_FIELDS.ko).map((seed) => {
    const config = defaultFieldConfig();
    config.type = seed.type;
    if (seed.optionLabels) config.options = seed.optionLabels.map(createFieldOption);
    if (seed.unit) config.unit = seed.unit;
    return {
      id: crypto.randomUUID(),
      label: seed.label,
      localized: false,
      config,
    };
  });
}

const MBTI = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const BLOOD = ["A", "B", "O", "AB"];

const ko: FieldPreset[] = [
  { key: "age", category: "basic", label: "나이", type: "number", unit: "세", min: 0, max: 150 },
  { key: "gender", category: "basic", label: "성별", type: "select", optionLabels: ["남", "여", "기타"] },
  { key: "birthday", category: "basic", label: "생일", type: "date" },
  { key: "blood", category: "basic", label: "혈액형", type: "select", optionLabels: BLOOD },
  { key: "mbti", category: "basic", label: "MBTI", type: "select", optionLabels: MBTI },
  { key: "height", category: "body", label: "키", type: "number", unit: "cm" },
  { key: "weight", category: "body", label: "몸무게", type: "number", unit: "kg" },
  { key: "tagline", category: "personality", label: "한 줄 소개", type: "text", maxLength: 40 },
  { key: "personality", category: "personality", label: "성격", type: "text" },
  { key: "job", category: "relation", label: "직업", type: "text" },
];

const en: FieldPreset[] = [
  { key: "age", category: "basic", label: "Age", type: "number", unit: "yrs", min: 0, max: 150 },
  { key: "gender", category: "basic", label: "Gender", type: "select", optionLabels: ["Male", "Female", "Other"] },
  { key: "birthday", category: "basic", label: "Birthday", type: "date" },
  { key: "blood", category: "basic", label: "Blood type", type: "select", optionLabels: BLOOD },
  { key: "mbti", category: "basic", label: "MBTI", type: "select", optionLabels: MBTI },
  { key: "height", category: "body", label: "Height", type: "number", unit: "cm" },
  { key: "weight", category: "body", label: "Weight", type: "number", unit: "kg" },
  { key: "tagline", category: "personality", label: "Tagline", type: "text", maxLength: 40 },
  { key: "personality", category: "personality", label: "Personality", type: "text" },
  { key: "job", category: "relation", label: "Occupation", type: "text" },
];

const ja: FieldPreset[] = [
  { key: "age", category: "basic", label: "年齢", type: "number", unit: "歳", min: 0, max: 150 },
  { key: "gender", category: "basic", label: "性別", type: "select", optionLabels: ["男", "女", "その他"] },
  { key: "birthday", category: "basic", label: "誕生日", type: "date" },
  { key: "blood", category: "basic", label: "血液型", type: "select", optionLabels: BLOOD },
  { key: "mbti", category: "basic", label: "MBTI", type: "select", optionLabels: MBTI },
  { key: "height", category: "body", label: "身長", type: "number", unit: "cm" },
  { key: "weight", category: "body", label: "体重", type: "number", unit: "kg" },
  { key: "tagline", category: "personality", label: "ひとこと紹介", type: "text", maxLength: 40 },
  { key: "personality", category: "personality", label: "性格", type: "text" },
  { key: "job", category: "relation", label: "職業", type: "text" },
];

const PRESETS: Record<Locale, FieldPreset[]> = { ko, en, ja };

export function getFieldPresets(locale: Locale): FieldPreset[] {
  return PRESETS[locale];
}

export const FIELD_PRESET_CATEGORIES: FieldPresetCategory[] = [
  "basic",
  "body",
  "personality",
  "relation",
];
