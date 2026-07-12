import { describe, expect, it } from "vitest";
import { applyCommand, type WorldviewState } from "./commands";
import { normalizeCharacterRecord } from "./legacy";
import {
  characterCoverImage,
  createCharacter,
  createWorldview,
  type Character,
} from "./model";

const SEED_DEFAULTS = { fieldLabels: ["나이"] };

function buildState(): { state: WorldviewState; gagaId: string; hohoId: string } {
  const worldview = createWorldview("어쩌구 우주", SEED_DEFAULTS, "ko", "2020", 1000);
  const gaga = createCharacter(worldview.id, "가가", 1000);
  const hoho = createCharacter(worldview.id, "호호할머니", 1000);
  return {
    state: { worldview, characters: [gaga, hoho] },
    gagaId: gaga.id,
    hohoId: hoho.id,
  };
}

function characterById(state: WorldviewState, id: string): Character {
  const found = state.characters.find((existing) => existing.id === id);
  if (!found) throw new Error("no character");
  return found;
}

describe("이미지 커맨드", () => {
  it("add-character-image 후 첫 이미지가 대표가 된다", () => {
    const { state, gagaId } = buildState();
    const image = { id: "img1", blobId: "blob1", caption: "" };
    const added = applyCommand(
      state,
      { type: "add-character-image", characterId: gagaId, image },
      2000,
    );
    const gaga = characterById(added.state, gagaId);
    expect(gaga.images).toHaveLength(1);
    expect(characterCoverImage(gaga)?.blobId).toBe("blob1");
  });

  it("대표 이미지를 지우면 대표 지정이 첫 이미지로 폴백된다", () => {
    const { state, gagaId } = buildState();
    let current = state;
    for (const image of [
      { id: "a", blobId: "ba", caption: "" },
      { id: "b", blobId: "bb", caption: "" },
    ]) {
      current = applyCommand(
        current,
        { type: "add-character-image", characterId: gagaId, image },
        2000,
      ).state;
    }
    current = applyCommand(
      current,
      { type: "set-cover-image", characterId: gagaId, coverImageId: "b" },
      2000,
    ).state;
    expect(characterCoverImage(characterById(current, gagaId))?.id).toBe("b");

    const removed = applyCommand(
      current,
      { type: "remove-character-image", characterId: gagaId, imageId: "b" },
      3000,
    );
    const gaga = characterById(removed.state, gagaId);
    expect(gaga.coverImageId).toBeNull();
    expect(characterCoverImage(gaga)?.id).toBe("a");

    // 역커맨드가 대표 지정까지 정확히 복원한다.
    const restored = applyCommand(removed.state, removed.inverse, 4000);
    const back = characterById(restored.state, gagaId);
    expect(back.images.map((image) => image.id)).toEqual(["a", "b"]);
    expect(back.coverImageId).toBe("b");
  });

  it("set-image-caption이 역커맨드로 복원된다", () => {
    const { state, gagaId } = buildState();
    const withImage = applyCommand(
      state,
      {
        type: "add-character-image",
        characterId: gagaId,
        image: { id: "a", blobId: "ba", caption: "" },
      },
      2000,
    ).state;
    const captioned = applyCommand(
      withImage,
      { type: "set-image-caption", characterId: gagaId, imageId: "a", caption: "교복" },
      3000,
    );
    expect(characterById(captioned.state, gagaId).images[0]?.caption).toBe("교복");
    const reverted = applyCommand(captioned.state, captioned.inverse, 4000);
    expect(characterById(reverted.state, gagaId).images[0]?.caption).toBe("");
  });
});

