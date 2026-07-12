import { indexedDbStorage } from "../adapters/indexedDbStorage";
import {
  createWorldview,
  type Character,
  type Worldview,
  type WorldviewSeedDefaults,
} from "../core/model";
import { type Locale } from "../locales/config";
import { defaultCharacterFields } from "../locales/fieldPresets";
import { worldviewPreviewCharacters } from "../core/selectors";

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
  worldview.fieldDefinitions = defaultCharacterFields(primaryLocale as Locale);
  await indexedDbStorage.writeBatch({ worldview });
  return worldview;
}

export function deleteWorldview(worldviewId: string): Promise<void> {
  return indexedDbStorage.deleteWorldviewCascade(worldviewId);
}
