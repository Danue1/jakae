import { defaultViewState, type ViewName, type ViewState } from "../core/selectors";
import type { Locale } from "../locales";

const VIEW_NAMES: ViewName[] = ["all", "favorites", "trash"];

export function libraryHref(locale: Locale): string {
  return `/${locale}/`;
}

export function updatesHref(locale: Locale): string {
  return `/${locale}/updates/`;
}

export function worldHref(
  locale: Locale,
  worldviewId: string,
  viewState?: ViewState,
): string {
  const searchParams = new URLSearchParams({ w: worldviewId });
  if (viewState) {
    if (viewState.view !== defaultViewState.view)
      searchParams.set("view", viewState.view);
    if (viewState.groupId !== null) searchParams.set("group", viewState.groupId);
    if (viewState.query) searchParams.set("q", viewState.query);
  }
  return `/${locale}/world/?${searchParams.toString()}`;
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
    query: searchParams.get("q") ?? "",
  };
}
