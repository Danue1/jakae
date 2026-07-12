"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ListView = "gallery" | "table";

// 목록 표시 방식(갤러리/표) — 뷰 상태이므로 URL 검색 파라미터(`list`)에 싣는다.
// 현재 경로의 다른 파라미터(필터·대상 id 등)는 그대로 보존한다. 기본값이면 파라미터를 지운다.
export function useListView(defaultView: ListView = "gallery"): {
  view: ListView;
  setView: (view: ListView) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("list");
  const view: ListView = raw === "table" || raw === "gallery" ? raw : defaultView;

  const setView = (next: ListView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultView) params.delete("list");
    else params.set("list", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return { view, setView };
}
