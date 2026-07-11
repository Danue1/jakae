import { indexedDbStorage } from "../adapters/indexedDbStorage";
import { createCharacter, createWorldview } from "../core/model";
import type { SeedContent } from "../locales";

let seedPromise: Promise<void> | null = null;

// StrictMode의 이펙트 이중 실행 등 동시 호출에서도 한 번만 시드되도록 promise를 공유한다.
export function seedSampleWorldviewIfEmpty(
  seed: SeedContent,
  locale: string,
): Promise<void> {
  if (!seedPromise) seedPromise = seedSampleWorldview(seed, locale);
  return seedPromise;
}

async function seedSampleWorldview(
  seed: SeedContent,
  locale: string,
): Promise<void> {
  const existing = await indexedDbStorage.listWorldviews();
  if (existing.length > 0) return;

  const worldview = createWorldview(
    seed.sampleWorldviewName,
    { fieldLabels: seed.fieldLabels, connectors: seed.connectors },
    locale,
    seed.sampleEra,
  );
  worldview.groups = seed.sampleGroups.map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));

  const characters = seed.sampleCharacters.map((characterSeed) => {
    const character = createCharacter(worldview.id, characterSeed.name);
    characterSeed.fieldValues.forEach((value, fieldIndex) => {
      const fieldDefinition = worldview.fieldDefinitions[fieldIndex];
      if (fieldDefinition && value) character.fieldValues[fieldDefinition.id] = value;
    });
    character.personalityTags = [...characterSeed.tags];
    character.story = characterSeed.story;
    character.favorite = characterSeed.favorite;
    if (characterSeed.groupIndex !== null) {
      const group = worldview.groups[characterSeed.groupIndex];
      if (group) character.groupIds = [group.id];
    }
    return character;
  });

  for (const relationSeed of seed.sampleRelations) {
    const from = characters[relationSeed.fromIndex];
    const to = characters[relationSeed.toIndex];
    const connector = seed.connectors[relationSeed.connectorIndex];
    if (!from || !to || connector === undefined) continue;
    from.relations.push({
      targetCharacterId: to.id,
      connector,
      label: relationSeed.label,
    });
  }

  await indexedDbStorage.writeBatch({ worldview, characters });
}
