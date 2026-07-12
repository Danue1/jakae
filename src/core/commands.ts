import type {
  Chapter,
  Character,
  EventParticipant,
  FieldDefinition,
  Group,
  Relation,
  TimelineEvent,
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

// 자캐 영구 삭제 시 함께 정리되는 연표 흔적 — 역커맨드가 정확히 되돌리기 위해 보관한다.
export interface RemovedParticipation {
  eventId: string;
  participant: EventParticipant;
  participantIndex: number;
}

export interface RemovedPersonalEvent {
  event: TimelineEvent;
  eventIndex: number;
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
  | { type: "add-chapter"; chapter: Chapter }
  | { type: "remove-chapter"; chapterId: string }
  | {
      type: "restore-chapter";
      chapter: Chapter;
      chapterIndex: number;
      memberEventIds: string[];
    }
  | { type: "rename-chapter"; chapterId: string; name: string; locale: string }
  | { type: "set-chapter-era"; chapterId: string; era: string }
  | { type: "set-chapter-description"; chapterId: string; description: string }
  | { type: "move-chapter"; chapterId: string; targetIndex: number }
  | { type: "add-event"; event: TimelineEvent }
  | { type: "remove-event"; eventId: string }
  | { type: "restore-event"; event: TimelineEvent; eventIndex: number }
  | { type: "set-event-title"; eventId: string; title: string; locale: string }
  | { type: "set-event-when"; eventId: string; when: string }
  | { type: "set-event-place"; eventId: string; place: string }
  | { type: "set-event-description"; eventId: string; description: string }
  | { type: "set-event-chapter"; eventId: string; chapterId: string | null }
  | { type: "move-event"; eventId: string; targetIndex: number }
  | { type: "add-event-participant"; eventId: string; participant: EventParticipant }
  | { type: "remove-event-participant"; eventId: string; participantIndex: number }
  | {
      type: "restore-event-participant";
      eventId: string;
      participant: EventParticipant;
      participantIndex: number;
    }
  | {
      type: "set-event-participant-role";
      eventId: string;
      participantIndex: number;
      role: string;
    }
  | { type: "create-character"; character: Character }
  | { type: "delete-character-permanently"; characterId: string }
  | {
      type: "restore-deleted-character";
      character: Character;
      inboundRelations: InboundRelation[];
      removedParticipations: RemovedParticipation[];
      removedPersonalEvents: RemovedPersonalEvent[];
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

function requireChapter(state: WorldviewState, chapterId: string): Chapter {
  const chapter = state.worldview.chapters.find(
    (existing) => existing.id === chapterId,
  );
  if (!chapter) throw new Error(`존재하지 않는 구간: ${chapterId}`);
  return chapter;
}

function requireEvent(state: WorldviewState, eventId: string): TimelineEvent {
  const event = state.worldview.events.find(
    (existing) => existing.id === eventId,
  );
  if (!event) throw new Error(`존재하지 않는 사건: ${eventId}`);
  return event;
}

function patchChapter(
  state: WorldviewState,
  chapterId: string,
  patch: Partial<Chapter>,
  timestamp: number,
): WorldviewState {
  return patchWorldview(
    state,
    {
      chapters: state.worldview.chapters.map((existing) =>
        existing.id === chapterId ? { ...existing, ...patch } : existing,
      ),
    },
    timestamp,
  );
}

function patchEvent(
  state: WorldviewState,
  eventId: string,
  patch: Partial<TimelineEvent>,
  timestamp: number,
): WorldviewState {
  return patchWorldview(
    state,
    {
      events: state.worldview.events.map((existing) =>
        existing.id === eventId ? { ...existing, ...patch } : existing,
      ),
    },
    timestamp,
  );
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

    case "add-chapter":
      return {
        state: patchWorldview(
          state,
          { chapters: [...state.worldview.chapters, command.chapter] },
          timestamp,
        ),
        inverse: { type: "remove-chapter", chapterId: command.chapter.id },
        dirty: { worldview: true },
      };

    case "remove-chapter": {
      const chapterIndex = state.worldview.chapters.findIndex(
        (chapter) => chapter.id === command.chapterId,
      );
      const chapter = state.worldview.chapters[chapterIndex];
      if (!chapter) throw new Error(`존재하지 않는 구간: ${command.chapterId}`);
      // 구간을 지워도 소속 사건은 삭제하지 않고 미분류(chapterId: null)로 옮긴다.
      const memberEventIds = state.worldview.events
        .filter((event) => event.chapterId === command.chapterId)
        .map((event) => event.id);
      return {
        state: patchWorldview(
          state,
          {
            chapters: state.worldview.chapters.filter(
              (existing) => existing.id !== command.chapterId,
            ),
            events: state.worldview.events.map((event) =>
              event.chapterId === command.chapterId
                ? { ...event, chapterId: null }
                : event,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "restore-chapter",
          chapter,
          chapterIndex,
          memberEventIds,
        },
        dirty: { worldview: true },
      };
    }

    case "restore-chapter": {
      const memberEventIds = new Set(command.memberEventIds);
      return {
        state: patchWorldview(
          state,
          {
            chapters: insertAt(
              state.worldview.chapters,
              command.chapterIndex,
              command.chapter,
            ),
            events: state.worldview.events.map((event) =>
              memberEventIds.has(event.id)
                ? { ...event, chapterId: command.chapter.id }
                : event,
            ),
          },
          timestamp,
        ),
        inverse: { type: "remove-chapter", chapterId: command.chapter.id },
        dirty: { worldview: true },
      };
    }

    case "rename-chapter": {
      const chapter = requireChapter(state, command.chapterId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchChapter(
            state,
            command.chapterId,
            {
              nameTranslations: withLocaleValue(
                chapter.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-chapter",
            chapterId: command.chapterId,
            name: chapter.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchChapter(
          state,
          command.chapterId,
          { name: command.name },
          timestamp,
        ),
        inverse: {
          type: "rename-chapter",
          chapterId: command.chapterId,
          name: chapter.name,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-chapter-era": {
      const chapter = requireChapter(state, command.chapterId);
      return {
        state: patchChapter(
          state,
          command.chapterId,
          { era: command.era },
          timestamp,
        ),
        inverse: {
          type: "set-chapter-era",
          chapterId: command.chapterId,
          era: chapter.era,
        },
        dirty: { worldview: true },
      };
    }

    case "set-chapter-description": {
      const chapter = requireChapter(state, command.chapterId);
      return {
        state: patchChapter(
          state,
          command.chapterId,
          { description: command.description },
          timestamp,
        ),
        inverse: {
          type: "set-chapter-description",
          chapterId: command.chapterId,
          description: chapter.description,
        },
        dirty: { worldview: true },
      };
    }

    case "move-chapter": {
      const currentIndex = state.worldview.chapters.findIndex(
        (existing) => existing.id === command.chapterId,
      );
      const chapter = state.worldview.chapters[currentIndex];
      if (!chapter) throw new Error(`존재하지 않는 구간: ${command.chapterId}`);
      const withoutChapter = state.worldview.chapters.filter(
        (existing) => existing.id !== command.chapterId,
      );
      return {
        state: patchWorldview(
          state,
          { chapters: insertAt(withoutChapter, command.targetIndex, chapter) },
          timestamp,
        ),
        inverse: {
          type: "move-chapter",
          chapterId: command.chapterId,
          targetIndex: currentIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "add-event":
      return {
        state: patchWorldview(
          state,
          { events: [...state.worldview.events, command.event] },
          timestamp,
        ),
        inverse: { type: "remove-event", eventId: command.event.id },
        dirty: { worldview: true },
      };

    case "remove-event": {
      const eventIndex = state.worldview.events.findIndex(
        (event) => event.id === command.eventId,
      );
      const event = state.worldview.events[eventIndex];
      if (!event) throw new Error(`존재하지 않는 사건: ${command.eventId}`);
      return {
        state: patchWorldview(
          state,
          {
            events: state.worldview.events.filter(
              (existing) => existing.id !== command.eventId,
            ),
          },
          timestamp,
        ),
        inverse: { type: "restore-event", event, eventIndex },
        dirty: { worldview: true },
      };
    }

    case "restore-event":
      return {
        state: patchWorldview(
          state,
          {
            events: insertAt(
              state.worldview.events,
              command.eventIndex,
              command.event,
            ),
          },
          timestamp,
        ),
        inverse: { type: "remove-event", eventId: command.event.id },
        dirty: { worldview: true },
      };

    case "set-event-title": {
      const event = requireEvent(state, command.eventId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchEvent(
            state,
            command.eventId,
            {
              titleTranslations: withLocaleValue(
                event.titleTranslations,
                command.locale,
                command.title,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "set-event-title",
            eventId: command.eventId,
            title: event.titleTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchEvent(
          state,
          command.eventId,
          { title: command.title },
          timestamp,
        ),
        inverse: {
          type: "set-event-title",
          eventId: command.eventId,
          title: event.title,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-event-when": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { when: command.when },
          timestamp,
        ),
        inverse: {
          type: "set-event-when",
          eventId: command.eventId,
          when: event.when,
        },
        dirty: { worldview: true },
      };
    }

    case "set-event-place": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { place: command.place },
          timestamp,
        ),
        inverse: {
          type: "set-event-place",
          eventId: command.eventId,
          place: event.place,
        },
        dirty: { worldview: true },
      };
    }

    case "set-event-description": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { description: command.description },
          timestamp,
        ),
        inverse: {
          type: "set-event-description",
          eventId: command.eventId,
          description: event.description,
        },
        dirty: { worldview: true },
      };
    }

    case "set-event-chapter": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { chapterId: command.chapterId },
          timestamp,
        ),
        inverse: {
          type: "set-event-chapter",
          eventId: command.eventId,
          chapterId: event.chapterId,
        },
        dirty: { worldview: true },
      };
    }

    case "move-event": {
      const currentIndex = state.worldview.events.findIndex(
        (existing) => existing.id === command.eventId,
      );
      const event = state.worldview.events[currentIndex];
      if (!event) throw new Error(`존재하지 않는 사건: ${command.eventId}`);
      const withoutEvent = state.worldview.events.filter(
        (existing) => existing.id !== command.eventId,
      );
      return {
        state: patchWorldview(
          state,
          { events: insertAt(withoutEvent, command.targetIndex, event) },
          timestamp,
        ),
        inverse: {
          type: "move-event",
          eventId: command.eventId,
          targetIndex: currentIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "add-event-participant": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { participants: [...event.participants, command.participant] },
          timestamp,
        ),
        inverse: {
          type: "remove-event-participant",
          eventId: command.eventId,
          participantIndex: event.participants.length,
        },
        dirty: { worldview: true },
      };
    }

    case "remove-event-participant": {
      const event = requireEvent(state, command.eventId);
      const participant = event.participants[command.participantIndex];
      if (!participant)
        throw new Error(`존재하지 않는 참여자: ${command.participantIndex}`);
      return {
        state: patchEvent(
          state,
          command.eventId,
          {
            participants: [
              ...event.participants.slice(0, command.participantIndex),
              ...event.participants.slice(command.participantIndex + 1),
            ],
          },
          timestamp,
        ),
        inverse: {
          type: "restore-event-participant",
          eventId: command.eventId,
          participant,
          participantIndex: command.participantIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "restore-event-participant": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          {
            participants: insertAt(
              event.participants,
              command.participantIndex,
              command.participant,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "remove-event-participant",
          eventId: command.eventId,
          participantIndex: command.participantIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "set-event-participant-role": {
      const event = requireEvent(state, command.eventId);
      const participant = event.participants[command.participantIndex];
      if (!participant)
        throw new Error(`존재하지 않는 참여자: ${command.participantIndex}`);
      return {
        state: patchEvent(
          state,
          command.eventId,
          {
            participants: event.participants.map((existing, index) =>
              index === command.participantIndex
                ? { ...existing, role: command.role }
                : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-event-participant-role",
          eventId: command.eventId,
          participantIndex: command.participantIndex,
          role: participant.role,
        },
        dirty: { worldview: true },
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
      // 연표에서도 이 자캐를 지운다 — 개인 사건은 통째로, 세계관 사건에선 참여자만.
      const removedPersonalEvents: RemovedPersonalEvent[] = [];
      const removedParticipations: RemovedParticipation[] = [];
      state.worldview.events.forEach((event, eventIndex) => {
        if (event.ownerCharacterId === command.characterId) {
          removedPersonalEvents.push({ event, eventIndex });
          return;
        }
        event.participants.forEach((participant, participantIndex) => {
          if (participant.characterId === command.characterId) {
            removedParticipations.push({
              eventId: event.id,
              participant,
              participantIndex,
            });
          }
        });
      });
      const removedPersonalEventIds = new Set(
        removedPersonalEvents.map((removed) => removed.event.id),
      );
      let nextState: WorldviewState = {
        ...state,
        characters: state.characters.filter(
          (existing) => existing.id !== command.characterId,
        ),
      };
      const touchesEvents =
        removedPersonalEvents.length > 0 || removedParticipations.length > 0;
      if (touchesEvents) {
        nextState = patchWorldview(
          nextState,
          {
            events: state.worldview.events
              .filter((event) => !removedPersonalEventIds.has(event.id))
              .map((event) =>
                event.participants.some(
                  (participant) =>
                    participant.characterId === command.characterId,
                )
                  ? {
                      ...event,
                      participants: event.participants.filter(
                        (participant) =>
                          participant.characterId !== command.characterId,
                      ),
                    }
                  : event,
              ),
          },
          timestamp,
        );
      }
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
        inverse: {
          type: "restore-deleted-character",
          character,
          inboundRelations,
          removedParticipations,
          removedPersonalEvents,
        },
        dirty: {
          removedCharacterIds: [command.characterId],
          characterIds: affectedCharacterIds,
          worldview: touchesEvents ? true : undefined,
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
      const touchesEvents =
        command.removedPersonalEvents.length > 0 ||
        command.removedParticipations.length > 0;
      if (touchesEvents) {
        // 참여자 복원 후 개인 사건을 원래 인덱스에 오름차순으로 다시 끼워 넣는다.
        let events = nextState.worldview.events.map((event) => {
          const restored = command.removedParticipations.filter(
            (participation) => participation.eventId === event.id,
          );
          if (restored.length === 0) return event;
          let participants = event.participants;
          for (const participation of [...restored].sort(
            (first, second) =>
              first.participantIndex - second.participantIndex,
          )) {
            participants = insertAt(
              participants,
              participation.participantIndex,
              participation.participant,
            );
          }
          return { ...event, participants };
        });
        for (const removed of [...command.removedPersonalEvents].sort(
          (first, second) => first.eventIndex - second.eventIndex,
        )) {
          events = insertAt(events, removed.eventIndex, removed.event);
        }
        nextState = patchWorldview(nextState, { events }, timestamp);
      }
      return {
        state: nextState,
        inverse: {
          type: "delete-character-permanently",
          characterId: command.character.id,
        },
        dirty: {
          characterIds: [command.character.id, ...affectedCharacterIds],
          worldview: touchesEvents ? true : undefined,
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
