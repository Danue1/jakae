import { describe, expect, it } from "vitest";
import { applyCommand, type WorldviewState } from "./commands";
import {
  createCharacter,
  createChapter,
  createTimelineEvent,
  createWorldview,
} from "./model";
import {
  eventMoveTargetIndex,
  selectCharacterTimeline,
  selectWorldTimeline,
} from "./selectors";

const SEED_DEFAULTS = {
  fieldLabels: ["나이", "종족"],
};

function buildState(): {
  state: WorldviewState;
  gagaId: string;
  hohoId: string;
} {
  const worldview = createWorldview("어쩌구 우주", SEED_DEFAULTS, "ko", "2020", 1000);
  const gaga = createCharacter(worldview.id, "가가", 1000);
  const hoho = createCharacter(worldview.id, "호호할머니", 1000);
  return {
    state: { worldview, characters: [gaga, hoho] },
    gagaId: gaga.id,
    hohoId: hoho.id,
  };
}

describe("타임라인 커맨드", () => {
  it("add-event / remove-event가 역커맨드로 정확히 복원된다", () => {
    const { state } = buildState();
    const event = createTimelineEvent({ chapterId: null });
    const added = applyCommand(state, { type: "add-event", event }, 2000);
    expect(added.state.worldview.events).toHaveLength(1);
    expect(added.dirty).toEqual({ worldview: true });

    const removed = applyCommand(added.state, added.inverse, 3000);
    expect(removed.state.worldview.events).toHaveLength(0);
  });

  it("set-event-title은 기본 언어가 아니면 번역 슬롯에 기록되고 폴백된다", () => {
    const { state } = buildState();
    const event = createTimelineEvent({ chapterId: null });
    let next = applyCommand(state, { type: "add-event", event }, 2000).state;
    next = applyCommand(
      next,
      { type: "set-event-title", eventId: event.id, title: "출항", locale: "ko" },
      2100,
    ).state;
    const applied = applyCommand(
      next,
      { type: "set-event-title", eventId: event.id, title: "Departure", locale: "en" },
      2200,
    );
    const stored = applied.state.worldview.events[0];
    expect(stored?.title).toBe("출항");
    expect(stored?.titleTranslations).toEqual({ en: "Departure" });

    const undone = applyCommand(applied.state, applied.inverse, 2300);
    expect(undone.state.worldview.events[0]?.titleTranslations).toEqual({});
  });

  it("remove-chapter는 소속 사건을 미분류로 옮기고 restore로 되돌린다", () => {
    const { state } = buildState();
    const chapter = createChapter("2막");
    let next = applyCommand(state, { type: "add-chapter", chapter }, 2000).state;
    const event = createTimelineEvent({ chapterId: chapter.id });
    next = applyCommand(next, { type: "add-event", event }, 2100).state;

    const removed = applyCommand(
      next,
      { type: "remove-chapter", chapterId: chapter.id },
      2200,
    );
    expect(removed.state.worldview.chapters).toHaveLength(0);
    expect(removed.state.worldview.events[0]?.chapterId).toBeNull();

    const restored = applyCommand(removed.state, removed.inverse, 2300);
    expect(restored.state.worldview.chapters).toHaveLength(1);
    expect(restored.state.worldview.events[0]?.chapterId).toBe(chapter.id);
  });

  it("move-event는 배열 순서를 바꾸고 역커맨드로 원위치된다", () => {
    const { state } = buildState();
    const first = createTimelineEvent({ chapterId: null });
    const second = createTimelineEvent({ chapterId: null });
    let next = applyCommand(state, { type: "add-event", event: first }, 2000).state;
    next = applyCommand(next, { type: "add-event", event: second }, 2100).state;

    const moved = applyCommand(
      next,
      { type: "move-event", eventId: second.id, targetIndex: 0 },
      2200,
    );
    expect(moved.state.worldview.events.map((event) => event.id)).toEqual([
      second.id,
      first.id,
    ]);

    const undone = applyCommand(moved.state, moved.inverse, 2300);
    expect(undone.state.worldview.events.map((event) => event.id)).toEqual([
      first.id,
      second.id,
    ]);
  });

  it("자캐 영구 삭제 시 개인 사건은 통째로, 참여자는 제거되고 복원으로 되돌아온다", () => {
    const { state, gagaId, hohoId } = buildState();
    const worldEvent = createTimelineEvent({ chapterId: null });
    worldEvent.participants = [
      { characterId: gagaId, role: "주역" },
      { characterId: hohoId, role: "배웅" },
    ];
    const personalEvent = createTimelineEvent({ ownerCharacterId: gagaId });
    let next = applyCommand(state, { type: "add-event", event: worldEvent }, 2000)
      .state;
    next = applyCommand(next, { type: "add-event", event: personalEvent }, 2100)
      .state;

    const deleted = applyCommand(
      next,
      { type: "delete-character-permanently", characterId: gagaId },
      2200,
    );
    expect(deleted.state.characters).toHaveLength(1);
    expect(deleted.state.worldview.events).toHaveLength(1);
    expect(deleted.state.worldview.events[0]?.participants).toEqual([
      { characterId: hohoId, role: "배웅" },
    ]);
    expect(deleted.dirty.worldview).toBe(true);

    const restored = applyCommand(deleted.state, deleted.inverse, 2300);
    expect(restored.state.characters).toHaveLength(2);
    expect(restored.state.worldview.events).toHaveLength(2);
    const restoredWorldEvent = restored.state.worldview.events.find(
      (event) => event.id === worldEvent.id,
    );
    expect(restoredWorldEvent?.participants).toEqual([
      { characterId: gagaId, role: "주역" },
      { characterId: hohoId, role: "배웅" },
    ]);
    expect(
      restored.state.worldview.events.some(
        (event) => event.id === personalEvent.id,
      ),
    ).toBe(true);
  });
});

