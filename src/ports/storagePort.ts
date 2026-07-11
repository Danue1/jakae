import type { Character, Worldview } from "../core/model";

export interface EntityWriteBatch {
  worldview?: Worldview;
  characters?: Character[];
  removedCharacterIds?: string[];
}

export interface StoragePort {
  listWorldviews(): Promise<Worldview[]>;
  getWorldview(worldviewId: string): Promise<Worldview | undefined>;
  listCharacters(worldviewId: string): Promise<Character[]>;
  writeBatch(batch: EntityWriteBatch): Promise<void>;
  deleteWorldviewCascade(worldviewId: string): Promise<void>;
  putImage(imageId: string, blob: Blob): Promise<void>;
  getImageBlob(imageId: string): Promise<Blob | undefined>;
  deleteImage(imageId: string): Promise<void>;
}
