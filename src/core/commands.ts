import type {
  Chapter,
  Character,
  CharacterImage,
  CharacterQuote,
  EventParticipant,
  FieldConfig,
  FieldDefinition,
  GlossaryTerm,
  Group,
  PaletteColor,
  Place,
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
  | { type: "set-worldview-synopsis"; synopsis: string; locale: string }
  | { type: "set-worldview-genre-tags"; genreTags: string[] }
  | { type: "add-worldview-palette-color"; color: PaletteColor }
  | { type: "remove-worldview-palette-color"; colorIndex: number }
  | {
      type: "restore-worldview-palette-color";
      color: PaletteColor;
      colorIndex: number;
    }
  | { type: "set-worldview-palette-color"; colorIndex: number; color: PaletteColor }
  | { type: "set-worldview-era"; era: string }
  | { type: "set-primary-locale"; primaryLocale: string }
  | { type: "add-group"; group: Group }
  | { type: "remove-group"; groupId: string }
  | {
      type: "restore-group";
      group: Group;
      groupIndex: number;
      memberCharacterIds: string[];
    }
  | { type: "rename-group"; groupId: string; name: string; locale: string }
  | { type: "set-group-description"; groupId: string; description: string }
  | { type: "add-place"; place: Place }
  | { type: "remove-place"; placeId: string }
  | {
      type: "restore-place";
      place: Place;
      placeIndex: number;
      memberEventIds: string[];
      childPlaceIds: string[];
    }
  | { type: "rename-place"; placeId: string; name: string; locale: string }
  | { type: "set-place-kind"; placeId: string; kind: string }
  | { type: "set-place-parent"; placeId: string; parentId: string | null }
  | { type: "set-place-description"; placeId: string; description: string }
  | { type: "add-glossary-term"; term: GlossaryTerm }
  | { type: "remove-glossary-term"; termId: string }
  | { type: "restore-glossary-term"; term: GlossaryTerm; termIndex: number }
  | { type: "rename-glossary-term"; termId: string; name: string; locale: string }
  | { type: "set-glossary-term-description"; termId: string; description: string }
  | { type: "add-field-definition"; fieldDefinition: FieldDefinition }
  | { type: "rename-field-definition"; fieldDefinitionId: string; label: string }
  | {
      type: "set-field-localized";
      fieldDefinitionId: string;
      localized: boolean;
    }
  | {
      type: "configure-field";
      fieldDefinitionId: string;
      config: FieldConfig;
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
  | { type: "set-event-place-id"; eventId: string; placeId: string | null }
  | { type: "set-event-description"; eventId: string; description: string }
  | { type: "set-event-chapter"; eventId: string; chapterId: string | null }
  | {
      type: "set-event-owner";
      eventId: string;
      ownerCharacterId: string | null;
    }
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
  | { type: "set-tags"; characterId: string; tags: string[] }
  | { type: "add-character-image"; characterId: string; image: CharacterImage }
  | { type: "remove-character-image"; characterId: string; imageId: string }
  | {
      type: "restore-character-image";
      characterId: string;
      image: CharacterImage;
      imageIndex: number;
      previousCoverImageId: string | null;
    }
  | { type: "set-cover-image"; characterId: string; coverImageId: string | null }
  | {
      type: "set-image-caption";
      characterId: string;
      imageId: string;
      caption: string;
    }
  | { type: "add-quote"; characterId: string; quote: CharacterQuote }
  | { type: "remove-quote"; characterId: string; quoteIndex: number }
  | {
      type: "restore-quote";
      characterId: string;
      quote: CharacterQuote;
      quoteIndex: number;
    }
  | {
      type: "set-quote";
      characterId: string;
      quoteIndex: number;
      quote: CharacterQuote;
    }
  | { type: "add-palette-color"; characterId: string; color: PaletteColor }
  | { type: "remove-palette-color"; characterId: string; colorIndex: number }
  | {
      type: "restore-palette-color";
      characterId: string;
      color: PaletteColor;
      colorIndex: number;
    }
  | {
      type: "set-palette-color";
      characterId: string;
      colorIndex: number;
      color: PaletteColor;
    }
  | { type: "set-relation"; characterId: string; relationIndex: number; relation: Relation }
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

function requirePlace(state: WorldviewState, placeId: string): Place {
  const place = state.worldview.places.find(
    (existing) => existing.id === placeId,
  );
  if (!place) throw new Error(`존재하지 않는 장소: ${placeId}`);
  return place;
}

function patchPlace(
  state: WorldviewState,
  placeId: string,
  patch: Partial<Place>,
  timestamp: number,
): WorldviewState {
  return patchWorldview(
    state,
    {
      places: state.worldview.places.map((existing) =>
        existing.id === placeId ? { ...existing, ...patch } : existing,
      ),
    },
    timestamp,
  );
}

function requireGroup(state: WorldviewState, groupId: string): Group {
  const group = state.worldview.groups.find(
    (existing) => existing.id === groupId,
  );
  if (!group) throw new Error(`존재하지 않는 그룹: ${groupId}`);
  return group;
}

function patchGroup(
  state: WorldviewState,
  groupId: string,
  patch: Partial<Group>,
  timestamp: number,
): WorldviewState {
  return patchWorldview(
    state,
    {
      groups: state.worldview.groups.map((existing) =>
        existing.id === groupId ? { ...existing, ...patch } : existing,
      ),
    },
    timestamp,
  );
}

function requireGlossaryTerm(
  state: WorldviewState,
  termId: string,
): GlossaryTerm {
  const term = state.worldview.glossary.find(
    (existing) => existing.id === termId,
  );
  if (!term) throw new Error(`존재하지 않는 용어: ${termId}`);
  return term;
}

function patchGlossaryTerm(
  state: WorldviewState,
  termId: string,
  patch: Partial<GlossaryTerm>,
  timestamp: number,
): WorldviewState {
  return patchWorldview(
    state,
    {
      glossary: state.worldview.glossary.map((existing) =>
        existing.id === termId ? { ...existing, ...patch } : existing,
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

    case "set-worldview-synopsis": {
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchWorldview(
            state,
            {
              synopsisTranslations: withLocaleValue(
                state.worldview.synopsisTranslations,
                command.locale,
                command.synopsis,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "set-worldview-synopsis",
            synopsis: state.worldview.synopsisTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchWorldview(
          state,
          { synopsis: command.synopsis },
          timestamp,
        ),
        inverse: {
          type: "set-worldview-synopsis",
          synopsis: state.worldview.synopsis,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-worldview-genre-tags":
      return {
        state: patchWorldview(
          state,
          { genreTags: command.genreTags },
          timestamp,
        ),
        inverse: {
          type: "set-worldview-genre-tags",
          genreTags: state.worldview.genreTags,
        },
        dirty: { worldview: true },
      };

    case "add-worldview-palette-color":
      return {
        state: patchWorldview(
          state,
          { palette: [...state.worldview.palette, command.color] },
          timestamp,
        ),
        inverse: {
          type: "remove-worldview-palette-color",
          colorIndex: state.worldview.palette.length,
        },
        dirty: { worldview: true },
      };

    case "remove-worldview-palette-color": {
      const color = state.worldview.palette[command.colorIndex];
      if (!color) throw new Error(`존재하지 않는 색: ${command.colorIndex}`);
      return {
        state: patchWorldview(
          state,
          {
            palette: [
              ...state.worldview.palette.slice(0, command.colorIndex),
              ...state.worldview.palette.slice(command.colorIndex + 1),
            ],
          },
          timestamp,
        ),
        inverse: {
          type: "restore-worldview-palette-color",
          color,
          colorIndex: command.colorIndex,
        },
        dirty: { worldview: true },
      };
    }

    case "restore-worldview-palette-color":
      return {
        state: patchWorldview(
          state,
          {
            palette: insertAt(
              state.worldview.palette,
              command.colorIndex,
              command.color,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "remove-worldview-palette-color",
          colorIndex: command.colorIndex,
        },
        dirty: { worldview: true },
      };

    case "set-worldview-palette-color": {
      const color = state.worldview.palette[command.colorIndex];
      if (!color) throw new Error(`존재하지 않는 색: ${command.colorIndex}`);
      return {
        state: patchWorldview(
          state,
          {
            palette: state.worldview.palette.map((existing, index) =>
              index === command.colorIndex ? command.color : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-worldview-palette-color",
          colorIndex: command.colorIndex,
          color,
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

    case "rename-group": {
      const group = requireGroup(state, command.groupId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchGroup(
            state,
            command.groupId,
            {
              nameTranslations: withLocaleValue(
                group.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-group",
            groupId: command.groupId,
            name: group.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchGroup(
          state,
          command.groupId,
          { name: command.name },
          timestamp,
        ),
        inverse: {
          type: "rename-group",
          groupId: command.groupId,
          name: group.name,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-group-description": {
      const group = requireGroup(state, command.groupId);
      return {
        state: patchGroup(
          state,
          command.groupId,
          { description: command.description },
          timestamp,
        ),
        inverse: {
          type: "set-group-description",
          groupId: command.groupId,
          description: group.description,
        },
        dirty: { worldview: true },
      };
    }

    case "add-place":
      return {
        state: patchWorldview(
          state,
          { places: [...state.worldview.places, command.place] },
          timestamp,
        ),
        inverse: { type: "remove-place", placeId: command.place.id },
        dirty: { worldview: true },
      };

    case "remove-place": {
      const placeIndex = state.worldview.places.findIndex(
        (place) => place.id === command.placeId,
      );
      const place = state.worldview.places[placeIndex];
      if (!place) throw new Error(`존재하지 않는 장소: ${command.placeId}`);
      // 장소를 지워도 이를 가리키던 사건·하위 장소는 지우지 않고 참조만 끊는다(placeId·parentId → null).
      const memberEventIds = state.worldview.events
        .filter((event) => event.placeId === command.placeId)
        .map((event) => event.id);
      const childPlaceIds = state.worldview.places
        .filter((existing) => existing.parentId === command.placeId)
        .map((existing) => existing.id);
      return {
        state: patchWorldview(
          state,
          {
            places: state.worldview.places
              .filter((existing) => existing.id !== command.placeId)
              .map((existing) =>
                existing.parentId === command.placeId
                  ? { ...existing, parentId: null }
                  : existing,
              ),
            events: state.worldview.events.map((event) =>
              event.placeId === command.placeId
                ? { ...event, placeId: null }
                : event,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "restore-place",
          place,
          placeIndex,
          memberEventIds,
          childPlaceIds,
        },
        dirty: { worldview: true },
      };
    }

    case "restore-place": {
      const memberEventIds = new Set(command.memberEventIds);
      const childPlaceIds = new Set(command.childPlaceIds);
      return {
        state: patchWorldview(
          state,
          {
            places: insertAt(
              state.worldview.places,
              command.placeIndex,
              command.place,
            ).map((existing) =>
              childPlaceIds.has(existing.id)
                ? { ...existing, parentId: command.place.id }
                : existing,
            ),
            events: state.worldview.events.map((event) =>
              memberEventIds.has(event.id)
                ? { ...event, placeId: command.place.id }
                : event,
            ),
          },
          timestamp,
        ),
        inverse: { type: "remove-place", placeId: command.place.id },
        dirty: { worldview: true },
      };
    }

    case "rename-place": {
      const place = requirePlace(state, command.placeId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchPlace(
            state,
            command.placeId,
            {
              nameTranslations: withLocaleValue(
                place.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-place",
            placeId: command.placeId,
            name: place.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchPlace(
          state,
          command.placeId,
          { name: command.name },
          timestamp,
        ),
        inverse: {
          type: "rename-place",
          placeId: command.placeId,
          name: place.name,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-place-kind": {
      const place = requirePlace(state, command.placeId);
      return {
        state: patchPlace(
          state,
          command.placeId,
          { kind: command.kind },
          timestamp,
        ),
        inverse: {
          type: "set-place-kind",
          placeId: command.placeId,
          kind: place.kind,
        },
        dirty: { worldview: true },
      };
    }

    case "set-place-parent": {
      const place = requirePlace(state, command.placeId);
      // 자기 자신·후손을 부모로 지정해 순환이 생기지 않도록 막는다.
      let cursor: string | null = command.parentId;
      while (cursor !== null) {
        if (cursor === command.placeId)
          throw new Error("장소 계층에 순환을 만들 수 없습니다.");
        cursor =
          state.worldview.places.find((existing) => existing.id === cursor)
            ?.parentId ?? null;
      }
      return {
        state: patchPlace(
          state,
          command.placeId,
          { parentId: command.parentId },
          timestamp,
        ),
        inverse: {
          type: "set-place-parent",
          placeId: command.placeId,
          parentId: place.parentId,
        },
        dirty: { worldview: true },
      };
    }

    case "set-place-description": {
      const place = requirePlace(state, command.placeId);
      return {
        state: patchPlace(
          state,
          command.placeId,
          { description: command.description },
          timestamp,
        ),
        inverse: {
          type: "set-place-description",
          placeId: command.placeId,
          description: place.description,
        },
        dirty: { worldview: true },
      };
    }

    case "add-glossary-term":
      return {
        state: patchWorldview(
          state,
          { glossary: [...state.worldview.glossary, command.term] },
          timestamp,
        ),
        inverse: { type: "remove-glossary-term", termId: command.term.id },
        dirty: { worldview: true },
      };

    case "remove-glossary-term": {
      const termIndex = state.worldview.glossary.findIndex(
        (term) => term.id === command.termId,
      );
      const term = state.worldview.glossary[termIndex];
      if (!term) throw new Error(`존재하지 않는 용어: ${command.termId}`);
      return {
        state: patchWorldview(
          state,
          {
            glossary: state.worldview.glossary.filter(
              (existing) => existing.id !== command.termId,
            ),
          },
          timestamp,
        ),
        inverse: { type: "restore-glossary-term", term, termIndex },
        dirty: { worldview: true },
      };
    }

    case "restore-glossary-term":
      return {
        state: patchWorldview(
          state,
          {
            glossary: insertAt(
              state.worldview.glossary,
              command.termIndex,
              command.term,
            ),
          },
          timestamp,
        ),
        inverse: { type: "remove-glossary-term", termId: command.term.id },
        dirty: { worldview: true },
      };

    case "rename-glossary-term": {
      const term = requireGlossaryTerm(state, command.termId);
      if (command.locale !== state.worldview.primaryLocale) {
        return {
          state: patchGlossaryTerm(
            state,
            command.termId,
            {
              nameTranslations: withLocaleValue(
                term.nameTranslations,
                command.locale,
                command.name,
              ),
            },
            timestamp,
          ),
          inverse: {
            type: "rename-glossary-term",
            termId: command.termId,
            name: term.nameTranslations[command.locale] ?? "",
            locale: command.locale,
          },
          dirty: { worldview: true },
        };
      }
      return {
        state: patchGlossaryTerm(
          state,
          command.termId,
          { name: command.name },
          timestamp,
        ),
        inverse: {
          type: "rename-glossary-term",
          termId: command.termId,
          name: term.name,
          locale: command.locale,
        },
        dirty: { worldview: true },
      };
    }

    case "set-glossary-term-description": {
      const term = requireGlossaryTerm(state, command.termId);
      return {
        state: patchGlossaryTerm(
          state,
          command.termId,
          { description: command.description },
          timestamp,
        ),
        inverse: {
          type: "set-glossary-term-description",
          termId: command.termId,
          description: term.description,
        },
        dirty: { worldview: true },
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

    case "configure-field": {
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
                ? { ...existing, config: command.config }
                : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "configure-field",
          fieldDefinitionId: command.fieldDefinitionId,
          config: fieldDefinition.config,
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

    case "set-event-place-id": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { placeId: command.placeId },
          timestamp,
        ),
        inverse: {
          type: "set-event-place-id",
          eventId: command.eventId,
          placeId: event.placeId,
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

    case "set-event-owner": {
      const event = requireEvent(state, command.eventId);
      return {
        state: patchEvent(
          state,
          command.eventId,
          { ownerCharacterId: command.ownerCharacterId },
          timestamp,
        ),
        inverse: {
          type: "set-event-owner",
          eventId: command.eventId,
          ownerCharacterId: event.ownerCharacterId,
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

    case "set-tags": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { tags: command.tags },
          timestamp,
        ),
        inverse: {
          type: "set-tags",
          characterId: command.characterId,
          tags: character.tags,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "add-character-image": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { images: [...character.images, command.image] },
          timestamp,
        ),
        inverse: {
          type: "remove-character-image",
          characterId: command.characterId,
          imageId: command.image.id,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "remove-character-image": {
      const character = requireCharacter(state, command.characterId);
      const imageIndex = character.images.findIndex(
        (image) => image.id === command.imageId,
      );
      const image = character.images[imageIndex];
      if (!image) throw new Error(`존재하지 않는 이미지: ${command.imageId}`);
      const wasCover = character.coverImageId === command.imageId;
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            images: character.images.filter(
              (existing) => existing.id !== command.imageId,
            ),
            coverImageId: wasCover ? null : character.coverImageId,
          },
          timestamp,
        ),
        inverse: {
          type: "restore-character-image",
          characterId: command.characterId,
          image,
          imageIndex,
          previousCoverImageId: character.coverImageId,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "restore-character-image": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            images: insertAt(character.images, command.imageIndex, command.image),
            coverImageId: command.previousCoverImageId,
          },
          timestamp,
        ),
        inverse: {
          type: "remove-character-image",
          characterId: command.characterId,
          imageId: command.image.id,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-cover-image": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { coverImageId: command.coverImageId },
          timestamp,
        ),
        inverse: {
          type: "set-cover-image",
          characterId: command.characterId,
          coverImageId: character.coverImageId,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-image-caption": {
      const character = requireCharacter(state, command.characterId);
      const image = character.images.find(
        (existing) => existing.id === command.imageId,
      );
      if (!image) throw new Error(`존재하지 않는 이미지: ${command.imageId}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            images: character.images.map((existing) =>
              existing.id === command.imageId
                ? { ...existing, caption: command.caption }
                : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-image-caption",
          characterId: command.characterId,
          imageId: command.imageId,
          caption: image.caption,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "add-quote": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { quotes: [...character.quotes, command.quote] },
          timestamp,
        ),
        inverse: {
          type: "remove-quote",
          characterId: command.characterId,
          quoteIndex: character.quotes.length,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "remove-quote": {
      const character = requireCharacter(state, command.characterId);
      const quote = character.quotes[command.quoteIndex];
      if (!quote) throw new Error(`존재하지 않는 대사: ${command.quoteIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            quotes: [
              ...character.quotes.slice(0, command.quoteIndex),
              ...character.quotes.slice(command.quoteIndex + 1),
            ],
          },
          timestamp,
        ),
        inverse: {
          type: "restore-quote",
          characterId: command.characterId,
          quote,
          quoteIndex: command.quoteIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "restore-quote": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          { quotes: insertAt(character.quotes, command.quoteIndex, command.quote) },
          timestamp,
        ),
        inverse: {
          type: "remove-quote",
          characterId: command.characterId,
          quoteIndex: command.quoteIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-quote": {
      const character = requireCharacter(state, command.characterId);
      const quote = character.quotes[command.quoteIndex];
      if (!quote) throw new Error(`존재하지 않는 대사: ${command.quoteIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            quotes: character.quotes.map((existing, index) =>
              index === command.quoteIndex ? command.quote : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-quote",
          characterId: command.characterId,
          quoteIndex: command.quoteIndex,
          quote,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "add-palette-color": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            appearance: {
              ...character.appearance,
              palette: [...character.appearance.palette, command.color],
            },
          },
          timestamp,
        ),
        inverse: {
          type: "remove-palette-color",
          characterId: command.characterId,
          colorIndex: character.appearance.palette.length,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "remove-palette-color": {
      const character = requireCharacter(state, command.characterId);
      const color = character.appearance.palette[command.colorIndex];
      if (!color) throw new Error(`존재하지 않는 색: ${command.colorIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            appearance: {
              ...character.appearance,
              palette: [
                ...character.appearance.palette.slice(0, command.colorIndex),
                ...character.appearance.palette.slice(command.colorIndex + 1),
              ],
            },
          },
          timestamp,
        ),
        inverse: {
          type: "restore-palette-color",
          characterId: command.characterId,
          color,
          colorIndex: command.colorIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "restore-palette-color": {
      const character = requireCharacter(state, command.characterId);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            appearance: {
              ...character.appearance,
              palette: insertAt(
                character.appearance.palette,
                command.colorIndex,
                command.color,
              ),
            },
          },
          timestamp,
        ),
        inverse: {
          type: "remove-palette-color",
          characterId: command.characterId,
          colorIndex: command.colorIndex,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-palette-color": {
      const character = requireCharacter(state, command.characterId);
      const color = character.appearance.palette[command.colorIndex];
      if (!color) throw new Error(`존재하지 않는 색: ${command.colorIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            appearance: {
              ...character.appearance,
              palette: character.appearance.palette.map((existing, index) =>
                index === command.colorIndex ? command.color : existing,
              ),
            },
          },
          timestamp,
        ),
        inverse: {
          type: "set-palette-color",
          characterId: command.characterId,
          colorIndex: command.colorIndex,
          color,
        },
        dirty: { characterIds: [command.characterId] },
      };
    }

    case "set-relation": {
      const character = requireCharacter(state, command.characterId);
      const relation = character.relations[command.relationIndex];
      if (!relation)
        throw new Error(`존재하지 않는 관계: ${command.relationIndex}`);
      return {
        state: patchCharacter(
          state,
          command.characterId,
          {
            relations: character.relations.map((existing, index) =>
              index === command.relationIndex ? command.relation : existing,
            ),
          },
          timestamp,
        ),
        inverse: {
          type: "set-relation",
          characterId: command.characterId,
          relationIndex: command.relationIndex,
          relation,
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
          {
            appearance: {
              ...character.appearance,
              backgroundColor: command.backgroundColor,
            },
          },
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
