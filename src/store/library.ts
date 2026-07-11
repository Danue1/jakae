import { indexedDbStorage } from "../adapters/indexedDbStorage";
import {
  createWorldview,
  type Character,
  type Worldview,
  type WorldviewSeedDefaults,
} from "../core/model";
import { worldviewPreviewCharacters } from "../core/selectors";
import { decodeWorldFile } from "../core/worldFormat";

export interface WorldviewListEntry {
  worldview: Worldview;
  previewCharacters: Character[];
}

export async function listWorldviewsSorted(): Promise<Worldview[]> {
  const worldviews = await indexedDbStorage.listWorldviews();
  return worldviews.sort((first, second) => second.modifiedAt - first.modifiedAt);
}

export async function listWorldviewEntries(): Promise<WorldviewListEntry[]> {
  const worldviews = await listWorldviewsSorted();
  return Promise.all(
    worldviews.map(async (worldview) => ({
      worldview,
      previewCharacters: worldviewPreviewCharacters(
        await indexedDbStorage.listCharacters(worldview.id),
      ),
    })),
  );
}

export async function createAndSaveWorldview(
  name: string,
  seedDefaults: WorldviewSeedDefaults,
  primaryLocale: string,
): Promise<Worldview> {
  const worldview = createWorldview(name, seedDefaults, primaryLocale);
  await indexedDbStorage.writeBatch({ worldview });
  return worldview;
}

export function deleteWorldview(worldviewId: string): Promise<void> {
  return indexedDbStorage.deleteWorldviewCascade(worldviewId);
}

export async function importWorldFile(file: File): Promise<string> {
  const content = decodeWorldFile(new Uint8Array(await file.arrayBuffer()));
  for (const image of content.images) {
    await indexedDbStorage.putImage(
      image.id,
      new Blob([new Uint8Array(image.bytes)], { type: image.type }),
    );
  }
  await indexedDbStorage.writeBatch({
    worldview: content.worldview,
    characters: content.characters,
  });
  return content.worldview.id;
}
