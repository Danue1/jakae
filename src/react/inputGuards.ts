import type { KeyboardEvent } from "react";

type KeyHandlerMap = Record<string, (event: KeyboardEvent<HTMLElement>) => void>;

// 한글 IME 조합 중의 키 입력은 무시한다 — 조합 확정 Enter가 액션으로 새는 것을 방지.
export function guardedKeyDownHandler(handlers: KeyHandlerMap) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing) return;
    const handler = handlers[event.key];
    if (handler) handler(event);
  };
}
