"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { UpdateKindBadge } from "@/components/UpdateKindBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocale, useTranslations } from "next-intl";
import { latestReleaseVersion, releaseNotes } from "@/core/updates";
import { updatesHref } from "@/react/links";
import { useSeenRelease } from "@/react/useSeenRelease";

export function UpdatesBell() {
  const locale = useLocale();
  const t = useTranslations();
  const { hasUnseen, markSeen } = useSeenRelease();

  const kindLabels = {
    new: t("updates.kindNew"),
    improve: t("updates.kindImprove"),
    fix: t("updates.kindFix"),
  } as const;
  const entryText = (id: string) =>
    t(`updates.entryText.${id}` as Parameters<typeof t>[0]);
  const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(
      new Date(isoDate),
    );

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) markSeen();
      }}
    >
      <PopoverTrigger
        aria-label={t("updates.popoverTitle")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-hover text-muted outline-none hover:text-ink"
      >
        <Bell size={17} aria-hidden="true" />
        {hasUnseen && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-ground bg-danger" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center border-b border-line px-4 py-3">
          <span className="text-base font-extrabold">
            {t("updates.popoverTitle")}
          </span>
          <span className="ml-auto text-xs text-muted">
            {t("updates.currentVersion", { version: latestReleaseVersion })}
          </span>
        </div>
        <div className="max-h-72 overflow-auto p-1.5">
          {releaseNotes.map((release) => (
            <div key={release.version} className="rounded-lg px-2.5 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-extrabold">
                  {release.version}
                </span>
                <span className="ml-auto text-xs text-muted">
                  {formatDate(release.date)}
                </span>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {release.entries.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2 text-sm">
                    <UpdateKindBadge
                      kind={entry.kind}
                      label={kindLabels[entry.kind]}
                    />
                    <span>{entryText(entry.id)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-4 py-2.5 text-center">
          <Link
            href={updatesHref(locale)}
            className="text-sm font-bold text-accent hover:underline"
          >
            {t("updates.viewAll")} ›
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
