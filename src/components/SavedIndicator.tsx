"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useWorldviewStore } from "../react/useWorldviewStore";
import { flushWorldviewSaves } from "../store/worldviewStore";

export function SavedIndicator() {
  const t = useTranslations();
  const saveState = useWorldviewStore((state) => state.saveState);

  if (saveState === "saved")
    return (
      <span className="text-xs font-semibold text-accent">
        {t("common.saved")}
      </span>
    );
  if (saveState === "saving")
    return <span className="text-xs text-muted">{t("common.saving")}</span>;
  if (saveState === "error")
    return (
      <Button variant="danger" size="sm" onClick={() => void flushWorldviewSaves()}>
        {t("common.saveFailedRetry")}
      </Button>
    );
  return null;
}
