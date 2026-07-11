import type {
  Character,
  FieldDefinition,
  Group,
  Relation,
  Worldview,
} from "./model";

export interface WorldviewState {
  worldview: Worldview;
  characters: Character[];
}

export interface InboundRelation {
  characterId: string;
  relation: Relation;
  relationIndex: number;
}

export type WorldviewCommand =
  | { type: "rename-worldview"; name: string; locale: string }
  | { type: "set-worldview-era"; era: string }
  | { type: "set-primary-locale"; primaryLocale: string }
  | { type: "set-connectors"; connectors: string[] }
  | { type: "add-group"; group: Group }
  | { type: "remove-group"; groupId: string }
  | {
      type: "restore-group";
      group: Group;
      groupIndex: number;
      memberCharacterIds: string[];
    }
  | { type: "add-field-definition"; fieldDefinition: FieldDefinition }
  | { type: "rename-field-definition"; fieldDefinitionId: string; label: string }
  | {
      type: "set-field-localized";
      fieldDefinitionId: string;
      localized: boolean;
    }
  | {
      type: "move-field-definition";
      fieldDefinitionId: string;
      targetIndex: number;
    }
  | { type: "delete-field-definition"; fieldDefinitionId: string }
  | {
      type: "restore-field-definition";
      fieldDefinition: FieldDefinition;
      fieldIndex: number;
      fieldValues: Record<string, string>;
    }
  | { type: "create-character"; character: Character }
  | { type: "delete-character-permanently"; characterId: string }
  | {
      type: "restore-deleted-character";
      character: Character;
      inboundRelations: InboundRelation[];
    }
  | { type: "rename-character"; characterId: string; name: string; locale: string }
  | {
      type: "set-field-value";
      characterId: string;
      fieldDefinitionId: string;
      value: string;
      locale: string;
    }
  | { type: "set-story"; characterId: string; story: string }
  | { type: "set-personality-tags"; characterId: string; personalityTags: string[] }
  | { type: "set-character-image"; characterId: string; imageId: string | null }
  | {
      type: "set-character-background-color";
      characterId: string;
      backgroundColor: string | null;
    }
  | { type: "set-favorite"; characterId: string; favorite: boolean }
  | {
      type: "set-group-membership";
      characterId: string;
      groupId: string;
      assigned: boolean;
    }
  | { type: "add-relation"; characterId: string; relation: Relation }
  | { type: "remove-relation"; characterId: string; relationIndex: number }
  | {
      type: "restore-relation";
      characterId: string;
      relation: Relation;
      relationIndex: number;
    }
  | { type: "move-to-trash"; characterId: string }
  | { type: "restore-from-trash"; characterId: string };

export interface DirtySet {
  worldview?: boolean;
  characterIds?: string[];
  removedCharacterIds?: string[];
}

export interface AppliedCommand {
  state: WorldviewState;
  inverse: WorldviewCommand;
  dirty: DirtySet;
}

function requireCharacter(state: WorldviewState, characterId: string): Character {
  const character = state.characters.find(
    (existing) => existing.id === characterId,
  );
  if (!character) throw new Error(`존재하지 않는 캐릭터: ${characterId}`);
  return character;
}

function patchCharacter(
  state: WorldviewState,
  characterId: string,
  patch: Partial<Character>,
  timestamp: number,
): WorldviewState {
  return {
    ...state,
    characters: state.characters.map((existing) =>
      existing.id === characterId
        ? { ...existing, ...patch, modifiedAt: timestamp }
        : existing,
    ),
  };
}

function patchWorldview(
  state: WorldviewState,
  patch: Partial<Worldview>,
  timestamp: number,
): WorldviewState {
  return {
    ...state,
    worldview: { ...state.worldview, ...patch, modifiedAt: timestamp },
  };
}

function insertAt<Element>(
  list: Element[],
  index: number,
  element: Element,
): Element[] {
  const clampedIndex = Math.max(0, Math.min(index, list.length));
  return [...list.slice(0, clampedIndex), element, ...list.slice(clampedIndex)];
}

// 빈 값은 "지정 안 함" — 키를 지워 원본 값으로의 폴백을 유지한다.
function withLocaleValue(
  translations: Record<string, string>,
  locale: string,
  value: string,
): Record<string, string> {
  const next = { ...translations };
  if (value) next[locale] = value;
  else delete next[locale];
  return next;
}

