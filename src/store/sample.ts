import { indexedDbStorage } from "../adapters/indexedDbStorage";
import {
  createCharacter,
  createChapter,
  createGlossaryTerm,
  createGroup,
  createPlace,
  createRace,
  createReference,
  createTimelineEvent,
  createWorldview,
} from "../core/model";
import type { SeedContent } from "../locales";
import { type Locale } from "../locales/config";
import { defaultCharacterFields } from "../locales/fieldPresets";

// 종족·소속처럼 대상 종류가 곧 관계를 말해주는 자명한 연결은 라벨을 비운다.
// 장소는 고향·근무지 등 여러 의미가 가능하므로 "고향" 라벨을 붙인다(사용자 데이터, 시드 언어 고정).
const HOMETOWN_LABEL: Record<Locale, string> = {
  ko: "고향",
  en: "Hometown",
  ja: "出身",
};

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
    { fieldLabels: seed.fieldLabels },
    locale,
    seed.sampleEra,
  );
  worldview.synopsis = seed.sampleSynopsis;
  // 기본 필드는 참조 필드(종족·소속·고향)를 포함한 표준 세트로 교체한다.
  worldview.fieldDefinitions = defaultCharacterFields(locale as Locale);

  worldview.groups = seed.sampleGroups.map((groupSeed) => {
    const group = createGroup(groupSeed.name);
    group.description = groupSeed.description;
    return group;
  });

  // 종족: 먼저 전부 생성한 뒤 계통(parent)·종족 간 관계를 index로 연결한다.
  worldview.races = seed.sampleRaces.map((raceSeed) => {
    const race = createRace(raceSeed.name);
    race.symbolColor = raceSeed.symbolColor;
    race.lifespan = raceSeed.lifespan;
    race.height = raceSeed.height;
    race.origin = raceSeed.origin;
    race.language = raceSeed.language;
    race.traits = [...raceSeed.traits];
    race.description = raceSeed.description;
    return race;
  });
  seed.sampleRaces.forEach((raceSeed, raceIndex) => {
    const race = worldview.races[raceIndex];
    if (!race) return;
    if (raceSeed.parentIndex !== null) {
      const parent = worldview.races[raceSeed.parentIndex];
      if (parent) race.parentId = parent.id;
    }
    for (const relation of raceSeed.relations) {
      const target = worldview.races[relation.toIndex];
      if (target)
        race.relations.push({ targetRaceId: target.id, label: relation.label });
    }
  });

  // 장소: 생성 후 포함 계층(parent)을 연결한다.
  worldview.places = seed.samplePlaces.map((placeSeed) => {
    const place = createPlace(placeSeed.name);
    place.kind = placeSeed.kind;
    return place;
  });
  seed.samplePlaces.forEach((placeSeed, placeIndex) => {
    const place = worldview.places[placeIndex];
    if (place && placeSeed.parentIndex !== null) {
      const parent = worldview.places[placeSeed.parentIndex];
      if (parent) place.parentId = parent.id;
    }
  });

  worldview.glossary = seed.sampleGlossary.map((termSeed) => {
    const term = createGlossaryTerm(termSeed.name);
    term.description = termSeed.description;
    return term;
  });

  worldview.chapters = seed.sampleChapters.map((chapterSeed) => {
    const chapter = createChapter(chapterSeed.name);
    chapter.era = chapterSeed.era;
    return chapter;
  });

  // 기본 필드 순서(스칼라): 나이 · 성별 · 신장. 종족·소속·고향은 references(관계)로 붙인다.
  const [ageField, genderField, heightField] = worldview.fieldDefinitions;

  const characters = seed.sampleCharacters.map((characterSeed) => {
    const character = createCharacter(worldview.id, characterSeed.name);
    const setField = (
      field: { id: string } | undefined,
      value: string | undefined,
    ) => {
      if (field && value) character.fieldValues[field.id] = value;
    };
    setField(ageField, characterSeed.fieldValues[0]);
    setField(genderField, characterSeed.fieldValues[2]);
    setField(heightField, characterSeed.fieldValues[3]);
    character.personalityTags = [...characterSeed.personalityTags];
    character.tags = [...characterSeed.classTags];
    character.story = characterSeed.story;
    character.favorite = characterSeed.favorite;
    return character;
  });

  // 관계(참조) — 종족·소속·고향·캐릭터 간 관계를 하나의 독립 references 컬렉션에 모은다.
  const hometownLabel = HOMETOWN_LABEL[locale as Locale] ?? HOMETOWN_LABEL.ko;
  // 데모: 몇몇 캐릭터의 고향(장소 참조). (캐릭터 index → 장소 index)
  const hometownByCharacter: Record<number, number> = { 0: 1, 2: 1, 4: 8, 7: 5 };
  const references: ReturnType<typeof createReference>[] = [];
  seed.sampleCharacters.forEach((characterSeed, characterIndex) => {
    const character = characters[characterIndex];
    if (!character) return;
    // 종족·소속은 대상 종류가 곧 관계라 라벨을 비운다.
    const race =
      characterSeed.raceIndex !== null
        ? worldview.races[characterSeed.raceIndex]
        : null;
    if (race)
      references.push(
        createReference("character", character.id, "race", race.id),
      );
    const group =
      characterSeed.groupIndex !== null
        ? worldview.groups[characterSeed.groupIndex]
        : null;
    if (group)
      references.push(
        createReference("character", character.id, "group", group.id),
      );
    const hometownIndex = hometownByCharacter[characterIndex];
    const hometown =
      hometownIndex !== undefined ? worldview.places[hometownIndex] : null;
    if (hometown)
      references.push(
        createReference("character", character.id, "place", hometown.id, hometownLabel),
      );
  });
  for (const relationSeed of seed.sampleRelations) {
    const from = characters[relationSeed.fromIndex];
    const to = characters[relationSeed.toIndex];
    if (!from || !to) continue;
    references.push(
      createReference("character", from.id, "character", to.id, relationSeed.label),
    );
  }
  worldview.references = references;

  // 사건: 구간·소유 자캐·장소·참여 자캐를 index로 연결한다. 배열 순서가 곧 연표 표시 순서.
  worldview.events = seed.sampleEvents.map((eventSeed) => {
    const chapter =
      eventSeed.chapterIndex !== null
        ? worldview.chapters[eventSeed.chapterIndex]
        : null;
    const owner =
      eventSeed.ownerIndex !== null ? characters[eventSeed.ownerIndex] : null;
    const event = createTimelineEvent({
      chapterId: chapter?.id ?? null,
      ownerCharacterId: owner?.id ?? null,
    });
    event.title = eventSeed.title;
    event.when = eventSeed.when;
    event.description = eventSeed.description;
    if (eventSeed.placeIndex !== null) {
      const place = worldview.places[eventSeed.placeIndex];
      if (place) event.placeId = place.id;
    }
    event.participants = eventSeed.participants.flatMap((participant) => {
      const character = characters[participant.characterIndex];
      return character
        ? [{ characterId: character.id, role: participant.role }]
        : [];
    });
    return event;
  });

  await indexedDbStorage.writeBatch({ worldview, characters });
}
