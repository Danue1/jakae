import { defaultViewState, type ViewName, type ViewState } from "../core/selectors";
import type { Locale } from "../locales";

const VIEW_NAMES: ViewName[] = ["all", "favorites", "trash"];

export function libraryHref(locale: Locale): string {
  return `/${locale}/`;
}

export function updatesHref(locale: Locale): string {
  return `/${locale}/updates/`;
}

export function aboutHref(locale: Locale): string {
  return `/${locale}/about/`;
}

// 세계관 개요 홈 — 진입 기본 화면. 뷰 파라미터를 갖지 않는다.
export function worldHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/world/?w=${worldviewId}`;
}

// 자캐 그리드 — 필터·검색·태그·휴지통 뷰 상태를 쿼리로 실어 나른다.
export function charactersHref(
  locale: Locale,
  worldviewId: string,
  viewState?: ViewState,
): string {
  const searchParams = new URLSearchParams({ w: worldviewId });
  if (viewState) {
    if (viewState.view !== defaultViewState.view)
      searchParams.set("view", viewState.view);
    if (viewState.groupId !== null) searchParams.set("group", viewState.groupId);
    if (viewState.tag !== null) searchParams.set("tag", viewState.tag);
    if (viewState.query) searchParams.set("q", viewState.query);
  }
  return `/${locale}/characters/?${searchParams.toString()}`;
}

export function characterHref(
  locale: Locale,
  worldviewId: string,
  characterId: string,
): string {
  return `/${locale}/character/?w=${worldviewId}&ch=${characterId}`;
}

export function settingsHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/settings/?w=${worldviewId}`;
}

export function timelineHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/timeline/?w=${worldviewId}`;
}

export function organizationListHref(
  locale: Locale,
  worldviewId: string,
): string {
  return `/${locale}/organization/?w=${worldviewId}`;
}

export function organizationHref(
  locale: Locale,
  worldviewId: string,
  organizationId: string,
): string {
  return `/${locale}/organization/?w=${worldviewId}&o=${organizationId}`;
}

export function placeListHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/place/?w=${worldviewId}`;
}

export function placeHref(
  locale: Locale,
  worldviewId: string,
  placeId: string,
): string {
  return `/${locale}/place/?w=${worldviewId}&p=${placeId}`;
}

export function raceListHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/race/?w=${worldviewId}`;
}

export function raceHref(
  locale: Locale,
  worldviewId: string,
  raceId: string,
): string {
  return `/${locale}/race/?w=${worldviewId}&r=${raceId}`;
}

export function glossaryListHref(locale: Locale, worldviewId: string): string {
  return `/${locale}/glossary/?w=${worldviewId}`;
}

export function glossaryHref(
  locale: Locale,
  worldviewId: string,
  termId: string,
): string {
  return `/${locale}/glossary/?w=${worldviewId}&g=${termId}`;
}

// 앱 환경설정 — 세계관과 무관한 앱 수준 화면.
export function preferencesHref(locale: Locale): string {
  return `/${locale}/preferences/`;
}

export function chapterHref(
  locale: Locale,
  worldviewId: string,
  chapterId: string,
): string {
  return `/${locale}/chapter/?w=${worldviewId}&c=${chapterId}`;
}

export function eventHref(
  locale: Locale,
  worldviewId: string,
  eventId: string,
): string {
  return `/${locale}/event/?w=${worldviewId}&e=${eventId}`;
}

interface SearchParamsReader {
  get(name: string): string | null;
}

export function parseViewState(searchParams: SearchParamsReader): ViewState {
  const view = searchParams.get("view");
  return {
    view: VIEW_NAMES.includes(view as ViewName)
      ? (view as ViewName)
      : defaultViewState.view,
    groupId: searchParams.get("group"),
    tag: searchParams.get("tag"),
    query: searchParams.get("q") ?? "",
  };
}