describe("대사 커맨드", () => {
  it("add / set / remove가 역커맨드로 복원된다", () => {
    const { state, gagaId } = buildState();
    const quote = { id: "q1", line: "됐어.", situation: "" };
    const added = applyCommand(
      state,
      { type: "add-quote", characterId: gagaId, quote },
      2000,
    );
    expect(characterById(added.state, gagaId).quotes).toHaveLength(1);

    const edited = applyCommand(
      added.state,
      {
        type: "set-quote",
        characterId: gagaId,
        quoteIndex: 0,
        quote: { id: "q1", line: "고마워.", situation: "마음을 열 때" },
      },
      3000,
    );
    expect(characterById(edited.state, gagaId).quotes[0]?.line).toBe("고마워.");
    const unedited = applyCommand(edited.state, edited.inverse, 3500);
    expect(characterById(unedited.state, gagaId).quotes[0]?.line).toBe("됐어.");

    const removed = applyCommand(added.state, added.inverse, 4000);
    expect(characterById(removed.state, gagaId).quotes).toHaveLength(0);
  });
});

describe("팔레트 커맨드", () => {
  it("색 추가가 배경색을 보존한다", () => {
    const { state, gagaId } = buildState();
    const colored = applyCommand(
      state,
      {
        type: "set-character-background-color",
        characterId: gagaId,
        backgroundColor: "#cfe0f6",
      },
      2000,
    ).state;
    const added = applyCommand(
      colored,
      {
        type: "add-palette-color",
        characterId: gagaId,
        color: { id: "c1", role: "머리", color: "#2b2f38" },
      },
      3000,
    );
    const gaga = characterById(added.state, gagaId);
    expect(gaga.appearance.backgroundColor).toBe("#cfe0f6");
    expect(gaga.appearance.palette).toHaveLength(1);

    const reverted = applyCommand(added.state, added.inverse, 4000);
    expect(characterById(reverted.state, gagaId).appearance.palette).toHaveLength(0);
    expect(characterById(reverted.state, gagaId).appearance.backgroundColor).toBe(
      "#cfe0f6",
    );
  });
});

describe("set-relation 커맨드", () => {
  it("라벨 수정이 역커맨드로 복원된다", () => {
    const { state, gagaId, hohoId } = buildState();
    const withRelation = applyCommand(
      state,
      {
        type: "add-relation",
        characterId: gagaId,
        relation: { targetCharacterId: hohoId, label: "손자" },
      },
      2000,
    ).state;
    const edited = applyCommand(
      withRelation,
      {
        type: "set-relation",
        characterId: gagaId,
        relationIndex: 0,
        relation: { targetCharacterId: hohoId, label: "손주" },
      },
      3000,
    );
    expect(characterById(edited.state, gagaId).relations[0]?.label).toBe("손주");
    const reverted = applyCommand(edited.state, edited.inverse, 4000);
    expect(characterById(reverted.state, gagaId).relations[0]?.label).toBe("손자");
  });
});

describe("레거시 정규화", () => {
  it("구 단일 imageId를 이미지 목록·대표로 옮기고 신규 필드를 기본값으로 채운다", () => {
    const normalized = normalizeCharacterRecord({
      id: "c1",
      worldviewId: "w1",
      name: "가가",
      imageId: "blob-x",
      fieldValues: {},
      personalityTags: [],
      story: "",
      relations: [],
      groupIds: [],
      favorite: false,
      deletedAt: null,
      createdAt: 1,
      modifiedAt: 1,
    });
    expect(normalized.images).toEqual([
      { id: "blob-x", blobId: "blob-x", caption: "" },
    ]);
    expect(normalized.coverImageId).toBe("blob-x");
    expect(normalized.quotes).toEqual([]);
    expect(normalized.appearance).toEqual({ backgroundColor: null, palette: [] });
  });

  it("이미지가 없던 레코드는 빈 목록·대표 없음이 된다", () => {
    const normalized = normalizeCharacterRecord({
      id: "c2",
      worldviewId: "w1",
      name: "뫄뫄",
      imageId: null,
      fieldValues: {},
      personalityTags: [],
      story: "",
      relations: [],
      groupIds: [],
      favorite: false,
      deletedAt: null,
      createdAt: 1,
      modifiedAt: 1,
    });
    expect(normalized.images).toEqual([]);
    expect(normalized.coverImageId).toBeNull();
  });
});
