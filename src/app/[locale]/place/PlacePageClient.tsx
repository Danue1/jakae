"use client";

import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DetailItem } from "@/components/DetailItem";
import { LocaleTabs } from "@/components/LocaleTabs";
import {
  EntityCard,
  EntityRowBody,
  IconCardThumb,
  IconRowThumb,
  KindBadge,
  entityRowLinkClass,
  galleryGridClass,
  tableClass,
} from "@/components/EntityList";
import { ListHeader } from "@/components/ListHeader";
import { References } from "@/components/References";
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
import { DETAIL_LAYOUTS, orderedDetailKeys } from "@/core/detailLayout";
import {
  selectChildPlaces,
  selectPlaceEvents,
  selectRootPlaces,
} from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import { eventHref, placeHref, placeListHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";
import { cn } from "@/lib/utils";

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
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
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

    const fieldRowClass = "flex items-center gap-2 border-b border-line py-1.5";
    const fieldLabelClass = "w-20 shrink-0 text-sm text-muted";
    const detailItems: Record<string, ReactNode> = {
      kind: (
        <div className={fieldRowClass}>
          <span className={fieldLabelClass}>{t("place.kindLabel")}</span>
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
      ),
      parent: (
        <div className={fieldRowClass}>
          <span className={fieldLabelClass}>
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
      ),
      description: (
        <>
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
        </>
      ),
      references: (
        <>
          <SectionCaption>{t("reference.sectionTitle")}</SectionCaption>
          <References
            worldview={worldview}
            characters={characters}
            kind="place"
            id={place.id}
          />
        </>
      ),
    };
    const orderedKeys = orderedDetailKeys(
      DETAIL_LAYOUTS.place,
      worldview.detailOrders.place,
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

        <div className="mt-4">
          {orderedKeys.map((key, index) => (
            <DetailItem
              key={key}
              className="mt-4 first:mt-0"
              layoutId="place"
              itemKey={key}
              index={index}
              total={orderedKeys.length}
            >
              {detailItems[key]}
            </DetailItem>
          ))}
        </div>

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

  // ── 목록 ──
  // 트리 순서(루트→자식)로 깊이와 함께 평탄화 — 갤러리는 카드 인접 배치, 표는 들여쓰기 트리에 쓴다.
  // (행이 형제로 나열돼야 구분선 last:border-0이 맞으므로 표도 이 평탄 목록을 그대로 쓴다.)
  const rootPlaces = selectRootPlaces(worldview);
  const flattenTree = (
    nodes: Place[],
    depth: number,
    into: { node: Place; depth: number }[],
  ) => {
    for (const node of nodes) {
      into.push({ node, depth });
      flattenTree(selectChildPlaces(worldview, node.id), depth + 1, into);
    }
    return into;
  };
  const orderedPlaces = flattenTree(rootPlaces, 0, []);

  return (
    <WorldShell active="places" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <ListHeader
          icon={MapPin}
          title={t("place.tab")}
          view={view}
          onViewChange={setView}
          trailing={
            <Button size="sm" onClick={addPlace}>
              <Plus size={15} aria-hidden="true" />
              {t("place.add")}
            </Button>
          }
        />

        {worldview.places.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("place.listEmpty")}
          </p>
        ) : view === "gallery" ? (
          <div className={cn("mt-4", galleryGridClass)}>
            {orderedPlaces.map(({ node }) => (
              <EntityCard
                key={node.id}
                href={placeHref(locale, worldview.id, node.id)}
                thumb={<IconCardThumb icon={MapPin} />}
                name={placeDisplayName(node, locale) || "-"}
                subtitle={node.kind || undefined}
              />
            ))}
          </div>
        ) : (
          <div className={cn("mt-4", tableClass)}>
            {orderedPlaces.map(({ node, depth }) => (
              <Link
                key={node.id}
                href={placeHref(locale, worldview.id, node.id)}
                className={entityRowLinkClass}
                style={
                  depth > 0
                    ? { paddingLeft: `${0.75 + depth * 1.25}rem` }
                    : undefined
                }
              >
                <EntityRowBody
                  thumb={<IconRowThumb icon={MapPin} />}
                  name={placeDisplayName(node, locale) || "-"}
                  meta={node.kind ? <KindBadge>{node.kind}</KindBadge> : undefined}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
