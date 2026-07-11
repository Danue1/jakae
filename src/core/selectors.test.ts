import { describe, expect, it } from "vitest";
import {
  characterCaptionDetail,
  createCharacter,
  createWorldview,
} from "./model";
import { defaultViewState, selectVisibleCharacters } from "./selectors";

const SEED_DEFAULTS = {
  fieldLabels: ["나이", "종족"],
  connectors: ["의"],
};

describe("selectVisibleCharacters", () => {
  it("검색어는 이름·언어별 이름·태그를 함께 거른다", () => {
    const worldview = createWorldview("테스트", SEED_DEFAULTS, "ko", "", 0);
    const first = createCharacter(worldview.id, "가가", 0);
    first.personalityTags = ["조용함"];
    first.nameTranslations = { en: "Gaga" };
    const second = createCharacter(worldview.id, "고영희", 0);
    second.personalityTags = ["도도함"];
    const third = createCharacter(worldview.id, "구구", 0);
    const characters = [first, second, third];

    expect(
      selectVisibleCharacters(
        characters,
        { ...defaultViewState, query: "조용" },
        "ko",
      ).map((character) => character.name),
    ).toEqual(["가가"]);
    expect(
      selectVisibleCharacters(
        characters,
        { ...defaultViewState, query: "gaga" },
        "en",
      ).map((character) => character.name),
    ).toEqual(["가가"]);
  });

  it("정렬은 표시 언어의 이름을 따른다", () => {
    const worldview = createWorldview("테스트", SEED_DEFAULTS, "ko", "", 0);
    const first = createCharacter(worldview.id, "가가", 0);
    first.nameTranslations = { en: "Zebra" };
    const second = createCharacter(worldview.id, "고영희", 0);
    second.nameTranslations = { en: "Apple" };
    const characters = [first, second];

    expect(
      selectVisibleCharacters(characters, defaultViewState, "ko").map(
        (character) => character.name,
      ),
    ).toEqual(["가가", "고영희"]);
    expect(
      selectVisibleCharacters(characters, defaultViewState, "en").map(
        (character) => character.name,
      ),
    ).toEqual(["고영희", "가가"]);
  });

  it("즐겨찾기 뷰는 favorite만, 휴지통 뷰는 삭제된 것만 남긴다", () => {
    const worldview = createWorldview("테스트", SEED_DEFAULTS, "ko", "", 0);
    const first = createCharacter(worldview.id, "가가", 0);
    first.favorite = true;
    const second = createCharacter(worldview.id, "고영희", 0);
    const trashed = createCharacter(worldview.id, "구구", 0);
    trashed.deletedAt = 100;
    const characters = [first, second, trashed];

    expect(
      selectVisibleCharacters(
        characters,
        { ...defaultViewState, view: "favorites" },
        "ko",
      ).map((character) => character.name),
    ).toEqual(["가가"]);
    expect(
      selectVisibleCharacters(
        characters,
        { ...defaultViewState, view: "trash" },
        "ko",
      ).map((character) => character.name),
    ).toEqual(["구구"]);
  });
});

describe("characterCaptionDetail", () => {
  it("처음 두 필드의 표시 값이 캡션이 된다 — 순서 관리가 곧 캡션 사용자화", () => {
    const worldview = createWorldview("테스트", SEED_DEFAULTS, "ko", "", 0);
    const character = createCharacter(worldview.id, "가가", 0);
    const [ageField, speciesField] = worldview.fieldDefinitions;
    if (!ageField || !speciesField) throw new Error("시드 필드 누락");
    character.fieldValues[ageField.id] = "15";

    expect(characterCaptionDetail(worldview, character, "ko")).toBe("15 · -");

    character.fieldValues[speciesField.id] = "인간";
    const reordered = {
      ...worldview,
      fieldDefinitions: [speciesField, ageField],
    };
    expect(characterCaptionDetail(reordered, character, "ko")).toBe("인간 · 15");
  });

  it("언어별 필드는 표시 언어의 값을 쓰고 없으면 원본으로 폴백한다", () => {
    const worldview = createWorldview("테스트", SEED_DEFAULTS, "ko", "", 0);
    const speciesField = worldview.fieldDefinitions[1];
    if (!speciesField) throw new Error("시드 필드 누락");
    speciesField.localized = true;
    const character = createCharacter(worldview.id, "가가", 0);
    character.fieldValues[speciesField.id] = "인간";
    character.fieldValueTranslations[speciesField.id] = { en: "Human" };

    expect(characterCaptionDetail(worldview, character, "en")).toBe(
      "- · Human",
    );
    expect(characterCaptionDetail(worldview, character, "ja")).toBe("- · 인간");
  });
});
