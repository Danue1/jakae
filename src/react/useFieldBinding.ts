import { useLocale } from "next-intl";
import type { ChangeEvent } from "react";
import { dispatchCommand } from "../store/worldviewStore";
import type { WorldviewStoreState } from "../store/worldviewStore";
import { useWorldviewStore } from "./useWorldviewStore";

function editsTranslation(
  state: WorldviewStoreState,
  fieldDefinitionId: string,
  locale: string,
): boolean {
  const fieldDefinition = state.worldview?.fieldDefinitions.find(
    (existing) => existing.id === fieldDefinitionId,
  );
  return (
    fieldDefinition?.localized === true &&
    state.worldview?.primaryLocale !== locale
  );
}

// 도메인 필드 입력의 단일 바인딩 경로. 언어별 필드는 editingLocale 슬롯을 편집하고
// (기본값: 보고 있는 언어), 원본 값이 placeholder로 보인다.
export function useFieldBinding(
  characterId: string,
  fieldDefinitionId: string,
  editingLocale?: string,
): {
  value: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
} {
  const interfaceLocale = useLocale();
  const locale = editingLocale ?? interfaceLocale;
  const value = useWorldviewStore((state) => {
    const character = state.characters.find(
      (existing) => existing.id === characterId,
    );
    if (editsTranslation(state, fieldDefinitionId, locale)) {
      return (
        character?.fieldValueTranslations[fieldDefinitionId]?.[locale] ?? ""
      );
    }
    return character?.fieldValues[fieldDefinitionId] ?? "";
  });
  const placeholder = useWorldviewStore((state) => {
    if (!editsTranslation(state, fieldDefinitionId, locale)) return "-";
    const character = state.characters.find(
      (existing) => existing.id === characterId,
    );
    return character?.fieldValues[fieldDefinitionId] || "-";
  });
  return {
    value,
    placeholder,
    onChange: (event) =>
      dispatchCommand({
        type: "set-field-value",
        characterId,
        fieldDefinitionId,
        value: event.target.value,
        locale,
      }),
  };
}
