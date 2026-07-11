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
  connectors: ["의", "에게", "를"],
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
  gaga.relations = [
    { targetCharacterId: cat.id, connector: "의", label: "집사" },
  ];
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
    ).toEqual([{ targetCharacterId: catId, connector: "의", label: "집사" }]);
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

  it("배경색 지정과 연결어 설정이 왕복한다", () => {
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

    const connectorsSet = applyCommand(
      state,
      { type: "set-connectors", connectors: ["의", "와"] },
      2000,
    );
    expect(connectorsSet.state.worldview.connectors).toEqual(["의", "와"]);
    const connectorsUndone = applyCommand(
      connectorsSet.state,
      connectorsSet.inverse,
      3000,
    );
    expect(connectorsUndone.state.worldview.connectors).toEqual([
      "의",
      "에게",
      "를",
    ]);
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
