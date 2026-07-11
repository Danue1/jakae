import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  normalizeCharacterRecord,
  normalizeWorldviewRecord,
  type LegacyCharacterRecord,
  type LegacyWorldviewRecord,
} from "../core/legacy";
import type { Character, Worldview } from "../core/model";
import type { EntityWriteBatch, StoragePort } from "../ports/storagePort";

interface StoredImage {
  id: string;
  blob: Blob;
}

// 값 타입은 레거시 레코드(v1·v2 잔존 필드 허용) — 읽기 시점에 v3 형태로 정규화한다.
interface DatabaseSchema extends DBSchema {
  worldviews: { key: string; value: LegacyWorldviewRecord };
  characters: {
    key: string;
    value: LegacyCharacterRecord;
    indexes: { byWorldview: string };
  };
  images: { key: string; value: StoredImage };
}

let databasePromise: Promise<IDBPDatabase<DatabaseSchema>> | null = null;

function database(): Promise<IDBPDatabase<DatabaseSchema>> {
  if (!databasePromise) {
    databasePromise = openDB<DatabaseSchema>("character-organizer", 1, {
      upgrade(upgradeDatabase) {
        upgradeDatabase.createObjectStore("worldviews", { keyPath: "id" });
        const characterStore = upgradeDatabase.createObjectStore("characters", {
          keyPath: "id",
        });
        characterStore.createIndex("byWorldview", "worldviewId");
        upgradeDatabase.createObjectStore("images", { keyPath: "id" });
      },
    });
  }
  return databasePromise;
}

export const indexedDbStorage: StoragePort = {
  async listWorldviews(): Promise<Worldview[]> {
    const records = await (await database()).getAll("worldviews");
    return records.map(normalizeWorldviewRecord);
  },

  async getWorldview(worldviewId: string): Promise<Worldview | undefined> {
    const record = await (await database()).get("worldviews", worldviewId);
    return record ? normalizeWorldviewRecord(record) : undefined;
  },

  async listCharacters(worldviewId: string): Promise<Character[]> {
    const records = await (
      await database()
    ).getAllFromIndex("characters", "byWorldview", worldviewId);
    return records.map(normalizeCharacterRecord);
  },

  async writeBatch(batch: EntityWriteBatch): Promise<void> {
    const openedDatabase = await database();
    const transaction = openedDatabase.transaction(
      ["worldviews", "characters"],
      "readwrite",
    );
    if (batch.worldview) {
      transaction.objectStore("worldviews").put(batch.worldview);
    }
    for (const character of batch.characters ?? []) {
      transaction.objectStore("characters").put(character);
    }
    for (const characterId of batch.removedCharacterIds ?? []) {
      transaction.objectStore("characters").delete(characterId);
    }
    await transaction.done;
  },

  async deleteWorldviewCascade(worldviewId: string): Promise<void> {
    const openedDatabase = await database();
    const characters = await openedDatabase.getAllFromIndex(
      "characters",
      "byWorldview",
      worldviewId,
    );
    const transaction = openedDatabase.transaction(
      ["worldviews", "characters", "images"],
      "readwrite",
    );
    for (const character of characters) {
      if (character.imageId) {
        transaction.objectStore("images").delete(character.imageId);
      }
      transaction.objectStore("characters").delete(character.id);
    }
    transaction.objectStore("worldviews").delete(worldviewId);
    await transaction.done;
  },

  async putImage(imageId: string, blob: Blob): Promise<void> {
    await (await database()).put("images", { id: imageId, blob });
  },

  async getImageBlob(imageId: string): Promise<Blob | undefined> {
    return (await (await database()).get("images", imageId))?.blob;
  },

  async deleteImage(imageId: string): Promise<void> {
    await (await database()).delete("images", imageId);
  },
};
