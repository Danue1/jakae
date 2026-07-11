"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "../react/localeContext";
import { useWorldviewStore } from "../react/useWorldviewStore";
import { flushWorldviewSaves } from "../store/worldviewStore";

export function SavedIndicator() {
  const { dictionary } = useLocale();
  const saveState = useWorldviewStore((state) => state.saveState);

  if (saveState === "saved")
    return (
      <span className="text-xs font-semibold text-accent">
        {dictionary.common.saved}
      </span>
    );
  if (saveState === "saving")
    return <span className="text-xs text-muted">{dictionary.common.saving}</span>;
  if (saveState === "error")
    return (
      <Button variant="danger" size="sm" onClick={() => void flushWorldviewSaves()}>
        {dictionary.common.saveFailedRetry}
      </Button>
    );
  return null;
}
