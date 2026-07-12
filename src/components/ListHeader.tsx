"use client";

import { LayoutGrid, List, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SavedIndicator } from "@/components/SavedIndicator";
import { cn } from "@/lib/utils";
import type { ListView } from "@/react/useListView";

export function ListViewToggle({
  view,
  onChange,
}: {
  view: ListView;
  onChange: (view: ListView) => void;
}) {
  const t = useTranslations();
  const options: { value: ListView; icon: LucideIcon; label: string }[] = [
    { value: "gallery", icon: LayoutGrid, label: t("list.viewGallery") },
    { value: "table", icon: List, label: t("list.viewTable") },
  ];
  return (
    <div className="flex gap-0.5 rounded-lg bg-hover p-0.5">
      {options.map((option) => {
        const Icon = option.icon;
        const on = view === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={on}
            className={cn(
              "flex items-center rounded-md px-2.5 py-1.5",
              on
                ? "border border-line bg-ground text-ink"
                : "text-muted hover:text-ink",
            )}
            onClick={() => onChange(option.value)}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

// 목록 화면 공통 헤더 — 아이콘 타일 + 제목 + (우측) 저장표시 · 뷰 토글 · 추가/부가 컨트롤.
export function ListHeader({
  icon: Icon,
  title,
  view,
  onViewChange,
  trailing,
}: {
  icon: LucideIcon;
  title: string;
  view?: ListView;
  onViewChange?: (view: ListView) => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        <Icon size={17} aria-hidden="true" />
      </span>
      <h1 className="truncate text-xl font-extrabold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden lg:block">
          <SavedIndicator />
        </span>
        {view && onViewChange && (
          <ListViewToggle view={view} onChange={onViewChange} />
        )}
        {trailing}
      </div>
    </div>
  );
}
