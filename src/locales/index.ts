import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";

export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_STORAGE_KEY = "character-organizer.locale";

export interface SampleCharacterSeed {
  name: string;
  fieldValues: string[];
  tags: string[];
  story: string;
  favorite: boolean;
  groupIndex: 0 | 1 | null;
}

export interface SampleRelationSeed {
  fromIndex: number;
  toIndex: number;
  connectorIndex: number;
  label: string;
}

export interface SeedContent {
  fieldLabels: string[];
  connectors: string[];
  sampleWorldviewName: string;
  sampleEra: string;
  sampleGroups: [string, string];
  sampleCharacters: SampleCharacterSeed[];
  sampleRelations: SampleRelationSeed[];
}

export interface Dictionary {
  languageName: string;
  appName: string;
  metaDescription: string;
  common: {
    back: string;
    cancel: string;
    delete: string;
    add: string;
    more: string;
    saved: string;
    saving: string;
    saveFailedRetry: string;
  };
  library: {
    title: string;
    newWorldview: string;
    newWorldviewName: string;
    importFile: string;
    importFailed: string;
    importFailedInvalid: string;
    importFailedNewerVersion: string;
    modified: (dateText: string) => string;
    deleteWorldviewTitle: (name: string) => string;
    deleteWorldviewDescription: string;
    empty: string;
  };
  world: {
    eraPrefix: string;
    searchPlaceholder: string;
    chipAll: string;
    chipTrash: string;
    addCharacter: string;
    settings: string;
    emptyFiltered: string;
    resetFilters: string;
    trashEmpty: string;
    restore: string;
    deleteForever: string;
    deleteCharacterTitle: (name: string) => string;
    deleteCharacterDescription: string;
    edit: string;
    duplicate: string;
    favorite: string;
    unfavorite: string;
    moveToTrash: string;
    missingTitle: string;
    missingBody: string;
    goLibrary: string;
  };
  character: {
    namePlaceholder: string;
    profile: string;
    manageFields: string;
    personality: string;
    tagPlaceholder: string;
    story: string;
    storyPlaceholder: string;
    relations: string;
    relationTargetPlaceholder: string;
    relationLabelPlaceholder: string;
    addRelation: string;
    groups: string;
    background: string;
    backgroundAuto: string;
    backgroundCustom: string;
    duplicate: string;
    moveToTrash: string;
    copySuffix: string;
    attachImage: string;
  };
  settings: {
    title: string;
    basicInfo: string;
    nameLabel: string;
    eraLabel: string;
    primaryLocaleLabel: string;
    fieldsTitle: string;
    fieldsHint: string;
    localizedToggle: string;
    fieldNamePlaceholder: string;
    addField: string;
    deleteFieldTitle: (label: string) => string;
    deleteFieldDescription: string;
    moveUp: string;
    moveDown: string;
    groupsTitle: string;
    groupPlaceholder: string;
    addGroup: string;
    connectorsTitle: string;
    connectorsHint: string;
    connectorPlaceholder: string;
    addConnector: string;
  };
  notFound: {
    title: string;
    body: string;
    goHome: string;
  };
  seed: SeedContent;
}

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en, ja };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function detectPreferredLocale(navigatorLanguage: string): Locale {
  const languageCode = navigatorLanguage.toLowerCase().slice(0, 2);
  return isLocale(languageCode) ? languageCode : DEFAULT_LOCALE;
}
