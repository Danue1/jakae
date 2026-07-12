import { type Locale } from "./config";

export interface SampleCharacterSeed {
  name: string;
  fieldValues: string[];
  tags: string[];
  story: string;
  favorite: boolean;
  groupIndex: 0 | 1 | null;
}

export interface SampleRelationSeed {
  fromIndex: number;
  toIndex: number;
  label: string;
}

export interface SeedContent {
  fieldLabels: string[];
  sampleWorldviewName: string;
  sampleEra: string;
  sampleGroups: [string, string];
  sampleCharacters: SampleCharacterSeed[];
  sampleRelations: SampleRelationSeed[];
}

const ko: SeedContent = {
  fieldLabels: ["나이", "종족", "성별", "신장", "체중"],
  sampleWorldviewName: "어쩌구 우주",
  sampleEra: "2020",
  sampleGroups: ["우주선 크루", "마을 사람들"],
  sampleCharacters: [
    {
      name: "가가",
      fieldValues: ["15", "인간", "", "159cm", ""],
      tags: ["조용함", "어른스러움", "친절함", "말수 적음"],
      story:
        "우주선 나팔호의 막내 승무원. 어릴 때 호호할머니 손에서 자랐고, 지금은 함내의 고양이 고영희를 모시는 집사 역할을 자처하고 있다.",
      favorite: true,
      groupIndex: 0,
    },
    {
      name: "고영희",
      fieldValues: ["2", "고양이", "", "", ""],
      tags: ["도도함", "낮잠"],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "구구",
      fieldValues: ["99", "비둘기", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "뫄뫄",
      fieldValues: ["", "", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: null,
    },
    {
      name: "호호할머니",
      fieldValues: ["72", "인간", "", "", ""],
      tags: ["호탕함"],
      story: "",
      favorite: true,
      groupIndex: 1,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 1, label: "집사" },
    { fromIndex: 0, toIndex: 4, label: "손자" },
  ],
};

const en: SeedContent = {
  fieldLabels: ["Age", "Species", "Gender", "Height", "Weight"],
  sampleWorldviewName: "Whatever Universe",
  sampleEra: "2020",
  sampleGroups: ["Spaceship crew", "Villagers"],
  sampleCharacters: [
    {
      name: "Gaga",
      fieldValues: ["15", "Human", "", "159cm", ""],
      tags: ["Quiet", "Mature", "Kind", "Few words"],
      story:
        "The youngest crew member of the spaceship Trumpet. Raised by Granny Hoho, and now a self-appointed butler to Meowie, the ship's cat.",
      favorite: true,
      groupIndex: 0,
    },
    {
      name: "Meowie",
      fieldValues: ["2", "Cat", "", "", ""],
      tags: ["Aloof", "Naps"],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "Coocoo",
      fieldValues: ["99", "Pigeon", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "Momo",
      fieldValues: ["", "", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: null,
    },
    {
      name: "Granny Hoho",
      fieldValues: ["72", "Human", "", "", ""],
      tags: ["Hearty"],
      story: "",
      favorite: true,
      groupIndex: 1,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 1, label: "butler" },
    { fromIndex: 0, toIndex: 4, label: "grandson" },
  ],
};

const ja: SeedContent = {
  fieldLabels: ["年齢", "種族", "性別", "身長", "体重"],
  sampleWorldviewName: "なんとか宇宙",
  sampleEra: "2020",
  sampleGroups: ["宇宙船クルー", "村のひとたち"],
  sampleCharacters: [
    {
      name: "ガガ",
      fieldValues: ["15", "人間", "", "159cm", ""],
      tags: ["物静か", "大人びている", "親切", "口数少なめ"],
      story:
        "宇宙船ラッパ号の最年少クルー。幼いころホホばあちゃんに育てられ、いまは船内の猫ミーちゃんの執事を自任している。",
      favorite: true,
      groupIndex: 0,
    },
    {
      name: "ミーちゃん",
      fieldValues: ["2", "猫", "", "", ""],
      tags: ["ツンとしている", "お昼寝"],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "クック",
      fieldValues: ["99", "ハト", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: 0,
    },
    {
      name: "モワモワ",
      fieldValues: ["", "", "", "", ""],
      tags: [],
      story: "",
      favorite: false,
      groupIndex: null,
    },
    {
      name: "ホホばあちゃん",
      fieldValues: ["72", "人間", "", "", ""],
      tags: ["豪快"],
      story: "",
      favorite: true,
      groupIndex: 1,
    },
  ],
  sampleRelations: [
    { fromIndex: 0, toIndex: 1, label: "執事" },
    { fromIndex: 0, toIndex: 4, label: "孫" },
  ],
};

const SEED: Record<Locale, SeedContent> = { ko, en, ja };

export function getSeedContent(locale: Locale): SeedContent {
  return SEED[locale];
}
