import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  normalizeCharacterRecord,
  normalizeWorldviewRecord,
  type LegacyCharacterRecord,
  type LegacyWorldviewRecord,
} from "./legacy";
import type { Character, Worldview } from "./model";

export const WORLD_FORMAT_VERSION = 1;

export type WorldFileErrorCode = "invalid-file" | "newer-version";

// UI가 코드로 로캘별 메시지를 매핑할 수 있도록 오류를 코드로 던진다.
export class WorldFileError extends Error {
  constructor(public readonly code: WorldFileErrorCode) {
    super(code);
    this.name = "WorldFileError";
  }
}

export interface WorldFileImage {
  id: string;
  bytes: Uint8Array;
  type: string;
}

export interface WorldFileContent {
  worldview: Worldview;
  characters: Character[];
  images: WorldFileImage[];
}

interface WorldFileJson {
  formatVersion: number;
  worldview: LegacyWorldviewRecord;
  characters: LegacyCharacterRecord[];
  imageTypes: Record<string, string>;
}

// 휴지통은 기본 제외 — 공유 파일에 삭제된 설정이 실려 나가지 않는다.
export function encodeWorldFile(
  content: WorldFileContent,
  options: { includeTrash?: boolean } = {},
): Uint8Array {
  const characters = options.includeTrash
    ? content.characters
    : content.characters.filter((character) => character.deletedAt === null);
  const includedImageIds = new Set(
    characters
      .map((character) => character.imageId)
      .filter((imageId): imageId is string => imageId !== null),
  );
  const entries: Record<string, Uint8Array> = {};
  const imageTypes: Record<string, string> = {};
  for (const image of content.images) {
    if (!includedImageIds.has(image.id)) continue;
    entries[`images/${image.id}`] = image.bytes;
    imageTypes[image.id] = image.type;
  }
  entries["world.json"] = strToU8(
    JSON.stringify({
      formatVersion: WORLD_FORMAT_VERSION,
      worldview: content.worldview,
      characters,
      imageTypes,
    }),
  );
  return zipSync(entries);
}

// 가져오기는 항상 새 사본 — 모든 id를 재발급해 기존 데이터와 충돌하지 않는다.
// v1·v2 파일(particles·builtIn)도 정규화해 받아들인다.
export function decodeWorldFile(bytes: Uint8Array): WorldFileContent {
  let archive: ReturnType<typeof unzipSync>;
  try {
    archive = unzipSync(bytes);
  } catch {
    throw new WorldFileError("invalid-file");
  }
  const worldEntry = archive["world.json"];
  if (!worldEntry) throw new WorldFileError("invalid-file");
  const json = JSON.parse(strFromU8(worldEntry)) as WorldFileJson;
  if (json.formatVersion > WORLD_FORMAT_VERSION) {
    throw new WorldFileError("newer-version");
  }

  const identifierMap = new Map<string, string>();
  const remap = (previousId: string): string => {
    let nextId = identifierMap.get(previousId);
    if (!nextId) {
      nextId = crypto.randomUUID();
      identifierMap.set(previousId, nextId);
    }
    return nextId;
  };

  const normalizedWorldview = normalizeWorldviewRecord(json.worldview);
  const worldview: Worldview = {
    ...normalizedWorldview,
    id: remap(normalizedWorldview.id),
    fieldDefinitions: normalizedWorldview.fieldDefinitions.map(
      (fieldDefinition) => ({ ...fieldDefinition, id: remap(fieldDefinition.id) }),
    ),
    groups: normalizedWorldview.groups.map((group) => ({
      ...group,
      id: remap(group.id),
    })),
  };

  const includedCharacterIds = new Set(
    json.characters.map((character) => character.id),
  );
  const characters: Character[] = json.characters
    .map(normalizeCharacterRecord)
    .map((character) => {
      const remappedFieldValues: Record<string, string> = {};
      for (const [fieldDefinitionId, value] of Object.entries(
        character.fieldValues,
      )) {
        remappedFieldValues[remap(fieldDefinitionId)] = value;
      }
      return {
        ...character,
        id: remap(character.id),
        worldviewId: worldview.id,
        imageId: character.imageId ? remap(character.imageId) : null,
        fieldValues: remappedFieldValues,
        relations: character.relations
          .filter((relation) =>
            includedCharacterIds.has(relation.targetCharacterId),
          )
          .map((relation) => ({
            ...relation,
            targetCharacterId: remap(relation.targetCharacterId),
          })),
        groupIds: character.groupIds.map(remap),
      };
    });

  const images: WorldFileImage[] = Object.entries(json.imageTypes).flatMap(
    ([imageId, type]) => {
      const imageBytes = archive[`images/${imageId}`];
      if (!imageBytes) return [];
      return [{ id: remap(imageId), bytes: imageBytes, type }];
    },
  );

  return { worldview, characters, images };
}
