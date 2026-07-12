"use client";

import { Menu, Search } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldSidebar, type WorldSection } from "@/components/WorldSidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { worldviewDisplayName } from "@/core/model";
import { useWorldviewStore } from "@/react/useWorldviewStore";

// 세계관 내부 화면 공용 셸 — 데스크탑 고정 사이드바 + 모바일 드로어 + 전역 검색.
// 로드 가드(missing 등)는 각 PageClient가 담당하고, 셸은 레이아웃과 내비만 맡는다.
export function WorldShell({
  active,
  worldviewId,
  children,
}: {
  active: WorldSection;
  worldviewId: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const worldview = useWorldviewStore((state) => state.worldview);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const worldviewName = worldview
    ? worldviewDisplayName(worldview, locale) || "-"
    : "-";

  return (
    <div className="lg:flex lg:items-start">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 border-r border-line bg-ground lg:block">
        <WorldSidebar
          active={active}
          worldviewId={worldviewId}
          onOpenSearch={() => setSearchOpen(true)}
        />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-ground/90 px-2 py-2 backdrop-blur lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              aria-label={t("nav.openMenu")}
              className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
            >
              <Menu size={20} aria-hidden="true" />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">{worldviewName}</SheetTitle>
              <WorldSidebar
                active={active}
                worldviewId={worldviewId}
                onOpenSearch={() => {
                  setDrawerOpen(false);
                  setSearchOpen(true);
                }}
                onNavigate={() => setDrawerOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <span className="min-w-0 flex-1 truncate px-1 font-bold">
            {worldviewName}
          </span>
          <SavedIndicator />
          <button
            aria-label={t("nav.search")}
            className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        worldviewId={worldviewId}
      />
    </div>
  );
}
