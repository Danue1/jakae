import { type Locale } from "./config";

export interface SampleCharacterSeed {
  name: string;
  fieldValues: string[];
  personalityTags: string[];
  // 분류·필터용 자유 태그(카드 메타·필터 칩). 성격 태그와 별개.
  classTags: string[];
  story: string;
  favorite: boolean;
  groupIndex: number | null;
  raceIndex: number | null;
}

export interface SampleRelationSeed {
  fromIndex: number;
  toIndex: number;
  label: string;
}

export interface SampleGroupSeed {
  name: string;
  description: string;
}

export interface SamplePlaceSeed {
  name: string;
  kind: string;
  parentIndex: number | null;
}

export interface SampleRaceRelationSeed {
  toIndex: number;
  label: string;
}

export interface SampleRaceSeed {
  name: string;
  symbolColor: string | null;
  parentIndex: number | null;
  lifespan: string;
  height: string;
  origin: string;
  language: string;
  traits: string[];
  description: string;
  relations: SampleRaceRelationSeed[];
}

export interface SampleItemRelationSeed {
  toIndex: number;
  label: string;
}

export interface SampleItemSeed {
  name: string;
  kind: string;
  rarity: string;
  origin: string;
  effects: string[];
  description: string;
  parentIndex: number | null;
  // 이 아이템을 소유한 캐릭터 index — 시드 시 character→item 참조로 연결한다.
  ownerIndex: number | null;
  relations: SampleItemRelationSeed[];
}

export interface SampleGlossarySeed {
  name: string;
  description: string;
}

export interface SampleChapterSeed {
  name: string;
  era: string;
}

export interface SampleEventParticipantSeed {
  characterIndex: number;
  role: string;
}

export interface SampleEventSeed {
  title: string;
  when: string;
  chapterIndex: number | null;
  ownerIndex: number | null;
  placeIndex: number | null;
  description: string;
  participants: SampleEventParticipantSeed[];
}

export interface SeedContent {
  fieldLabels: string[];
  sampleWorldviewName: string;
  sampleSynopsis: string;
  sampleEra: string;
  sampleGroups: SampleGroupSeed[];
  sampleRaces: SampleRaceSeed[];
  sampleItems: SampleItemSeed[];
  samplePlaces: SamplePlaceSeed[];
  sampleGlossary: SampleGlossarySeed[];
  sampleChapters: SampleChapterSeed[];
  sampleCharacters: SampleCharacterSeed[];
  sampleRelations: SampleRelationSeed[];
  sampleEvents: SampleEventSeed[];
}

