import { describe, expect, it } from "vitest";
import { applyCommand, type WorldviewState } from "./commands";
import {
  characterDisplayName,
  createCharacter,
  createWorldview,
  fieldDisplayValue,
} from "./model";

const SEED_DEFAULTS = {
  fieldLabels: ["나이", "종족", "성별", "신장", "체중"],
};

function buildState(): {
  state: WorldviewState;
  gagaId: string;
  catId: string;
  ageFieldId: string;
} {
  const worldview = createWorldview("어쩌구 우주", SEED_DEFAULTS, "ko", "2020", 1000);
  const gaga = createCharacter(worldview.id, "가가", 1000);
  const cat = createCharacter(worldview.id, "고영희", 1000);
  gaga.relations = [{ targetCharacterId: cat.id, label: "집사" }];
  const ageField = worldview.fieldDefinitions[0];
  if (!ageField) throw new Error("시드 필드 누락");
  gaga.fieldValues[ageField.id] = "15";
  return {
    state: { worldview, characters: [gaga, cat] },
    gagaId: gaga.id,
    catId: cat.id,
    ageFieldId: ageField.id,
  };
}

describe("applyCommand", () => {
  it("set-field-value는 역커맨드로 원래 값이 복원된다", () => {
    const { state, gagaId, ageFieldId } = buildState();
    const applied = applyCommand(
      state,
      {
        type: "set-field-value",
        characterId: gagaId,
        fieldDefinitionId: ageFieldId,
        value: "16",
        locale: "ko",
      },
      2000,
    );
    expect(applied.state.characters[0]?.fieldValues[ageFieldId]).toBe("16");

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.characters[0]?.fieldValues[ageFieldId]).toBe("15");
  });

  it("세계관 개요는 기본 언어와 번역 슬롯을 나눠 기록하고 역커맨드로 복원된다", () => {
    const { state } = buildState();
    const applied = applyCommand(
      state,
      { type: "set-worldview-synopsis", synopsis: "우주 표류기", locale: "ko" },
      2000,
    );
    expect(applied.state.worldview.synopsis).toBe("우주 표류기");

    const translated = applyCommand(
      applied.state,
      { type: "set-worldview-synopsis", synopsis: "Space drift", locale: "en" },
      2500,
    );
    expect(translated.state.worldview.synopsis).toBe("우주 표류기");
    expect(translated.state.worldview.synopsisTranslations).toEqual({
      en: "Space drift",
    });

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.worldview.synopsis).toBe("");
  });

  it("세계관 장르 태그는 역커맨드로 이전 목록이 복원된다", () => {
    const { state } = buildState();
    const applied = applyCommand(
      state,
      { type: "set-worldview-genre-tags", genreTags: ["SF", "일상"] },
      2000,
    );
    expect(applied.state.worldview.genreTags).toEqual(["SF", "일상"]);

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.worldview.genreTags).toEqual([]);
  });

  it("세계관 팔레트 색 추가는 역커맨드로 제거된다", () => {
    const { state } = buildState();
    const color = { id: "c1", role: "하늘", color: "#7ec8e3" };
    const applied = applyCommand(
      state,
      { type: "add-worldview-palette-color", color },
      2000,
    );
    expect(applied.state.worldview.palette).toEqual([color]);

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.worldview.palette).toEqual([]);
  });

  it("장소 삭제는 이를 가리키던 사건의 placeId와 하위 장소의 parentId를 끊고, 역커맨드로 복원된다", () => {
    const { state } = buildState();
    const region = { id: "p-region", name: "행성", nameTranslations: {}, kind: "행성", parentId: null, description: "" };
    const city = { id: "p-city", name: "도시", nameTranslations: {}, kind: "도시", parentId: "p-region", description: "" };
    const event = {
      id: "e1",
      chapterId: null,
      ownerCharacterId: null,
      title: "사건",
      titleTranslations: {},
      when: "",
      place: "",
      placeId: "p-region",
      description: "",
      participants: [],
    };
    const seeded: WorldviewState = {
      worldview: {
        ...state.worldview,
        places: [region, city],
        events: [event],
      },
      characters: state.characters,
    };

    const removed = applyCommand(
      seeded,
      { type: "remove-place", placeId: "p-region" },
      2000,
    );
    expect(removed.state.worldview.places.map((place) => place.id)).toEqual([
      "p-city",
    ]);
    expect(removed.state.worldview.places[0]?.parentId).toBeNull();
    expect(removed.state.worldview.events[0]?.placeId).toBeNull();

    const restored = applyCommand(removed.state, removed.inverse, 3000);
    expect(restored.state.worldview.places.map((place) => place.id)).toEqual([
      "p-region",
      "p-city",
    ]);
    expect(restored.state.worldview.places[1]?.parentId).toBe("p-region");
    expect(restored.state.worldview.events[0]?.placeId).toBe("p-region");
  });

  it("장소 부모 지정은 순환을 거부한다", () => {
    const { state } = buildState();
    const parent = { id: "pp", name: "상위", nameTranslations: {}, kind: "", parentId: null, description: "" };
    const child = { id: "cc", name: "하위", nameTranslations: {}, kind: "", parentId: "pp", description: "" };
    const seeded: WorldviewState = {
      worldview: { ...state.worldview, places: [parent, child] },
      characters: state.characters,
    };
    expect(() =>
      applyCommand(
        seeded,
        { type: "set-place-parent", placeId: "pp", parentId: "cc" },
        2000,
      ),
    ).toThrow();
  });

  it("조직으로 승격된 그룹은 다국어명과 설명을 기록하고 역커맨드로 복원된다", () => {
    const { state } = buildState();
    const added = applyCommand(
      state,
      { type: "add-group", group: { id: "g1", name: "크루", nameTranslations: {}, description: "" } },
      2000,
    );
    const described = applyCommand(
      added.state,
      { type: "set-group-description", groupId: "g1", description: "우주선 승무원" },
      2500,
    );
    expect(described.state.worldview.groups[0]?.description).toBe("우주선 승무원");

    const undone = applyCommand(described.state, described.inverse, 3000);
    expect(undone.state.worldview.groups[0]?.description).toBe("");
  });

  it("설정 용어는 추가·삭제가 역커맨드로 왕복된다", () => {
    const { state } = buildState();
    const added = applyCommand(
      state,
      { type: "add-glossary-term", term: { id: "t1", name: "워프", nameTranslations: {}, description: "초광속 항행" } },
      2000,
    );
    expect(added.state.worldview.glossary).toHaveLength(1);

    const removed = applyCommand(added.state, added.inverse, 3000);
    expect(removed.state.worldview.glossary).toHaveLength(0);
  });

  it("기본 언어가 아닌 이름 편집은 언어별 이름에 기록되고, 표시가 폴백된다", () => {
    const { state, gagaId } = buildState();
    const applied = applyCommand(
      state,
      { type: "rename-character", characterId: gagaId, name: "Gaga", locale: "en" },
      2000,
    );
    const gaga = applied.state.characters[0];
    expect(gaga?.name).toBe("가가");
    expect(gaga?.nameTranslations).toEqual({ en: "Gaga" });
    if (!gaga) throw new Error("캐릭터 누락");
    expect(characterDisplayName(gaga, "en")).toBe("Gaga");
    expect(characterDisplayName(gaga, "ja")).toBe("가가");

    const cleared = applyCommand(
      applied.state,
      { type: "rename-character", characterId: gagaId, name: "", locale: "en" },
      3000,
    );
    expect(cleared.state.characters[0]?.nameTranslations).toEqual({});
  });

  it("언어별 필드는 토글이 켜진 경우에만 번역 슬롯에 기록된다", () => {
    const { state, gagaId, ageFieldId } = buildState();
    const notLocalized = applyCommand(
      state,
      {
        type: "set-field-value",
        characterId: gagaId,
        fieldDefinitionId: ageFieldId,
        value: "fifteen",
        locale: "en",
      },
      2000,
    );
    expect(notLocalized.state.characters[0]?.fieldValues[ageFieldId]).toBe(
      "fifteen",
    );

    const toggled = applyCommand(
      state,
      { type: "set-field-localized", fieldDefinitionId: ageFieldId, localized: true },
      2000,
    );
    const translated = applyCommand(
      toggled.state,
      {
        type: "set-field-value",
        characterId: gagaId,
        fieldDefinitionId: ageFieldId,
        value: "fifteen",
        locale: "en",
      },
      3000,
    );
    const gaga = translated.state.characters[0];
    expect(gaga?.fieldValues[ageFieldId]).toBe("15");
    expect(gaga?.fieldValueTranslations[ageFieldId]).toEqual({ en: "fifteen" });
    if (!gaga) throw new Error("캐릭터 누락");
    expect(
      fieldDisplayValue(translated.state.worldview, gaga, ageFieldId, "en"),
    ).toBe("fifteen");
    expect(
      fieldDisplayValue(translated.state.worldview, gaga, ageFieldId, "ja"),
    ).toBe("15");

    const undone = applyCommand(translated.state, translated.inverse, 4000);
    expect(
      undone.state.characters[0]?.fieldValueTranslations[ageFieldId],
    ).toEqual({});
  });

  it("영구 삭제는 역참조 관계를 정리하고, 역커맨드가 관계까지 복원한다", () => {
    const { state, gagaId, catId } = buildState();
    const applied = applyCommand(
      state,
      { type: "delete-character-permanently", characterId: catId },
      2000,
    );
    expect(applied.state.characters).toHaveLength(1);
    expect(
      applied.state.characters.find((character) => character.id === gagaId)
        ?.relations,
    ).toHaveLength(0);
    expect(applied.dirty.removedCharacterIds).toEqual([catId]);

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.characters).toHaveLength(2);
    expect(
      undone.state.characters.find((character) => character.id === gagaId)
        ?.relations,
    ).toEqual([{ targetCharacterId: catId, label: "집사" }]);
  });

  it("필드 삭제는 전 캐릭터의 값을 정리하고, 역커맨드가 순서와 값을 복원한다", () => {
    const { state, gagaId, ageFieldId } = buildState();
    const applied = applyCommand(
      state,
      { type: "delete-field-definition", fieldDefinitionId: ageFieldId },
      2000,
    );
    expect(
      applied.state.worldview.fieldDefinitions.some(
        (fieldDefinition) => fieldDefinition.id === ageFieldId,
      ),
    ).toBe(false);
    expect(applied.state.characters[0]?.fieldValues[ageFieldId]).toBeUndefined();

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.worldview.fieldDefinitions[0]?.id).toBe(ageFieldId);
    expect(
      undone.state.characters.find((character) => character.id === gagaId)
        ?.fieldValues[ageFieldId],
    ).toBe("15");
  });

  it("필드 이동은 순서를 바꾸고 역커맨드로 되돌린다", () => {
    const { state, ageFieldId } = buildState();
    const applied = applyCommand(
      state,
      { type: "move-field-definition", fieldDefinitionId: ageFieldId, targetIndex: 2 },
      2000,
    );
    expect(applied.state.worldview.fieldDefinitions[2]?.id).toBe(ageFieldId);

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.worldview.fieldDefinitions[0]?.id).toBe(ageFieldId);
  });

  it("배경색 지정이 왕복한다", () => {
    const { state, gagaId } = buildState();
    const colored = applyCommand(
      state,
      {
        type: "set-character-background-color",
        characterId: gagaId,
        backgroundColor: "#cfe0f6",
      },
      2000,
    );
    expect(colored.state.characters[0]?.appearance.backgroundColor).toBe(
      "#cfe0f6",
    );
    const colorUndone = applyCommand(colored.state, colored.inverse, 3000);
    expect(colorUndone.state.characters[0]?.appearance.backgroundColor).toBeNull();
  });

  it("휴지통 이동/복원이 왕복한다", () => {
    const { state, gagaId } = buildState();
    const applied = applyCommand(
      state,
      { type: "move-to-trash", characterId: gagaId },
      2000,
    );
    expect(applied.state.characters[0]?.deletedAt).toBe(2000);

    const undone = applyCommand(applied.state, applied.inverse, 3000);
    expect(undone.state.characters[0]?.deletedAt).toBeNull();
  });
});
