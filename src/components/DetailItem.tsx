"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dispatchCommand } from "@/store/worldviewStore";

// 상세 화면의 재정렬 가능한 항목 하나를 감싼다 — 왼쪽 위/아래 버튼으로 순서를 바꾸고,
// 오른쪽에 항목 본문을 둔다. 순서는 reorder-detail-item 커맨드로 세계관에 저장된다.
export function DetailItem({
  layoutId,
  itemKey,
  index,
  total,
  className,
  children,
}: {
  layoutId: string;
  itemKey: string;
  index: number;
  total: number;
  className?: string;
  children: ReactNode;
}) {
  const t = useTranslations();
  const move = (targetIndex: number) =>
    dispatchCommand({
      type: "reorder-detail-item",
      layoutId,
      itemKey,
      targetIndex,
    });

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex shrink-0 flex-col pt-0.5">
        <button
          aria-label={t("settings.moveUp")}
          disabled={index === 0}
          className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
          onClick={() => move(index - 1)}
        >
          <ChevronUp size={16} aria-hidden="true" />
        </button>
        <button
          aria-label={t("settings.moveDown")}
          disabled={index === total - 1}
          className="rounded p-1 text-muted hover:text-ink disabled:opacity-30"
          onClick={() => move(index + 1)}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
