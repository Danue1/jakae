import { createStore } from "zustand/vanilla";
import { browserImageAdapter } from "../adapters/browserImageAdapter";
import { indexedDbStorage } from "../adapters/indexedDbStorage";
import { applyCommand, type WorldviewCommand } from "../core/commands";
import { createCharacter, type Character, type Worldview } from "../core/model";
import { SavePipeline, type SaveState } from "./savePipeline";

export interface WorldviewStoreState {
  worldview: Worldview | null;
  characters: Character[];
  saveState: SaveState;
}

export const worldviewStore = createStore<WorldviewStoreState>()(() => ({
  worldview: null,
  characters: [],
  saveState: "idle",
}));

const savePipeline = new SavePipeline({
  debounceMilliseconds: 300,
  resolveBatch(worldviewDirty, characterIds, removedCharacterIds) {
    const { worldview, characters } = worldviewStore.getState();
    return {
      worldview: worldviewDirty && worldview ? worldview : undefined,
      characters: characters.filter((character) =>
        characterIds.includes(character.id),
      ),
      removedCharacterIds,
    };
  },
  write(batch) {
    return indexedDbStorage.writeBatch(batch);
  },
  onSaveStateChange(saveState) {
    worldviewStore.setState({ saveState });
  },
});

export function dispatchCommand(command: WorldviewCommand): void {
  const { worldview, characters } = worldviewStore.getState();
  if (!worldview) throw new Error("열린 세계관이 없습니다.");
  const applied = applyCommand({ worldview, characters }, command, Date.now());
  worldviewStore.setState({
    worldview: applied.state.worldview,
    characters: applied.state.characters,
  });
  savePipeline.enqueue(applied.dirty);
}

export async function openWorldview(worldviewId: string): Promise<boolean> {
  await savePipeline.flush();
  savePipeline.reset();
  const [worldview, characters] = await Promise.all([
    indexedDbStorage.getWorldview(worldviewId),
    indexedDbStorage.listCharacters(worldviewId),
  ]);
  if (!worldview) return false;
  worldviewStore.setState({ worldview, characters, saveState: "idle" });
  return true;
}

export function flushWorldviewSaves(): Promise<void> {
  return savePipeline.flush();
}

// 이미지 IO가 필요한 흐름은 스토어 헬퍼가 담당한다 — 컴포넌트는 파일만 넘긴다.
export async function attachCharacterImage(
  characterId: string,
  file: Blob,
): Promise<void> {
  const imageId = await browserImageAdapter.saveImageFile(file);
  dispatchCommand({ type: "set-character-image", characterId, imageId });
}

export async function duplicateCharacter(
  characterId: string,
  copySuffix: string,
): Promise<string | null> {
  const { worldview, characters } = worldviewStore.getState();
  if (!worldview) return null;
  const original = characters.find((character) => character.id === characterId);
  if (!original) return null;

  const timestamp = Date.now();
  const copy: Character = {
    ...createCharacter(worldview.id, "", timestamp),
    name: `${original.name}${copySuffix}`,
    nameTranslations: Object.fromEntries(
      Object.entries(original.nameTranslations).map(([locale, name]) => [
        locale,
        `${name}${copySuffix}`,
      ]),
    ),
    appearance: { ...original.appearance },
    fieldValues: { ...original.fieldValues },
    fieldValueTranslations: Object.fromEntries(
      Object.entries(original.fieldValueTranslations).map(
        ([fieldDefinitionId, translations]) => [
          fieldDefinitionId,
          { ...translations },
        ],
      ),
    ),
    personalityTags: [...original.personalityTags],
    story: original.story,
    relations: original.relations.map((relation) => ({ ...relation })),
    groupIds: [...original.groupIds],
    favorite: original.favorite,
  };
  if (original.imageId) {
    copy.imageId = await browserImageAdapter.copyImage(original.imageId);
  }
  dispatchCommand({ type: "create-character", character: copy });
  return copy.id;
}
