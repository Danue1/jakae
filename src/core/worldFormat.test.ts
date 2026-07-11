import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createCharacter, createWorldview } from "./model";
import { decodeWorldFile, encodeWorldFile } from "./worldFormat";

const SEED_DEFAULTS = {
  fieldLabels: ["나이", "종족"],
  connectors: ["의", "에게", "를"],
};

function buildContent() {
  const worldview = createWorldview("어쩌구 우주", SEED_DEFAULTS, "ko", "2020", 0);
  const gaga = createCharacter(worldview.id, "가가", 0);
  gaga.personalityTags = ["조용함"];
  gaga.imageId = "image-1";
  gaga.appearance = { backgroundColor: "#cfe0f6" };
  const trashed = createCharacter(worldview.id, "삭제됨", 0);
  trashed.deletedAt = 100;
  gaga.relations = [
    { targetCharacterId: trashed.id, connector: "의", label: "친구" },
  ];
  const images = [
    { id: "image-1", bytes: new Uint8Array([1, 2, 3]), type: "image/png" },
  ];
  return { worldview, characters: [gaga, trashed], images };
}

describe("worldFormat", () => {
  it("왕복 시 내용이 보존되고 모든 id는 재발급된다", () => {
    const content = buildContent();
    const decoded = decodeWorldFile(encodeWorldFile(content));

    expect(decoded.worldview.name).toBe("어쩌구 우주");
    expect(decoded.worldview.id).not.toBe(content.worldview.id);
    expect(decoded.characters).toHaveLength(1);
    expect(decoded.characters[0]?.name).toBe("가가");
    expect(decoded.characters[0]?.appearance.backgroundColor).toBe("#cfe0f6");
    expect(decoded.images[0]?.bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(decoded.images[0]?.id).toBe(decoded.characters[0]?.imageId);
  });

  it("휴지통은 기본 제외되고, 제외 대상을 가리키는 관계도 함께 정리된다", () => {
    const content = buildContent();
    const decoded = decodeWorldFile(encodeWorldFile(content));
    expect(decoded.characters.map((character) => character.name)).toEqual([
      "가가",
    ]);
    expect(decoded.characters[0]?.relations).toHaveLength(0);
  });

  it("v2 파일(particles·builtIn·particle 관계)을 정규화해 받아들인다", () => {
    const legacyJson = JSON.stringify({
      formatVersion: 1,
      worldview: {
        id: "world-1",
        name: "레거시",
        era: "",
        fieldDefinitions: [
          { id: "field-1", label: "나이", builtIn: true, type: "text" },
        ],
        particles: ["의", "에게"],
        groups: [],
        createdAt: 0,
        modifiedAt: 0,
      },
      characters: [
        {
          id: "character-1",
          worldviewId: "world-1",
          name: "가가",
          imageId: null,
          fieldValues: { "field-1": "15" },
          personalityTags: [],
          story: "",
          relations: [
            { targetCharacterId: "character-2", particle: "의", label: "집사" },
          ],
          groupIds: [],
          favorite: false,
          deletedAt: null,
          createdAt: 0,
          modifiedAt: 0,
        },
        {
          id: "character-2",
          worldviewId: "world-1",
          name: "고영희",
          imageId: null,
          fieldValues: {},
          personalityTags: [],
          story: "",
          relations: [],
          groupIds: [],
          favorite: false,
          deletedAt: null,
          createdAt: 0,
          modifiedAt: 0,
        },
      ],
      imageTypes: {},
    });
    const decoded = decodeWorldFile(
      zipSync({ "world.json": strToU8(legacyJson) }),
    );

    expect(decoded.worldview.connectors).toEqual(["의", "에게"]);
    expect(decoded.worldview.fieldDefinitions[0]).not.toHaveProperty("builtIn");
    expect(decoded.worldview.primaryLocale).toBe("ko");
    expect(decoded.worldview.fieldDefinitions[0]?.localized).toBe(false);
    const gaga = decoded.characters.find((character) => character.name === "가가");
    expect(gaga?.appearance).toEqual({ backgroundColor: null });
    expect(gaga?.nameTranslations).toEqual({});
    expect(gaga?.relations[0]?.connector).toBe("의");
  });

  it("상위 formatVersion 파일은 거부한다", () => {
    const content = buildContent();
    const tamperedJson = JSON.stringify({
      formatVersion: 99,
      worldview: content.worldview,
      characters: [],
      imageTypes: {},
    });
    const tampered = zipSync({ "world.json": strToU8(tamperedJson) });
    expect(() => decodeWorldFile(tampered)).toThrow();
  });
});