export function applyCommand(
  state: WorldviewState,
  command: WorldviewCommand,
  timestamp: number,
): AppliedCommand {
  switch (command.type) {
    case "rename-worldview": {
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchWorldview(
            state,
            {
              nameTranslations: withLocaleValue(
                state.worldview.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-worldview",
            name: state.worldview.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchWorldview(state, { name: command.name }, timestamp),
        inverse: {
          type: "rename-worldview",
          name: state.worldview.name,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-primary-locale":
      return {
        state: patchWorldview(
          state,
          { primaryLocale: command.primaryLocale },
          timestamp,
        ),
        inverse: {
          type: "set-primary-locale",
          primaryLocale: state.worldview.primaryLocale,
        },
        dirty: { worldview: true },
      };

    case "set-worldview-era":
      return {
        state: patchWorldview(state, { era: command.era }, timestamp),
        inverse: { type: "set-worldview-era", era: state.worldview.era },
        dirty: { worldview: true },
      };

    case "set-connectors":
      return {
        state: patchWorldview(state, { connectors: command.connectors }, timestamp),
        inverse: { type: "set-connectors", connectors: state.worldview.connectors },
        dirty: { worldview: true },
      };

    case "add-group":
      return {
        state: patchWorldview(
          state,
          { groups: [...state.worldview.groups, command.group] },
          timestamp,
        ),
        inverse: { type: "remove-group", groupId: command.group.id },
        dirty: { worldview: true },
      };

    case "remove-group": {
      const groupIndex = state.worldview.groups.findIndex(
        (group) => group.id === command.groupId,
      );
      const group = state.worldview.groups[groupIndex];
      if (!group) throw new Error(`존재하지 않는 그룹: ${command.groupId}`);
      const memberCharacterIds = state.characters
        .filter((character) => character.groupIds.includes(command.groupId))
        .map((character) => character.id);
      let nextState = patchWorldview(
        state,
        {
          groups: state.worldview.groups.filter(
            (existing) => existing.id !== command.groupId,
          ),
        },
        timestamp,
      );
      for (const characterId of memberCharacterIds) {
        const character = requireCharacter(nextState, characterId);
        nextState = patchCharacter(
          nextState,
          characterId,
          {
            groupIds: character.groupIds.filter(
              (groupId) => groupId !== command.groupId,
            ),
          },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: { type: "restore-group", group, groupIndex, memberCharacterIds },
        dirty: { worldview: true, characterIds: memberCharacterIds },
      };
    }

    case "restore-group": {
      let nextState = patchWorldview(
        state,
        {
          groups: insertAt(state.worldview.groups, command.groupIndex, command.group),
        },
        timestamp,
      );
      for (const characterId of command.memberCharacterIds) {
        const character = requireCharacter(nextState, characterId);
        nextState = patchCharacter(
          nextState,
          characterId,
          { groupIds: [...character.groupIds, command.group.id] },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: { type: "remove-group", groupId: command.group.id },
        dirty: { worldview: true, characterIds: command.memberCharacterIds },
      };
    }

    case "add-field-definition":
      return {
        state: patchWorldview(
          state,
          {
            fieldDefinitions: [
              ...state.worldview.fieldDefinitions,
              command.fieldDefinition,
            ],
          },
          timestamp,
        ),
        inverse: {
          type: "delete-field-definition",
          fieldDefinitionId: command.fieldDefinition.id,
        },
        dirty: { worldview: true },
      };

    case "set-field-localized": {
      const fieldDefinition = state.worldview.fieldDefinitions.find(
        (existing) => existing.id === command.fieldDefinitionId,
      );
      if (!fieldDefinition)
        throw new Error(`존재하지 않는 필드: ${command.fieldDefinitionId}`);
      return {
        state: patchWorldview(
          state,
          {
            fieldDefinitions: state.worldview.fieldDefinitions.map((existing) =>
              existing.id === command.fieldDefinitionId
                ? { ...existing, localized: command.localized }
                : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-field-localized",
          fieldDefinitionId: command.fieldDefinitionId,
          localized: fieldDefinition.localized,
        },
        dirty: { worldview: true },
      };
    }

    case "rename-field-definition": {
      const fieldDefinition = state.worldview.fieldDefinitions.find(
        (existing) => existing.id === command.fieldDefinitionId,
      );
      if (!fieldDefinition)
        throw new Error(`존재하지 않는 필드: ${command.fieldDefinitionId}`);
      return {
        state: patchWorldview(
          state,
          {
            fieldDefinitions: state.worldview.fieldDefinitions.map((existing) =>
              existing.id === command.fieldDefinitionId
                ? { ...existing, label: command.label }
                : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "rename-field-definition",
          fieldDefinitionId: command.fieldDefinitionId,
          label: fieldDefinition.label,
        },
        dirty: { worldview: true },
      };
    }

    case "move-field-definition": {
      const currentIndex = state.worldview.fieldDefinitions.findIndex(
        (existing) => existing.id === command.fieldDefinitionId,
      );
      const fieldDefinition = state.worldview.fieldDefinitions[currentIndex];
      if (!fieldDefinition)
        throw new Error(`존재하지 않는 필드: ${command.fieldDefinitionId}`);
      const withoutField = state.worldview.fieldDefinitions.filter(
        (existing) => existing.id !== command.fieldDefinitionId,
      );
      return {
        state: patchWorldview(
          state,
          {
            fieldDefinitions: insertAt(
              withoutField,
              command.targetIndex,
              fieldDefinition,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "move-field-definition",
          fieldDefinitionId: command.fieldDefinitionId,
          targetIndex: currentIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "delete-field-definition": {
      const fieldIndex = state.worldview.fieldDefinitions.findIndex(
        (fieldDefinition) => fieldDefinition.id === command.fieldDefinitionId,
      );
      const fieldDefinition = state.worldview.fieldDefinitions[fieldIndex];
      if (!fieldDefinition)
        throw new Error(`존재하지 않는 필드: ${command.fieldDefinitionId}`);
      const fieldValues: Record<string, string> = {};
      let nextState = patchWorldview(
        state,
        {
          fieldDefinitions: state.worldview.fieldDefinitions.filter(
            (existing) => existing.id !== command.fieldDefinitionId,
          ),
        },
        timestamp,
      );
      const affectedCharacterIds: string[] = [];
      for (const character of state.characters) {
        const value = character.fieldValues[command.fieldDefinitionId];
        if (value === undefined) continue;
        fieldValues[character.id] = value;
        affectedCharacterIds.push(character.id);
        const remaining = Object.fromEntries(
          Object.entries(character.fieldValues).filter(
            ([fieldDefinitionId]) =>
              fieldDefinitionId !== command.fieldDefinitionId,
          ),
        );
        nextState = patchCharacter(
          nextState,
          character.id,
          { fieldValues: remaining },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: {
          type: "restore-field-definition",
          fieldDefinition,
          fieldIndex,
          fieldValues,
        },
        dirty: { worldview: true, characterIds: affectedCharacterIds },
      };
    }

    case "restore-field-definition": {
      let nextState = patchWorldview(
        state,
        {
          fieldDefinitions: insertAt(
            state.worldview.fieldDefinitions,
            command.fieldIndex,
            command.fieldDefinition,
          ),
        },
        timestamp,
      );
      const affectedCharacterIds = Object.keys(command.fieldValues);
      for (const [characterId, value] of Object.entries(command.fieldValues)) {
        const character = requireCharacter(nextState, characterId);
        nextState = patchCharacter(
          nextState,
          characterId,
          {
            fieldValues: {
              ...character.fieldValues,
              [command.fieldDefinition.id]: value,
            },
          },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: {
          type: "delete-field-definition",
          fieldDefinitionId: command.fieldDefinition.id,
        },
        dirty: { worldview: true, characterIds: affectedCharacterIds },
      };
    }

    case "create-character":
      return {
        state: { ...state, characters: [...state.characters, command.character] },
        inverse: {
          type: "delete-character-permanently",
          characterId: command.character.id,
        },
        dirty: { characterIds: [command.character.id] },
      };

    case "delete-character-permanently": {
      const character = requireCharacter(state, command.characterId);
      const inboundRelations: InboundRelation[] = [];
      for (const other of state.characters) {
        if (other.id === command.characterId) continue;
        other.relations.forEach((relation, relationIndex) => {
          if (relation.targetCharacterId === command.characterId) {
            inboundRelations.push({ characterId: other.id, relation, relationIndex });
          }
        });
      }
      let nextState: WorldviewState = {
        ...state,
        characters: state.characters.filter(
          (existing) => existing.id !== command.characterId,
        ),
      };
      const affectedCharacterIds = [
        ...new Set(inboundRelations.map((inbound) => inbound.characterId)),
      ];
      for (const characterId of affectedCharacterIds) {
        const other = requireCharacter(nextState, characterId);
        nextState = patchCharacter(
          nextState,
          characterId,
          {
            relations: other.relations.filter(
              (relation) => relation.targetCharacterId !== command.characterId,
            ),
          },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: { type: "restore-deleted-character", character, inboundRelations },
        dirty: {
          removedCharacterIds: [command.characterId],
          characterIds: affectedCharacterIds,
        },
      };
    }

    case "restore-deleted-character": {
      let nextState: WorldviewState = {
        ...state,
        characters: [...state.characters, command.character],
      };
      const affectedCharacterIds = [
        ...new Set(command.inboundRelations.map((inbound) => inbound.characterId)),
      ];
      for (const inbound of command.inboundRelations) {
        const other = requireCharacter(nextState, inbound.characterId);
        nextState = patchCharacter(
          nextState,
          inbound.characterId,
          {
            relations: insertAt(
              other.relations,
              inbound.relationIndex,
              inbound.relation,
            ),
          },
          timestamp,
        );
      }
      return {
        state: nextState,
        inverse: {
          type: "delete-character-permanently",
          characterId: command.character.id,
        },
        dirty: {
          characterIds: [command.character.id, ...affectedCharacterIds],
        },
      };
    }

    case "rename-character": {
      const character = requireCharacter(state, command.characterId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchCharacter(
            state,
            command.characterId,
            {
              nameTranslations: withLocaleValue(
                character.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-character",
            characterId: command.characterId,
            name: character.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { characterIds: [command.characterId] },
        };
      }
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { name: command.name },
          timestamp,
        ),
        inverse: {
          type: "rename-character",
          characterId: command.characterId,
          name: character.name,
          locale: command.locale,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-field-value": {
      const character = requireCharacter(state, command.characterId);
      const fieldDefinition = state.worldview.fieldDefinitions.find(
        (existing) => existing.id === command.fieldDefinitionId,
      );
      const editsTranslation =
        fieldDefinition?.localized === true &&
        command.locale !== state.worldview.primaryLocale;
      if (editsTranslation) {
        return {
          state: patchCharacter(
            state,
            command.characterId,
            {
              fieldValueTranslations: {
                ...character.fieldValueTranslations,
                [command.fieldDefinitionId]: withLocaleValue(
                  character.fieldValueTranslations[command.fieldDefinitionId] ??
                    {},
                  command.locale,
                  command.value,
                ),
              },
            },
            timestamp,
          ),
          inverse: {
            type: "set-field-value",
            characterId: command.characterId,
            fieldDefinitionId: command.fieldDefinitionId,
            value:
              character.fieldValueTranslations[command.fieldDefinitionId]?.[
                command.locale
              ] ?? "",
            locale: command.locale,
          },
          dirty: { characterIds: [command.characterId] },
        };
      }
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            fieldValues: {
              ...character.fieldValues,
              [command.fieldDefinitionId]: command.value,
            },
          },
          timestamp,
        ),
        inverse: {
          type: "set-field-value",
          characterId: command.characterId,
          fieldDefinitionId: command.fieldDefinitionId,
          value: character.fieldValues[command.fieldDefinitionId] ?? "",
          locale: command.locale,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-story": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { story: command.story },
          timestamp,
        ),
        inverse: {
          type: "set-story",
          characterId: command.characterId,
          story: character.story,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-personality-tags": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { personalityTags: command.personalityTags },
          timestamp,
        ),
        inverse: {
          type: "set-personality-tags",
          characterId: command.characterId,
          personalityTags: character.personalityTags,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-character-image": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { imageId: command.imageId },
          timestamp,
        ),
        inverse: {
          type: "set-character-image",
          characterId: command.characterId,
          imageId: character.imageId,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-character-background-color": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { appearance: { backgroundColor: command.backgroundColor } },
          timestamp,
        ),
        inverse: {
          type: "set-character-background-color",
          characterId: command.characterId,
          backgroundColor: character.appearance.backgroundColor,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-favorite": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { favorite: command.favorite },
          timestamp,
        ),
        inverse: {
          type: "set-favorite",
          characterId: command.characterId,
          favorite: character.favorite,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-group-membership": {
      const character = requireCharacter(state, command.characterId);
      const groupIds = command.assigned
        ? [...new Set([...character.groupIds, command.groupId])]
        : character.groupIds.filter((groupId) => groupId !== command.groupId);
      return {
        state: patchCharacter(state, command.characterId, { groupIds }, timestamp),
        inverse: {
          type: "set-group-membership",
          characterId: command.characterId,
          groupId: command.groupId,
          assigned: !command.assigned,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "add-relation": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { relations: [...character.relations, command.relation] },
          timestamp,
        ),
        inverse: {
          type: "remove-relation",
          characterId: command.characterId,
          relationIndex: character.relations.length,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "remove-relation": {
      const character = requireCharacter(state, command.characterId);
      const relation = character.relations[command.relationIndex];
      if (!relation)
        throw new Error(`존재하지 않는 관계: ${command.relationIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            relations: [
              ...character.relations.slice(0, command.relationIndex),
              ...character.relations.slice(command.relationIndex + 1),
            ],
          },
          timestamp,
        ),
        inverse: {
          type: "restore-relation",
          characterId: command.characterId,
          relation,
          relationIndex: command.relationIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "restore-relation": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            relations: insertAt(
              character.relations,
              command.relationIndex,
              command.relation,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "remove-relation",
          characterId: command.characterId,
          relationIndex: command.relationIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "move-to-trash":
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { deletedAt: timestamp },
          timestamp,
        ),
        inverse: { type: "restore-from-trash", characterId: command.characterId },
        dirty: { characterIds: [command.characterId] },
      };

    case "restore-from-trash":
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { deletedAt: null },
          timestamp,
        ),
        inverse: { type: "move-to-trash", characterId: command.characterId },
        dirty: { characterIds: [command.characterId] },
      };
  }
}
