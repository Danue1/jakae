// 상세 화면의 재정렬 가능한 항목 순서 — 레이아웃 그룹(layoutId)마다 기본 항목 키 배열을 둔다.
// 이름 헤더(항상 최상단)·삭제 버튼(항상 최하단)·캐릭터 이미지/배경은 재정렬 대상이 아니라 여기 없다.
// 캐릭터만 데스크탑 2컬럼이라 main·aside 두 그룹으로 나눠 컬럼별로 순서를 관리한다.
export const DETAIL_LAYOUTS: Record<string, string[]> = {
  "character-main": ["profile", "palette"],
  "character-aside": [
    "personality",
    "tags",
    "quotes",
    "story",
    "relations",
    "timeline",
  ],
  event: [
    "when",
    "chapter",
    "owner",
    "place",
    "description",
    "participants",
    "references",
  ],
  // subplaces·events-here는 자동 파생 내비게이션(내용 없으면 미표시)이라 재정렬 대상이 아니라 하단 고정.
  place: ["kind", "parent", "description", "references"],
  organization: ["description", "references"],
  race: [
    "symbol",
    "parent",
    "lifespan",
    "height",
    "origin",
    "language",
    "traits",
    "description",
    "references",
    "relations",
  ],
  chapter: ["era", "description", "events", "references"],
  glossary: ["description", "references"],
  // 아이템만 캐릭터처럼 데스크탑 2컬럼이라 main(이미지 곁 팔레트)·aside(속성·관계) 두 그룹으로 나눈다.
  "item-main": ["palette"],
  "item-aside": [
    "kind",
    "rarity",
    "origin",
    "parent",
    "effects",
    "description",
    "references",
    "relations",
  ],
};

// 저장된 순서를 유효 키만 남기고, 기본 키 중 빠진 것을 기본 순서대로 뒤에 덧붙인다.
// 항목이 추가·삭제되어도(스키마 진화) 저장값과 무관하게 안정적으로 전체 항목을 반환한다.
export function orderedDetailKeys(
  defaultKeys: string[] | undefined,
  stored: string[] | undefined,
): string[] {
  const keys = defaultKeys ?? [];
  const allowed = new Set(keys);
  const kept = (stored ?? []).filter((key) => allowed.has(key));
  const seen = new Set(kept);
  const appended = keys.filter((key) => !seen.has(key));
  return [...kept, ...appended];
}