const ko: SeedContent = {
  fieldLabels: ["나이", "종족", "성별", "신장", "체중"],
  sampleWorldviewName: "아스라이 연대기",
  sampleSynopsis:
    "마나가 서서히 메말라 가는 아스라이 제국. 은빛서약 기사단과 흑첨탑 결사가 대붕괴의 유산을 두고 부딪친다.",
  sampleEra: "제국력 1120년",
  sampleGroups: [
    {
      name: "은빛서약 기사단",
      description: "제국을 수호하는 정예 기사단. 입단자는 은빛서약을 맺는다.",
    },
    {
      name: "방랑 상단",
      description: "대륙의 교역로를 잇는 상인 연합. 소식과 물자가 모두 이곳을 거친다.",
    },
    {
      name: "흑첨탑 결사",
      description: "금지된 마법을 연구하는 비밀 결사. 대붕괴의 힘을 되살리려 한다.",
    },
    {
      name: "달의 성소",
      description: "달엘프 치유사들이 모인 신전. 상처와 저주를 다스린다.",
    },
  ],
  sampleRaces: [
    {
      name: "인간",
      symbolColor: "#3e6db5",
      parentIndex: null,
      lifespan: "약 80년",
      height: "160–185cm",
      origin: "중앙 대평원",
      language: "제국 공용어",
      traits: ["적응력", "야망"],
      description: "가장 수가 많고 제국의 중추를 이루는 종족. 짧은 수명만큼 성취에 집착한다.",
      relations: [{ toIndex: 1, label: "오랜 동맹" }],
    },
    {
      name: "엘프",
      symbolColor: "#5a8f5a",
      parentIndex: null,
      lifespan: "700년 이상",
      height: "170–190cm",
      origin: "은빛숲",
      language: "고대 엘프어",
      traits: ["장수", "마력 친화"],
      description: "마나에 가장 가까운 장수 종족. 오래된 지혜를 지녔으나 변화를 꺼린다.",
      relations: [],
    },
    {
      name: "숲엘프",
      symbolColor: "#4a8a5a",
      parentIndex: 1,
      lifespan: "600년 이상",
      height: "170–185cm",
      origin: "은빛숲 외곽",
      language: "고대 엘프어",
      traits: ["궁술", "은신"],
      description: "숲에 뿌리내린 엘프의 분파. 활과 정찰에 능하다.",
      relations: [{ toIndex: 3, label: "동족" }],
    },
    {
      name: "달엘프",
      symbolColor: "#8a5cb5",
      parentIndex: 1,
      lifespan: "800년 이상",
      height: "168–182cm",
      origin: "달의 성소",
      language: "고대 엘프어",
      traits: ["치유 마법", "예지"],
      description: "달빛 아래 치유의 술법을 이어 온 엘프의 분파.",
      relations: [],
    },
    {
      name: "드워프",
      symbolColor: "#c98a2e",
      parentIndex: null,
      lifespan: "약 250년",
      height: "130–150cm",
      origin: "서리산맥",
      language: "드워프 룬어",
      traits: ["대장 기술", "완고함"],
      description: "산맥 깊은 곳에 대장간을 둔 종족. 룬과 금속을 다루는 솜씨가 으뜸이다.",
      relations: [{ toIndex: 6, label: "교역" }],
    },
    {
      name: "소인족",
      symbolColor: "#b4533a",
      parentIndex: null,
      lifespan: "약 100년",
      height: "95–115cm",
      origin: "교역로 마을",
      language: "제국 공용어",
      traits: ["민첩", "행운"],
      description: "작지만 재빠르고 붙임성이 좋은 종족. 상단과 도시 어디에나 있다.",
      relations: [],
    },
    {
      name: "용인",
      symbolColor: "#4a8a8f",
      parentIndex: null,
      lifespan: "약 400년",
      height: "185–205cm",
      origin: "동부 화산지대",
      language: "용언",
      traits: ["비늘 갑주", "화염 저항"],
      description: "용의 피를 이은 종족. 비늘과 긍지를 지녔고 용병으로 이름 높다.",
      relations: [],
    },
  ],
  sampleItems: [
    {
      name: "여명의 검",
      kind: "무기 · 장검",
      rarity: "유물급",
      origin: "대붕괴 이전 유물",
      effects: ["빛 속성", "저주 정화"],
      description:
        "세라핀이 물려받은 의례용 장검. 마나가 깃들면 칼날이 여명빛으로 타오른다.",
      parentIndex: null,
      ownerIndex: 0,
      relations: [
        { toIndex: 1, label: "핵 · 여명석" },
        { toIndex: 2, label: "한 쌍" },
      ],
    },
    {
      name: "여명석",
      kind: "마법석",
      rarity: "희귀",
      origin: "서리굴",
      effects: ["마나 저장"],
      description: "여명의 검에 박히는 공명석의 일종. 빛의 힘을 응축한다.",
      parentIndex: null,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "황혼의 검",
      kind: "무기 · 장검",
      rarity: "유물급",
      origin: "대붕괴 이전 유물",
      effects: ["어둠 속성", "생명력 흡수"],
      description:
        "여명의 검과 한 쌍을 이루는 흑검. 아르한이 대붕괴의 힘으로 되살렸다.",
      parentIndex: null,
      ownerIndex: 7,
      relations: [{ toIndex: 0, label: "한 쌍" }],
    },
    {
      name: "은빛서약 판금갑",
      kind: "방어구 · 판금",
      rarity: "상급",
      origin: "그림바르드의 대장간",
      effects: ["서약 가호", "물리 경감"],
      description: "기사단 정예에게만 주어지는 한 벌 갑주. 서약을 어기면 빛을 잃는다.",
      parentIndex: null,
      ownerIndex: 0,
      relations: [{ toIndex: 6, label: "제작자 · 그림바르드" }],
    },
    {
      name: "서약의 투구",
      kind: "방어구 · 부품",
      rarity: "상급",
      origin: "그림바르드의 대장간",
      effects: ["정신 저항"],
      description: "판금갑의 투구 부분. 은빛 깃털 장식이 달려 있다.",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "서약의 건틀릿",
      kind: "방어구 · 부품",
      rarity: "상급",
      origin: "그림바르드의 대장간",
      effects: ["악력 강화"],
      description: "판금갑의 손목 보호구. 룬이 새겨져 검을 놓치지 않게 한다.",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "별빛 장궁",
      kind: "무기 · 활",
      rarity: "상급",
      origin: "은빛숲",
      effects: ["바람 유도", "야간 명중"],
      description: "카엘이 아끼는 숲엘프의 장궁. 시위를 놓으면 별빛 궤적이 남는다.",
      parentIndex: null,
      ownerIndex: 1,
      relations: [],
    },
    {
      name: "달의 성수",
      kind: "소모품 · 물약",
      rarity: "일반",
      origin: "달의 성소",
      effects: ["상처 회복", "저주 완화"],
      description: "리라가 달빛 아래 조제하는 치유 물약. 여럿이 나눠 쓴다.",
      parentIndex: null,
      ownerIndex: 4,
      relations: [],
    },
    {
      name: "룬 각인 나침반",
      kind: "도구",
      rarity: "희귀",
      origin: "방랑 상단",
      effects: ["마나 감지", "은신처 탐색"],
      description: "피오나가 훔친(혹은 빌린) 상단의 보물. 마나가 강한 곳을 가리킨다.",
      parentIndex: null,
      ownerIndex: 5,
      relations: [],
    },
    {
      name: "용린 대검",
      kind: "무기 · 대검",
      rarity: "상급",
      origin: "동부 화산지대",
      effects: ["화염 저항", "관통"],
      description: "드라코가 제 비늘을 벼려 만든 대검. 주인의 긍지를 닮았다.",
      parentIndex: null,
      ownerIndex: 6,
      relations: [],
    },
    {
      name: "대붕괴의 성물",
      kind: "유물",
      rarity: "유물급",
      origin: "흑첨탑 결사",
      effects: ["마나 역류", "의식 촉매"],
      description:
        "대붕괴를 재현하려는 흑첨탑의 핵심 성물. 모르가나가 되살리려 하는 금기의 유물이다.",
      parentIndex: null,
      ownerIndex: 2,
      relations: [{ toIndex: 2, label: "동력원" }],
    },
  ],
  samplePlaces: [
    { name: "아스라이 제국", kind: "제국", parentIndex: null },
    { name: "황도 루멘", kind: "도시", parentIndex: 0 },
    { name: "황궁", kind: "성채", parentIndex: 1 },
    { name: "은빛서약 기사단 본부", kind: "건물", parentIndex: 1 },
    { name: "시장 구역", kind: "구역", parentIndex: 1 },
    { name: "항구도시 마레", kind: "도시", parentIndex: 0 },
    { name: "서리산맥", kind: "산맥", parentIndex: null },
    { name: "서리굴", kind: "던전", parentIndex: 6 },
    { name: "은빛숲", kind: "숲", parentIndex: null },
  ],
  sampleGlossary: [
    {
      name: "마나",
      description: "세계에 흐르는 마법 에너지의 근원. 모든 주문과 각인의 연료가 된다.",
    },
    {
      name: "룬 각인",
      description: "계약자의 몸에 새겨지는 마법 문양. 큰 힘을 빌리는 대가로 생명력을 요구한다.",
    },
    {
      name: "공명석",
      description: "마나를 저장하고 증폭하는 희귀 광물. 서리산맥 깊은 곳에서만 나온다.",
    },
    {
      name: "은빛서약",
      description: "기사단 입단 시 맺는 맹세. 어기면 서약이 준 힘을 잃는다.",
    },
    {
      name: "대붕괴",
      description: "천 년 전 고대 마법 문명을 무너뜨린 재앙. 지금의 마나 고갈이 그 여파다.",
    },
    {
      name: "서리 저주",
      description: "서리산맥에 걸린 오랜 저주. 정상에 다가서는 자의 기억을 얼려 앗아간다.",
    },
  ],
  sampleChapters: [
    { name: "여명의 장", era: "제국력 1112년" },
    { name: "균열의 장", era: "제국력 1118년" },
    { name: "격동의 장", era: "제국력 1120년" },
  ],
  sampleCharacters: [
    {
      name: "세라핀",
      fieldValues: ["27", "인간", "여", "168cm", ""],
      personalityTags: ["강직함", "책임감"],
      classTags: ["주인공", "기사"],
      story:
        "은빛서약 기사단의 젊은 단장. 대붕괴의 진실을 좇으며 흑첨탑과 맞선다.",
      favorite: true,
      groupIndex: 0,
      raceIndex: 0,
    },
    {
      name: "카엘",
      fieldValues: ["122", "숲엘프", "남", "179cm", ""],
      personalityTags: ["자유분방", "낙천적"],
      classTags: ["궁수", "동료"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 2,
    },
    {
      name: "모르가나",
      fieldValues: ["34", "인간", "여", "170cm", ""],
      personalityTags: ["냉철함", "야심"],
      classTags: ["마법사", "적대"],
      story:
        "흑첨탑 결사의 재사. 금지된 지식으로 잃어버린 마나를 되살리려 한다.",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
    {
      name: "그림바르드",
      fieldValues: ["168", "드워프", "남", "141cm", ""],
      personalityTags: ["우직함", "고집"],
      classTags: ["대장장이"],
      story: "",
      favorite: false,
      groupIndex: 0,
      raceIndex: 4,
    },
    {
      name: "리라",
      fieldValues: ["88", "달엘프", "여", "172cm", ""],
      personalityTags: ["차분함", "다정함"],
      classTags: ["치유사", "동료"],
      story:
        "달의 성소에서 온 치유사. 서리 저주에 얽힌 잃어버린 이름을 찾고 있다.",
      favorite: true,
      groupIndex: 3,
      raceIndex: 3,
    },
    {
      name: "피오나",
      fieldValues: ["29", "소인족", "여", "108cm", ""],
      personalityTags: ["쾌활함", "잔꾀"],
      classTags: ["도적", "동료"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 5,
    },
    {
      name: "드라코",
      fieldValues: ["45", "용인", "남", "195cm", ""],
      personalityTags: ["과묵함", "긍지"],
      classTags: ["용병"],
      story: "",
      favorite: false,
      groupIndex: null,
      raceIndex: 6,
    },
    {
      name: "아르한",
      fieldValues: ["51", "인간", "남", "182cm", ""],
      personalityTags: ["교활함", "냉혹함"],
      classTags: ["흑막", "적대"],
      story:
        "흑첨탑 결사를 이끄는 대마법사. 대붕괴를 재현해 세계를 다시 쓰려 한다.",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 4, label: "전우" },
    { fromIndex: 0, toIndex: 3, label: "동료" },
    { fromIndex: 0, toIndex: 2, label: "숙적" },
    { fromIndex: 1, toIndex: 5, label: "단짝" },
    { fromIndex: 2, toIndex: 7, label: "스승" },
  ],
  sampleEvents: [
    {
      title: "세라핀, 은빛서약을 맺다",
      when: "1112년 봄",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 3,
      description: "어린 세라핀이 기사단에 입단하며 은빛서약을 맺는다.",
      participants: [{ characterIndex: 0, role: "서약자" }],
    },
    {
      title: "방랑 상단과의 동행",
      when: "1114년 여름",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 4,
      description: "호위 임무 중 세라핀이 카엘·피오나와 처음 만난다.",
      participants: [
        { characterIndex: 0, role: "호위" },
        { characterIndex: 1, role: "길잡이" },
        { characterIndex: 5, role: "정찰" },
      ],
    },
    {
      title: "흑첨탑의 습격",
      when: "1118년 여름",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 1,
      description: "모르가나가 이끄는 흑첨탑이 황도를 습격한다.",
      participants: [
        { characterIndex: 2, role: "습격" },
        { characterIndex: 0, role: "방어" },
        { characterIndex: 1, role: "지원" },
      ],
    },
    {
      title: "서리굴 원정",
      when: "1119년 겨울",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 7,
      description: "공명석을 찾아 서리굴 깊은 곳으로 향한다.",
      participants: [
        { characterIndex: 0, role: "대장" },
        { characterIndex: 3, role: "채굴" },
        { characterIndex: 4, role: "치유" },
        { characterIndex: 6, role: "호위" },
      ],
    },
    {
      title: "황도 공방전",
      when: "1120년 봄",
      chapterIndex: 2,
      ownerIndex: null,
      placeIndex: 2,
      description: "아르한이 대붕괴의 의식을 시작하고, 기사단이 황궁에서 맞선다.",
      participants: [
        { characterIndex: 0, role: "지휘" },
        { characterIndex: 7, role: "적장" },
        { characterIndex: 2, role: "집행" },
        { characterIndex: 6, role: "용병" },
      ],
    },
    {
      title: "리라, 잃어버린 이름을 되찾다",
      when: "1120년 여름",
      chapterIndex: 2,
      ownerIndex: 4,
      placeIndex: null,
      description: "리라가 서리 저주를 풀고 봉인된 자신의 이름을 되찾는다.",
      participants: [{ characterIndex: 4, role: "본인" }],
    },
    {
      title: "떠도는 전설: 용의 귀환",
      when: "시점 불명",
      chapterIndex: null,
      ownerIndex: null,
      placeIndex: 8,
      description: "은빛숲에 용인의 시조가 돌아온다는 소문이 떠돈다.",
      participants: [{ characterIndex: 6, role: "전설의 주인공" }],
    },
  ],
};

const en: SeedContent = {
  fieldLabels: ["Age", "Species", "Gender", "Height", "Weight"],
  sampleWorldviewName: "Chronicles of Asrai",
  sampleSynopsis:
    "The Asrai Empire, where mana is slowly running dry. The Order of the Silver Oath and the Black Spire clash over the legacy of the Sundering.",
  sampleEra: "Imperial Year 1120",
  sampleGroups: [
    {
      name: "Order of the Silver Oath",
      description: "The empire's elite knights. Every initiate swears the Silver Oath.",
    },
    {
      name: "Wandering Caravan",
      description: "A merchant league linking the trade roads — news and goods pass through it.",
    },
    {
      name: "Order of the Black Spire",
      description: "A secret society studying forbidden magic to revive the power of the Sundering.",
    },
    {
      name: "Sanctuary of the Moon",
      description: "A temple of Moon Elf healers who mend wounds and curses.",
    },
  ],
  sampleRaces: [
    {
      name: "Human",
      symbolColor: "#3e6db5",
      parentIndex: null,
      lifespan: "~80 years",
      height: "160–185cm",
      origin: "Central Plains",
      language: "Imperial Common",
      traits: ["Adaptable", "Ambitious"],
      description: "The most numerous race and the empire's backbone. Their short lives drive them to achieve.",
      relations: [{ toIndex: 1, label: "old allies" }],
    },
    {
      name: "Elf",
      symbolColor: "#5a8f5a",
      parentIndex: null,
      lifespan: "700+ years",
      height: "170–190cm",
      origin: "Silverwood",
      language: "Old Elvish",
      traits: ["Long-lived", "Attuned to mana"],
      description: "A long-lived race closest to mana. Wise but wary of change.",
      relations: [],
    },
    {
      name: "Wood Elf",
      symbolColor: "#4a8a5a",
      parentIndex: 1,
      lifespan: "600+ years",
      height: "170–185cm",
      origin: "Silverwood fringe",
      language: "Old Elvish",
      traits: ["Archery", "Stealth"],
      description: "An elven branch rooted in the forest, skilled with bow and scouting.",
      relations: [{ toIndex: 3, label: "kin" }],
    },
    {
      name: "Moon Elf",
      symbolColor: "#8a5cb5",
      parentIndex: 1,
      lifespan: "800+ years",
      height: "168–182cm",
      origin: "Sanctuary of the Moon",
      language: "Old Elvish",
      traits: ["Healing magic", "Foresight"],
      description: "An elven branch that keeps the healing arts under the moonlight.",
      relations: [],
    },
    {
      name: "Dwarf",
      symbolColor: "#c98a2e",
      parentIndex: null,
      lifespan: "~250 years",
      height: "130–150cm",
      origin: "Frostpeak Mountains",
      language: "Dwarven Runic",
      traits: ["Smithing", "Stubborn"],
      description: "A race with forges deep in the mountains, unmatched with runes and metal.",
      relations: [{ toIndex: 6, label: "trade" }],
    },
    {
      name: "Halfling",
      symbolColor: "#b4533a",
      parentIndex: null,
      lifespan: "~100 years",
      height: "95–115cm",
      origin: "Trade-road villages",
      language: "Imperial Common",
      traits: ["Nimble", "Lucky"],
      description: "Small, quick, and sociable — found in every caravan and city.",
      relations: [],
    },
    {
      name: "Dragonkin",
      symbolColor: "#4a8a8f",
      parentIndex: null,
      lifespan: "~400 years",
      height: "185–205cm",
      origin: "Eastern volcanoes",
      language: "Draconic",
      traits: ["Scaled hide", "Fire resistance"],
      description: "Heirs of dragon blood, proud and scaled, famed as mercenaries.",
      relations: [],
    },
  ],
  sampleItems: [
    {
      name: "Dawnbrand",
      kind: "Weapon · Longsword",
      rarity: "Relic",
      origin: "Pre-Sundering relic",
      effects: ["Light element", "Curse cleansing"],
      description:
        "The ceremonial longsword Seraphine inherited. Its blade blazes with dawnlight when mana flows through it.",
      parentIndex: null,
      ownerIndex: 0,
      relations: [
        { toIndex: 1, label: "Core · Dawnstone" },
        { toIndex: 2, label: "Paired" },
      ],
    },
    {
      name: "Dawnstone",
      kind: "Mana stone",
      rarity: "Rare",
      origin: "Frost Hollow",
      effects: ["Mana storage"],
      description: "A resonance stone set into Dawnbrand, condensing the power of light.",
      parentIndex: null,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "Duskbrand",
      kind: "Weapon · Longsword",
      rarity: "Relic",
      origin: "Pre-Sundering relic",
      effects: ["Dark element", "Life drain"],
      description:
        "The black blade paired with Dawnbrand, revived by Arhan with the power of the Sundering.",
      parentIndex: null,
      ownerIndex: 7,
      relations: [{ toIndex: 0, label: "Paired" }],
    },
    {
      name: "Silver Oath Plate",
      kind: "Armor · Plate",
      rarity: "Superior",
      origin: "Grimbard's forge",
      effects: ["Oath's blessing", "Physical mitigation"],
      description: "A suit of armor granted only to the order's elite. It dims if the oath is broken.",
      parentIndex: null,
      ownerIndex: 0,
      relations: [{ toIndex: 6, label: "Smith · Grimbard" }],
    },
    {
      name: "Oath Helm",
      kind: "Armor · Part",
      rarity: "Superior",
      origin: "Grimbard's forge",
      effects: ["Mind resistance"],
      description: "The helm of the plate suit, crowned with silver plumage.",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "Oath Gauntlets",
      kind: "Armor · Part",
      rarity: "Superior",
      origin: "Grimbard's forge",
      effects: ["Grip enhancement"],
      description: "Wrist guards of the plate suit, runed so a blade is never dropped.",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "Starlight Longbow",
      kind: "Weapon · Bow",
      rarity: "Superior",
      origin: "Silverwood",
      effects: ["Wind guidance", "Night accuracy"],
      description: "Kael's cherished wood-elf longbow. Loosing the string leaves a trail of starlight.",
      parentIndex: null,
      ownerIndex: 1,
      relations: [],
    },
    {
      name: "Moon Elixir",
      kind: "Consumable · Potion",
      rarity: "Common",
      origin: "Sanctuary of the Moon",
      effects: ["Wound recovery", "Curse easing"],
      description: "A healing potion Lyra brews under moonlight, shared among the party.",
      parentIndex: null,
      ownerIndex: 4,
      relations: [],
    },
    {
      name: "Rune-Etched Compass",
      kind: "Tool",
      rarity: "Rare",
      origin: "Wandering Caravan",
      effects: ["Mana sensing", "Hideout finding"],
      description: "A caravan treasure Fiona stole (or borrowed). It points to places thick with mana.",
      parentIndex: null,
      ownerIndex: 5,
      relations: [],
    },
    {
      name: "Dragonscale Greatsword",
      kind: "Weapon · Greatsword",
      rarity: "Superior",
      origin: "Eastern volcanic lands",
      effects: ["Fire resistance", "Penetration"],
      description: "A greatsword Draco forged from his own scales — as proud as its master.",
      parentIndex: null,
      ownerIndex: 6,
      relations: [],
    },
    {
      name: "Relic of the Sundering",
      kind: "Artifact",
      rarity: "Relic",
      origin: "Order of the Black Spire",
      effects: ["Mana surge", "Ritual catalyst"],
      description:
        "The Black Spire's central relic for recreating the Sundering — the forbidden artifact Morgana seeks to awaken.",
      parentIndex: null,
      ownerIndex: 2,
      relations: [{ toIndex: 2, label: "Power source" }],
    },
  ],
  samplePlaces: [
    { name: "Asrai Empire", kind: "Empire", parentIndex: null },
    { name: "Lumen, the Capital", kind: "City", parentIndex: 0 },
    { name: "Imperial Palace", kind: "Citadel", parentIndex: 1 },
    { name: "Silver Oath Headquarters", kind: "Building", parentIndex: 1 },
    { name: "Market District", kind: "District", parentIndex: 1 },
    { name: "Port of Mare", kind: "City", parentIndex: 0 },
    { name: "Frostpeak Mountains", kind: "Range", parentIndex: null },
    { name: "Frost Hollow", kind: "Dungeon", parentIndex: 6 },
    { name: "Silverwood", kind: "Forest", parentIndex: null },
  ],
  sampleGlossary: [
    {
      name: "Mana",
      description: "The wellspring of magical energy in the world — fuel for every spell and sigil.",
    },
    {
      name: "Runic Sigil",
      description: "A magical mark etched into the bearer's body; great power comes at the cost of life force.",
    },
    {
      name: "Resonance Stone",
      description: "A rare mineral that stores and amplifies mana, found only deep in the Frostpeak Mountains.",
    },
    {
      name: "Silver Oath",
      description: "The vow sworn upon joining the Order; breaking it strips away the power it grants.",
    },
    {
      name: "The Sundering",
      description: "The cataclysm that toppled the ancient magical civilization a thousand years ago; today's mana drought is its aftermath.",
    },
    {
      name: "Frost Curse",
      description: "An old curse upon the Frostpeak Mountains that freezes and steals the memories of those who near the summit.",
    },
  ],
  sampleChapters: [
    { name: "Chapter of Dawn", era: "Imperial Year 1112" },
    { name: "Chapter of the Rift", era: "Imperial Year 1118" },
    { name: "Chapter of Upheaval", era: "Imperial Year 1120" },
  ],
  sampleCharacters: [
    {
      name: "Seraphine",
      fieldValues: ["27", "Human", "Female", "168cm", ""],
      personalityTags: ["Upright", "Dutiful"],
      classTags: ["Protagonist", "Knight"],
      story:
        "The young captain of the Silver Oath, chasing the truth of the Sundering against the Black Spire.",
      favorite: true,
      groupIndex: 0,
      raceIndex: 0,
    },
    {
      name: "Kael",
      fieldValues: ["122", "Wood Elf", "Male", "179cm", ""],
      personalityTags: ["Free-spirited", "Easygoing"],
      classTags: ["Archer", "Ally"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 2,
    },
    {
      name: "Morgana",
      fieldValues: ["34", "Human", "Female", "170cm", ""],
      personalityTags: ["Cold", "Ambitious"],
      classTags: ["Mage", "Antagonist"],
      story:
        "A prodigy of the Black Spire seeking to revive lost mana through forbidden knowledge.",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
    {
      name: "Grimbard",
      fieldValues: ["168", "Dwarf", "Male", "141cm", ""],
      personalityTags: ["Steadfast", "Stubborn"],
      classTags: ["Smith"],
      story: "",
      favorite: false,
      groupIndex: 0,
      raceIndex: 4,
    },
    {
      name: "Lyra",
      fieldValues: ["88", "Moon Elf", "Female", "172cm", ""],
      personalityTags: ["Calm", "Kind"],
      classTags: ["Healer", "Ally"],
      story:
        "A healer from the Sanctuary of the Moon, searching for the name she lost to the Frost Curse.",
      favorite: true,
      groupIndex: 3,
      raceIndex: 3,
    },
    {
      name: "Fiona",
      fieldValues: ["29", "Halfling", "Female", "108cm", ""],
      personalityTags: ["Cheerful", "Cunning"],
      classTags: ["Rogue", "Ally"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 5,
    },
    {
      name: "Draco",
      fieldValues: ["45", "Dragonkin", "Male", "195cm", ""],
      personalityTags: ["Taciturn", "Proud"],
      classTags: ["Mercenary"],
      story: "",
      favorite: false,
      groupIndex: null,
      raceIndex: 6,
    },
    {
      name: "Arhan",
      fieldValues: ["51", "Human", "Male", "182cm", ""],
      personalityTags: ["Cunning", "Ruthless"],
      classTags: ["Mastermind", "Antagonist"],
      story:
        "The archmage who leads the Black Spire, bent on recreating the Sundering to rewrite the world.",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 4, label: "comrade" },
    { fromIndex: 0, toIndex: 3, label: "ally" },
    { fromIndex: 0, toIndex: 2, label: "nemesis" },
    { fromIndex: 1, toIndex: 5, label: "partner in crime" },
    { fromIndex: 2, toIndex: 7, label: "mentor" },
  ],
  sampleEvents: [
    {
      title: "Seraphine Swears the Silver Oath",
      when: "Spring, 1112",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 3,
      description: "A young Seraphine joins the Order and swears the Silver Oath.",
      participants: [{ characterIndex: 0, role: "oath-taker" }],
    },
    {
      title: "Traveling with the Caravan",
      when: "Summer, 1114",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 4,
      description: "On escort duty, Seraphine first meets Kael and Fiona.",
      participants: [
        { characterIndex: 0, role: "escort" },
        { characterIndex: 1, role: "guide" },
        { characterIndex: 5, role: "scout" },
      ],
    },
    {
      title: "Raid of the Black Spire",
      when: "Summer, 1118",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 1,
      description: "Morgana leads the Black Spire in a raid on the capital.",
      participants: [
        { characterIndex: 2, role: "raider" },
        { characterIndex: 0, role: "defender" },
        { characterIndex: 1, role: "support" },
      ],
    },
    {
      title: "Expedition to Frost Hollow",
      when: "Winter, 1119",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 7,
      description: "They descend into Frost Hollow in search of a resonance stone.",
      participants: [
        { characterIndex: 0, role: "leader" },
        { characterIndex: 3, role: "miner" },
        { characterIndex: 4, role: "healer" },
        { characterIndex: 6, role: "guard" },
      ],
    },
    {
      title: "Siege of the Capital",
      when: "Spring, 1120",
      chapterIndex: 2,
      ownerIndex: null,
      placeIndex: 2,
      description: "Arhan begins the rite of the Sundering, and the Order stands against him at the palace.",
      participants: [
        { characterIndex: 0, role: "commander" },
        { characterIndex: 7, role: "enemy lord" },
        { characterIndex: 2, role: "executor" },
        { characterIndex: 6, role: "mercenary" },
      ],
    },
    {
      title: "Lyra Reclaims Her Lost Name",
      when: "Summer, 1120",
      chapterIndex: 2,
      ownerIndex: 4,
      placeIndex: null,
      description: "Lyra breaks the Frost Curse and reclaims her sealed name.",
      participants: [{ characterIndex: 4, role: "herself" }],
    },
    {
      title: "A Wandering Legend: Return of the Dragon",
      when: "Unknown",
      chapterIndex: null,
      ownerIndex: null,
      placeIndex: 8,
      description: "Rumors spread through Silverwood that the dragonkin's progenitor is returning.",
      participants: [{ characterIndex: 6, role: "legend's hero" }],
    },
  ],
};

const ja: SeedContent = {
  fieldLabels: ["年齢", "種族", "性別", "身長", "体重"],
  sampleWorldviewName: "アスライ年代記",
  sampleSynopsis:
    "マナが徐々に枯れゆくアスライ帝国。銀の誓い騎士団と黒尖塔結社が、大崩壊の遺産をめぐって衝突する。",
  sampleEra: "帝国暦1120年",
  sampleGroups: [
    {
      name: "銀の誓い騎士団",
      description: "帝国を守る精鋭騎士団。入団者は銀の誓いを立てる。",
    },
    {
      name: "放浪商団",
      description: "大陸の交易路をつなぐ商人連合。報せも物資もここを通る。",
    },
    {
      name: "黒尖塔結社",
      description: "禁じられた魔法を研究する秘密結社。大崩壊の力を蘇らせようとしている。",
    },
    {
      name: "月の聖所",
      description: "月エルフの治癒師が集う神殿。傷と呪いを癒やす。",
    },
  ],
  sampleRaces: [
    {
      name: "人間",
      symbolColor: "#3e6db5",
      parentIndex: null,
      lifespan: "約80年",
      height: "160–185cm",
      origin: "中央大平原",
      language: "帝国共通語",
      traits: ["適応力", "野心"],
      description: "最も数が多く帝国の中枢を成す種族。短い寿命ゆえ成果に執着する。",
      relations: [{ toIndex: 1, label: "古き同盟" }],
    },
    {
      name: "エルフ",
      symbolColor: "#5a8f5a",
      parentIndex: null,
      lifespan: "700年以上",
      height: "170–190cm",
      origin: "銀の森",
      language: "古代エルフ語",
      traits: ["長命", "魔力親和"],
      description: "マナに最も近い長命の種族。古い知恵を持つが変化を好まない。",
      relations: [],
    },
    {
      name: "森エルフ",
      symbolColor: "#4a8a5a",
      parentIndex: 1,
      lifespan: "600年以上",
      height: "170–185cm",
      origin: "銀の森の外縁",
      language: "古代エルフ語",
      traits: ["弓術", "隠密"],
      description: "森に根ざしたエルフの分派。弓と偵察に長ける。",
      relations: [{ toIndex: 3, label: "同族" }],
    },
    {
      name: "月エルフ",
      symbolColor: "#8a5cb5",
      parentIndex: 1,
      lifespan: "800年以上",
      height: "168–182cm",
      origin: "月の聖所",
      language: "古代エルフ語",
      traits: ["治癒魔法", "予知"],
      description: "月明かりの下で治癒の術を受け継ぐエルフの分派。",
      relations: [],
    },
    {
      name: "ドワーフ",
      symbolColor: "#c98a2e",
      parentIndex: null,
      lifespan: "約250年",
      height: "130–150cm",
      origin: "霜嶺山脈",
      language: "ドワーフ・ルーン語",
      traits: ["鍛冶", "頑固"],
      description: "山脈の奥深くに鍛冶場を構える種族。ルーンと金属の腕は随一。",
      relations: [{ toIndex: 6, label: "交易" }],
    },
    {
      name: "小人族",
      symbolColor: "#b4533a",
      parentIndex: null,
      lifespan: "約100年",
      height: "95–115cm",
      origin: "交易路の村",
      language: "帝国共通語",
      traits: ["敏捷", "幸運"],
      description: "小さいが素早く人懐こい種族。商団にも都市にも姿がある。",
      relations: [],
    },
    {
      name: "竜人",
      symbolColor: "#4a8a8f",
      parentIndex: null,
      lifespan: "約400年",
      height: "185–205cm",
      origin: "東部火山地帯",
      language: "竜語",
      traits: ["鱗の装甲", "火炎耐性"],
      description: "竜の血を継ぐ種族。鱗と誇りを持ち、傭兵として名高い。",
      relations: [],
    },
  ],
  sampleItems: [
    {
      name: "黎明の剣",
      kind: "武器 · 長剣",
      rarity: "遺物級",
      origin: "大崩壊以前の遺物",
      effects: ["光属性", "呪い浄化"],
      description:
        "セラフィンが受け継いだ儀礼用の長剣。マナが宿ると刃が黎明の光で燃え上がる。",
      parentIndex: null,
      ownerIndex: 0,
      relations: [
        { toIndex: 1, label: "核 · 黎明石" },
        { toIndex: 2, label: "一対" },
      ],
    },
    {
      name: "黎明石",
      kind: "魔法石",
      rarity: "希少",
      origin: "霜の洞",
      effects: ["マナ貯蔵"],
      description: "黎明の剣に嵌める共鳴石の一種。光の力を凝縮する。",
      parentIndex: null,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "黄昏の剣",
      kind: "武器 · 長剣",
      rarity: "遺物級",
      origin: "大崩壊以前の遺物",
      effects: ["闇属性", "生命力吸収"],
      description:
        "黎明の剣と一対をなす黒剣。アルハンが大崩壊の力で蘇らせた。",
      parentIndex: null,
      ownerIndex: 7,
      relations: [{ toIndex: 0, label: "一対" }],
    },
    {
      name: "銀誓約の板金鎧",
      kind: "防具 · 板金",
      rarity: "上級",
      origin: "グリムバルドの鍛冶場",
      effects: ["誓約の加護", "物理軽減"],
      description: "騎士団の精鋭にのみ与えられる一式の鎧。誓約を破ると光を失う。",
      parentIndex: null,
      ownerIndex: 0,
      relations: [{ toIndex: 6, label: "作者 · グリムバルド" }],
    },
    {
      name: "誓約の兜",
      kind: "防具 · 部品",
      rarity: "上級",
      origin: "グリムバルドの鍛冶場",
      effects: ["精神耐性"],
      description: "板金鎧の兜の部分。銀の羽根飾りが付いている。",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "誓約の篭手",
      kind: "防具 · 部品",
      rarity: "上級",
      origin: "グリムバルドの鍛冶場",
      effects: ["握力強化"],
      description: "板金鎧の手首の防具。ルーンが刻まれ剣を離さない。",
      parentIndex: 3,
      ownerIndex: null,
      relations: [],
    },
    {
      name: "星光の長弓",
      kind: "武器 · 弓",
      rarity: "上級",
      origin: "銀の森",
      effects: ["風誘導", "夜間命中"],
      description: "カエルが愛用する森エルフの長弓。弦を放つと星光の軌跡が残る。",
      parentIndex: null,
      ownerIndex: 1,
      relations: [],
    },
    {
      name: "月の聖水",
      kind: "消耗品 · 薬",
      rarity: "一般",
      origin: "月の聖所",
      effects: ["傷の回復", "呪い緩和"],
      description: "リラが月光の下で調合する治癒の薬。皆で分け合って使う。",
      parentIndex: null,
      ownerIndex: 4,
      relations: [],
    },
    {
      name: "ルーン刻印の羅針盤",
      kind: "道具",
      rarity: "希少",
      origin: "放浪商団",
      effects: ["マナ感知", "隠れ家探索"],
      description: "フィオナが盗んだ（あるいは借りた）商団の宝。マナの濃い場所を指す。",
      parentIndex: null,
      ownerIndex: 5,
      relations: [],
    },
    {
      name: "竜鱗の大剣",
      kind: "武器 · 大剣",
      rarity: "上級",
      origin: "東部の火山地帯",
      effects: ["火炎耐性", "貫通"],
      description: "ドラコが己の鱗を鍛えて作った大剣。主の誇りに似ている。",
      parentIndex: null,
      ownerIndex: 6,
      relations: [],
    },
    {
      name: "大崩壊の聖遺物",
      kind: "遺物",
      rarity: "遺物級",
      origin: "黒尖塔の結社",
      effects: ["マナ逆流", "儀式の触媒"],
      description:
        "大崩壊を再現しようとする黒尖塔の中核の聖遺物。モルガナが蘇らせようとする禁忌の遺物。",
      parentIndex: null,
      ownerIndex: 2,
      relations: [{ toIndex: 2, label: "動力源" }],
    },
  ],
  samplePlaces: [
    { name: "アスライ帝国", kind: "帝国", parentIndex: null },
    { name: "帝都ルーメン", kind: "都市", parentIndex: 0 },
    { name: "皇宮", kind: "城塞", parentIndex: 1 },
    { name: "銀の誓い騎士団本部", kind: "建物", parentIndex: 1 },
    { name: "市場区", kind: "区画", parentIndex: 1 },
    { name: "港町マレ", kind: "都市", parentIndex: 0 },
    { name: "霜嶺山脈", kind: "山脈", parentIndex: null },
    { name: "霜の洞", kind: "ダンジョン", parentIndex: 6 },
    { name: "銀の森", kind: "森", parentIndex: null },
  ],
  sampleGlossary: [
    {
      name: "マナ",
      description: "世界に流れる魔法エネルギーの源。あらゆる呪文と刻印の燃料となる。",
    },
    {
      name: "ルーン刻印",
      description: "契約者の体に刻まれる魔法の紋様。大きな力を借りる代償に生命力を求める。",
    },
    {
      name: "共鳴石",
      description: "マナを蓄え増幅する希少な鉱石。霜嶺山脈の奥でのみ採れる。",
    },
    {
      name: "銀の誓い",
      description: "騎士団入団時に立てる誓い。破れば誓いが与えた力を失う。",
    },
    {
      name: "大崩壊",
      description: "千年前に古代魔法文明を滅ぼした災厄。今のマナ枯渇はその余波だ。",
    },
    {
      name: "霜の呪い",
      description: "霜嶺山脈にかかる古い呪い。頂に近づく者の記憶を凍らせ奪う。",
    },
  ],
  sampleChapters: [
    { name: "黎明の章", era: "帝国暦1112年" },
    { name: "亀裂の章", era: "帝国暦1118年" },
    { name: "激動の章", era: "帝国暦1120年" },
  ],
  sampleCharacters: [
    {
      name: "セラフィーヌ",
      fieldValues: ["27", "人間", "女", "168cm", ""],
      personalityTags: ["剛直", "責任感"],
      classTags: ["主人公", "騎士"],
      story:
        "銀の誓い騎士団の若き団長。大崩壊の真実を追い、黒尖塔と対峙する。",
      favorite: true,
      groupIndex: 0,
      raceIndex: 0,
    },
    {
      name: "カエル",
      fieldValues: ["122", "森エルフ", "男", "179cm", ""],
      personalityTags: ["自由奔放", "楽天的"],
      classTags: ["弓手", "仲間"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 2,
    },
    {
      name: "モルガナ",
      fieldValues: ["34", "人間", "女", "170cm", ""],
      personalityTags: ["冷徹", "野心"],
      classTags: ["魔法使い", "敵対"],
      story:
        "黒尖塔結社の才媛。禁じられた知識で失われたマナを蘇らせようとする。",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
    {
      name: "グリムバルド",
      fieldValues: ["168", "ドワーフ", "男", "141cm", ""],
      personalityTags: ["実直", "頑固"],
      classTags: ["鍛冶師"],
      story: "",
      favorite: false,
      groupIndex: 0,
      raceIndex: 4,
    },
    {
      name: "リラ",
      fieldValues: ["88", "月エルフ", "女", "172cm", ""],
      personalityTags: ["穏やか", "優しい"],
      classTags: ["治癒師", "仲間"],
      story:
        "月の聖所から来た治癒師。霜の呪いに奪われた自分の名を探している。",
      favorite: true,
      groupIndex: 3,
      raceIndex: 3,
    },
    {
      name: "フィオナ",
      fieldValues: ["29", "小人族", "女", "108cm", ""],
      personalityTags: ["快活", "抜け目なさ"],
      classTags: ["盗賊", "仲間"],
      story: "",
      favorite: false,
      groupIndex: 1,
      raceIndex: 5,
    },
    {
      name: "ドラコ",
      fieldValues: ["45", "竜人", "男", "195cm", ""],
      personalityTags: ["寡黙", "誇り"],
      classTags: ["傭兵"],
      story: "",
      favorite: false,
      groupIndex: null,
      raceIndex: 6,
    },
    {
      name: "アルハン",
      fieldValues: ["51", "人間", "男", "182cm", ""],
      personalityTags: ["狡猾", "冷酷"],
      classTags: ["黒幕", "敵対"],
      story:
        "黒尖塔結社を率いる大魔法使い。大崩壊を再現し世界を書き換えようとする。",
      favorite: false,
      groupIndex: 2,
      raceIndex: 0,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 4, label: "戦友" },
    { fromIndex: 0, toIndex: 3, label: "仲間" },
    { fromIndex: 0, toIndex: 2, label: "宿敵" },
    { fromIndex: 1, toIndex: 5, label: "相棒" },
    { fromIndex: 2, toIndex: 7, label: "師" },
  ],
  sampleEvents: [
    {
      title: "セラフィーヌ、銀の誓いを立てる",
      when: "1112年 春",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 3,
      description: "幼いセラフィーヌが騎士団に入団し、銀の誓いを立てる。",
      participants: [{ characterIndex: 0, role: "誓約者" }],
    },
    {
      title: "放浪商団との同行",
      when: "1114年 夏",
      chapterIndex: 0,
      ownerIndex: null,
      placeIndex: 4,
      description: "護衛任務の中でセラフィーヌがカエル・フィオナと出会う。",
      participants: [
        { characterIndex: 0, role: "護衛" },
        { characterIndex: 1, role: "案内" },
        { characterIndex: 5, role: "偵察" },
      ],
    },
    {
      title: "黒尖塔の襲撃",
      when: "1118年 夏",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 1,
      description: "モルガナが率いる黒尖塔が帝都を襲撃する。",
      participants: [
        { characterIndex: 2, role: "襲撃" },
        { characterIndex: 0, role: "防衛" },
        { characterIndex: 1, role: "支援" },
      ],
    },
    {
      title: "霜の洞への遠征",
      when: "1119年 冬",
      chapterIndex: 1,
      ownerIndex: null,
      placeIndex: 7,
      description: "共鳴石を求めて霜の洞の奥へ向かう。",
      participants: [
        { characterIndex: 0, role: "隊長" },
        { characterIndex: 3, role: "採掘" },
        { characterIndex: 4, role: "治癒" },
        { characterIndex: 6, role: "護衛" },
      ],
    },
    {
      title: "帝都攻防戦",
      when: "1120年 春",
      chapterIndex: 2,
      ownerIndex: null,
      placeIndex: 2,
      description: "アルハンが大崩壊の儀式を始め、騎士団が皇宮で迎え撃つ。",
      participants: [
        { characterIndex: 0, role: "指揮" },
        { characterIndex: 7, role: "敵将" },
        { characterIndex: 2, role: "執行" },
        { characterIndex: 6, role: "傭兵" },
      ],
    },
    {
      title: "リラ、失われた名を取り戻す",
      when: "1120年 夏",
      chapterIndex: 2,
      ownerIndex: 4,
      placeIndex: null,
      description: "リラが霜の呪いを解き、封じられた自分の名を取り戻す。",
      participants: [{ characterIndex: 4, role: "本人" }],
    },
    {
      title: "さまよう伝説：竜の帰還",
      when: "時期不明",
      chapterIndex: null,
      ownerIndex: null,
      placeIndex: 8,
      description: "銀の森に竜人の始祖が帰るという噂が広まる。",
      participants: [{ characterIndex: 6, role: "伝説の主" }],
    },
  ],
};

const SEED: Record<Locale, SeedContent> = { ko, en, ja };

export function getSeedContent(locale: Locale): SeedContent {
  return SEED[locale];
}