describe("타임라인 selector", () => {
  it("selectWorldTimeline은 개인 사건도 포함해 구간별로 묶으며 미분류를 마지막에 둔다", () => {
    const { state, gagaId } = buildState();
    const chapter = createChapter("1막");
    let worldview = applyCommand(state, { type: "add-chapter", chapter }, 2000)
      .state.worldview;
    const chaptered = createTimelineEvent({ chapterId: chapter.id });
    const personalInChapter = createTimelineEvent({
      chapterId: chapter.id,
      ownerCharacterId: gagaId,
    });
    const loose = createTimelineEvent({ chapterId: null });
    const personalLoose = createTimelineEvent({ ownerCharacterId: gagaId });
    for (const event of [chaptered, personalInChapter, loose, personalLoose]) {
      worldview = applyCommand(
        { worldview, characters: state.characters },
        { type: "add-event", event },
        2100,
      ).state.worldview;
    }

    const groups = selectWorldTimeline(worldview);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.chapter?.id).toBe(chapter.id);
    expect(groups[0]?.events.map((event) => event.id)).toEqual([
      chaptered.id,
      personalInChapter.id,
    ]);
    expect(groups[1]?.chapter).toBeNull();
    expect(groups[1]?.events.map((event) => event.id)).toEqual([
      loose.id,
      personalLoose.id,
    ]);
  });

  it("selectCharacterTimeline은 참여한 세계관 사건과 소유한 개인 사건을 모은다", () => {
    const { state, gagaId, hohoId } = buildState();
    const participated = createTimelineEvent({ chapterId: null });
    participated.participants = [{ characterId: gagaId, role: "" }];
    const personal = createTimelineEvent({ ownerCharacterId: gagaId });
    const other = createTimelineEvent({ chapterId: null });
    other.participants = [{ characterId: hohoId, role: "" }];
    let worldview = state.worldview;
    for (const event of [participated, personal, other]) {
      worldview = applyCommand(
        { worldview, characters: state.characters },
        { type: "add-event", event },
        2100,
      ).state.worldview;
    }

    const timeline = selectCharacterTimeline(worldview, gagaId);
    expect(timeline.map((event) => event.id)).toEqual([
      participated.id,
      personal.id,
    ]);
  });

  it("eventMoveTargetIndex는 형제 안에서 인접 사건과 자리를 바꾸는 전역 인덱스를 준다", () => {
    const a = createTimelineEvent({ chapterId: null });
    const chaptered = createTimelineEvent({ chapterId: "c1" });
    const b = createTimelineEvent({ chapterId: null });
    const events = [a, chaptered, b];
    const siblings = [a, b];
    // b를 위로 → a 앞(전역 인덱스 0)
    expect(eventMoveTargetIndex(events, siblings, b.id, -1)).toBe(0);
    // a를 아래로 → b 뒤. b는 원소 제거 배열 [chaptered, b]에서 인덱스 1 → +1 = 2
    expect(eventMoveTargetIndex(events, siblings, a.id, 1)).toBe(2);
    // 경계 밖은 null
    expect(eventMoveTargetIndex(events, siblings, a.id, -1)).toBeNull();
    expect(eventMoveTargetIndex(events, siblings, b.id, 1)).toBeNull();
  });
});

describe("set-event-owner (개인↔세계관 전환)", () => {
  it("개인 사건을 세계관 사건으로 바꾸고 역커맨드로 되돌린다", () => {
    const { state, gagaId } = buildState();
    const event = createTimelineEvent({ ownerCharacterId: gagaId });
    const next = applyCommand(state, { type: "add-event", event }, 2000).state;

    const applied = applyCommand(
      next,
      { type: "set-event-owner", eventId: event.id, ownerCharacterId: null },
      2100,
    );
    expect(applied.state.worldview.events[0]?.ownerCharacterId).toBeNull();
    expect(applied.dirty).toEqual({ worldview: true });

    const undone = applyCommand(applied.state, applied.inverse, 2200);
    expect(undone.state.worldview.events[0]?.ownerCharacterId).toBe(gagaId);
  });
});
