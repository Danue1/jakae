"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleTabs } from "@/components/LocaleTabs";
import { MissingWorldview } from "@/components/MissingWorldview";
import { SavedIndicator } from "@/components/SavedIndicator";
import { WorldShell } from "@/components/WorldShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPlace,
  eventDisplayTitle,
  placeDisplayName,
  type Place,
} from "@/core/model";
import {
  selectChildPlaces,
  selectPlaceEvents,
  selectRootPlaces,
} from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import { eventHref, placeHref, placeListHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

const NO_PARENT = "__none__";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function PlacePageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const placeId = searchParams.get("p");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState<Place | null>(null);

  const place = worldview?.places.find((existing) => existing.id === placeId);
  const placeMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    placeId !== null &&
    !place;

  useEffect(() => {
    if (placeMissing && worldviewId) {
      router.replace(placeListHref(locale, worldviewId));
    }
  }, [placeMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addPlace = () => {
    const created = createPlace();
    dispatchCommand({ type: "add-place", place: created });
    router.push(placeHref(locale, worldview.id, created.id));
  };

  // ── 상세 ──
  if (placeId && place) {
    const childPlaces = selectChildPlaces(worldview, place.id);
    const placeEvents = selectPlaceEvents(worldview, place.id);
    const parentCandidates = worldview.places.filter(
      (candidate) => candidate.id !== place.id,
    );

    return (
      <WorldShell active="places" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href={placeListHref(locale, worldview.id)}
            className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
          >
            <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{t("place.tab")}</span>
          </Link>
          <span className="ml-auto hidden lg:block">
            <SavedIndicator />
          </span>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Input
            className="text-2xl font-extrabold tracking-tight"
            placeholder={
              nameLocale !== worldview.primaryLocale
                ? place.name || t("place.namePlaceholder")
                : t("place.namePlaceholder")
            }
            value={
              nameLocale !== worldview.primaryLocale
                ? (place.nameTranslations[nameLocale] ?? "")
                : place.name
            }
            onChange={(event) =>
              dispatchCommand({
                type: "rename-place",
                placeId: place.id,
                name: event.target.value,
                locale: nameLocale,
              })
            }
          />
          <LocaleTabs
            value={nameLocale}
            onChange={setNameLocale}
            filledLocales={LOCALES.filter((availableLocale) =>
              availableLocale === worldview.primaryLocale
                ? Boolean(place.name)
                : Boolean(place.nameTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-20 shrink-0 text-sm text-muted">
            {t("place.kindLabel")}
          </span>
          <Input
            placeholder={t("settings.placeKindPlaceholder")}
            value={place.kind}
            onChange={(event) =>
              dispatchCommand({
                type: "set-place-kind",
                placeId: place.id,
                kind: event.target.value,
              })
            }
          />
        </div>
        <div className="flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-20 shrink-0 text-sm text-muted">
            {t("settings.placeParentLabel")}
          </span>
          <Select
            value={place.parentId ?? NO_PARENT}
            onValueChange={(value) =>
              dispatchCommand({
                type: "set-place-parent",
                placeId: place.id,
                parentId: value === NO_PARENT ? null : value,
              })
            }
          >
            <SelectTrigger className="bg-hover">
              <SelectValue placeholder={t("settings.placeParentNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PARENT}>
                {t("settings.placeParentNone")}
              </SelectItem>
              {parentCandidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {placeDisplayName(candidate, locale) || "-"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <section className="mt-6">
          <SectionCaption>{t("place.descriptionLabel")}</SectionCaption>
          <Textarea
            className="min-h-28"
            placeholder={t("settings.placeDescriptionPlaceholder")}
            value={place.description}
            onChange={(event) =>
              dispatchCommand({
                type: "set-place-description",
                placeId: place.id,
                description: event.target.value,
              })
            }
          />
        </section>

        {childPlaces.length > 0 && (
          <section className="mt-6">
            <SectionCaption>{t("place.subplacesTitle")}</SectionCaption>
            <div className="flex flex-col">
              {childPlaces.map((child) => (
                <Link
                  key={child.id}
                  href={placeHref(locale, worldview.id, child.id)}
                  className="flex items-center gap-2 border-b border-line py-2 text-sm hover:text-accent"
                >
                  <span className="flex-1 truncate">
                    {placeDisplayName(child, locale) || "-"}
                  </span>
                  {child.kind && (
                    <span className="rounded bg-hover px-2 py-0.5 text-xs text-muted">
                      {child.kind}
                    </span>
                  )}
                  <ChevronRight size={15} aria-hidden="true" className="text-muted" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {placeEvents.length > 0 && (
          <section className="mt-6">
            <SectionCaption>{t("place.eventsHereTitle")}</SectionCaption>
            <div className="flex flex-col">
              {placeEvents.map((event) => (
                <Link
                  key={event.id}
                  href={eventHref(locale, worldview.id, event.id)}
                  className="flex items-center gap-2 border-b border-line py-2 text-sm hover:text-accent"
                >
                  <span className="flex-1 truncate">
                    {eventDisplayTitle(event, locale) ||
                      t("timeline.untitledEvent")}
                  </span>
                  {event.when && (
                    <span className="shrink-0 text-xs text-muted">
                      {event.when}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setPendingDelete(place)}
          >
            {t("place.deletePlace")}
          </Button>
        </section>

        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogTitle>
              {t("place.deletePlaceTitle", {
                name: placeDisplayName(place, locale) || "-",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("place.deletePlaceDescription")}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger"
                onClick={() => {
                  dispatchCommand({ type: "remove-place", placeId: place.id });
                  setPendingDelete(null);
                  router.replace(placeListHref(locale, worldview.id));
                }}
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </WorldShell>
    );
  }

  // ── 목록(계층 트리) ──
  const rootPlaces = selectRootPlaces(worldview);
  const renderPlace = (node: Place, depth: number) => {
    const children = selectChildPlaces(worldview, node.id);
    return (
      <div key={node.id}>
        <Link
          href={placeHref(locale, worldview.id, node.id)}
          className="flex items-center gap-2 border-b border-line py-2.5 text-sm hover:text-accent"
          style={{ paddingLeft: `${depth * 20}px` }}
        >
          {depth > 0 && (
            <span className="text-line" aria-hidden="true">
              └
            </span>
          )}
          <span className="flex-1 truncate font-medium">
            {placeDisplayName(node, locale) || "-"}
          </span>
          {node.kind && (
            <span className="rounded bg-hover px-2 py-0.5 text-xs text-muted">
              {node.kind}
            </span>
          )}
          <ChevronRight size={15} aria-hidden="true" className="text-muted" />
        </Link>
        {children.map((child) => renderPlace(child, depth + 1))}
      </div>
    );
  };

  return (
    <WorldShell active="places" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            {t("place.tab")}
          </h1>
          <span className="ml-auto hidden lg:block">
            <SavedIndicator />
          </span>
          <Button size="sm" onClick={addPlace}>
            <Plus size={15} aria-hidden="true" />
            {t("place.add")}
          </Button>
        </div>

        {worldview.places.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("place.listEmpty")}
          </p>
        ) : (
          <div className="mt-4 flex flex-col">
            {rootPlaces.map((node) => renderPlace(node, 0))}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
