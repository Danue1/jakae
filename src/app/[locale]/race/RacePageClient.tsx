"use client";

import { ChevronLeft, Dna, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { References } from "@/components/References";
import { LocaleTabs } from "@/components/LocaleTabs";
import {
  EntityCard,
  EntityRowBody,
  IconCardThumb,
  IconRowThumb,
  entityRowLinkClass,
  galleryGridClass,
  tableClass,
} from "@/components/EntityList";
import { ListHeader } from "@/components/ListHeader";
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
import { Badge } from "@/components/ui/badge";
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
  createRace,
  raceDisplayName,
  type Race,
  type RaceAttributeKey,
} from "@/core/model";
import {
  selectChildRaces,
  selectRootRaces,
} from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import { raceHref, raceListHref } from "@/react/links";
import { cn } from "@/lib/utils";
import { guardedKeyDownHandler } from "@/react/inputGuards";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

const NO_PARENT = "__none__";
const SYMBOL_COLORS = [
  "#5a8f5a",
  "#3e6db5",
  "#b4533a",
  "#8a5cb5",
  "#c98a2e",
  "#4a8a8f",
];

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

function AttributeRow({
  race,
  attributeKey,
  label,
}: {
  race: Race;
  attributeKey: RaceAttributeKey;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line py-1.5">
      <span className="w-24 shrink-0 text-sm text-muted">{label}</span>
      <Input
        value={race[attributeKey]}
        onChange={(event) =>
          dispatchCommand({
            type: "set-race-attribute",
            raceId: race.id,
            key: attributeKey,
            value: event.target.value,
          })
        }
      />
    </div>
  );
}

function SymbolColorPicker({ race }: { race: Race }) {
  const t = useTranslations();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const currentColor = race.symbolColor;
  const isPreset = currentColor !== null && SYMBOL_COLORS.includes(currentColor);

  const setColor = (symbolColor: string | null) =>
    dispatchCommand({
      type: "set-race-symbol-color",
      raceId: race.id,
      symbolColor,
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        aria-label={t("race.colorAuto")}
        title={t("race.colorAuto")}
        className={cn(
          "flex size-7 items-center justify-center rounded-full border-2 border-line text-muted",
          currentColor === null && "border-accent",
        )}
        onClick={() => setColor(null)}
      >
        {currentColor === null && <X size={13} aria-hidden="true" />}
      </button>
      {SYMBOL_COLORS.map((presetColor) => (
        <button
          key={presetColor}
          aria-label={presetColor}
          className={cn(
            "size-7 rounded-full border-2 border-line",
            currentColor === presetColor && "border-accent",
          )}
          style={{ background: presetColor }}
          onClick={() => setColor(presetColor)}
        />
      ))}
      <button
        aria-label={t("race.colorCustom")}
        title={t("race.colorCustom")}
        className={cn(
          "flex size-7 items-center justify-center rounded-full border-2 border-dashed border-line text-muted",
          currentColor !== null && !isPreset && "border-accent",
        )}
        style={
          currentColor !== null && !isPreset
            ? { background: currentColor }
            : undefined
        }
        onClick={() => colorInputRef.current?.click()}
      >
        {(currentColor === null || isPreset) && (
          <Plus size={13} aria-hidden="true" />
        )}
      </button>
      <input
        ref={colorInputRef}
        type="color"
        hidden
        value={currentColor ?? "#5a8f5a"}
        onChange={(event) => setColor(event.target.value)}
      />
    </div>
  );
}

function TraitsEditor({ race }: { race: Race }) {
  const t = useTranslations();
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const trait = draft.trim().replace(/,+$/, "");
    setDraft("");
    if (!trait || race.traits.includes(trait)) return;
    dispatchCommand({
      type: "set-race-traits",
      raceId: race.id,
      traits: [...race.traits, trait],
    });
  };

  const removeTrait = (trait: string) =>
    dispatchCommand({
      type: "set-race-traits",
      raceId: race.id,
      traits: race.traits.filter((existing) => existing !== trait),
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {race.traits.map((trait) => (
        <Badge key={trait} className="py-1 text-sm">
          {trait}
          <button
            aria-label={`${trait} · ${t("common.delete")}`}
            className="-my-2 -mr-2 p-2 opacity-60 hover:opacity-100"
            onClick={() => removeTrait(trait)}
          >
            <X size={13} aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <Input
        className="min-w-32 flex-1"
        placeholder={t("race.traitPlaceholder")}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={guardedKeyDownHandler({
          Enter: (event) => {
            event.preventDefault();
            commitDraft();
          },
          ",": (event) => {
            event.preventDefault();
            commitDraft();
          },
          " ": (event) => {
            event.preventDefault();
            commitDraft();
          },
        })}
      />
    </div>
  );
}

export function RacePageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const raceId = searchParams.get("r");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState<Race | null>(null);

  const race = worldview?.races.find((existing) => existing.id === raceId);
  const raceMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    raceId !== null &&
    !race;

  useEffect(() => {
    if (raceMissing && worldviewId) {
      router.replace(raceListHref(locale, worldviewId));
    }
  }, [raceMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addRace = () => {
    const created = createRace();
    dispatchCommand({ type: "add-race", race: created });
    router.push(raceHref(locale, worldview.id, created.id));
  };

  // ── 상세 (단일 스크롤) ──
  if (raceId && race) {
    const parentCandidates = worldview.races.filter(
      (candidate) => candidate.id !== race.id,
    );
    const relationCandidates = worldview.races.filter(
      (candidate) =>
        candidate.id !== race.id &&
        !race.relations.some(
          (relation) => relation.targetRaceId === candidate.id,
        ),
    );
    const raceName = (targetRaceId: string) => {
      const target = worldview.races.find((existing) => existing.id === targetRaceId);
      return target ? raceDisplayName(target, locale) || "-" : "-";
    };

    return (
      <WorldShell active="races" worldviewId={worldview.id}>
        <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              href={raceListHref(locale, worldview.id)}
              className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
            >
              <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{t("race.tab")}</span>
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
                  ? race.name || t("race.namePlaceholder")
                  : t("race.namePlaceholder")
              }
              value={
                nameLocale !== worldview.primaryLocale
                  ? (race.nameTranslations[nameLocale] ?? "")
                  : race.name
              }
              onChange={(event) =>
                dispatchCommand({
                  type: "rename-race",
                  raceId: race.id,
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
                  ? Boolean(race.name)
                  : Boolean(race.nameTranslations[availableLocale]),
              )}
              primaryLocale={worldview.primaryLocale}
              primaryLabel={t("settings.primaryLocaleLabel")}
            />
          </div>

          <section className="mt-6">
            <SectionCaption>{t("race.symbolLabel")}</SectionCaption>
            <SymbolColorPicker race={race} />
            <div className="mt-3 flex items-center gap-2 border-b border-line py-1.5">
              <span className="w-24 shrink-0 text-sm text-muted">
                {t("race.parentPlaceholder")}
              </span>
              <Select
                value={race.parentId ?? NO_PARENT}
                onValueChange={(value) =>
                  dispatchCommand({
                    type: "set-race-parent",
                    raceId: race.id,
                    parentId: value === NO_PARENT ? null : value,
                  })
                }
              >
                <SelectTrigger className="bg-hover">
                  <SelectValue placeholder={t("race.parentNone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>{t("race.parentNone")}</SelectItem>
                  {parentCandidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {raceDisplayName(candidate, locale) || "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="mt-6">
            <SectionCaption>{t("race.attributesLabel")}</SectionCaption>
            <AttributeRow
              race={race}
              attributeKey="lifespan"
              label={t("race.lifespanLabel")}
            />
            <AttributeRow
              race={race}
              attributeKey="height"
              label={t("race.heightLabel")}
            />
            <AttributeRow
              race={race}
              attributeKey="origin"
              label={t("race.originLabel")}
            />
            <AttributeRow
              race={race}
              attributeKey="language"
              label={t("race.languageLabel")}
            />
          </section>

          <section className="mt-6">
            <SectionCaption>{t("race.traitsLabel")}</SectionCaption>
            <TraitsEditor race={race} />
          </section>

          <section className="mt-6">
            <SectionCaption>{t("race.descriptionLabel")}</SectionCaption>
            <Textarea
              className="min-h-28"
              placeholder={t("race.descriptionPlaceholder")}
              value={race.description}
              onChange={(event) =>
                dispatchCommand({
                  type: "set-race-description",
                  raceId: race.id,
                  description: event.target.value,
                })
              }
            />
          </section>

          <section className="mt-6">
            <SectionCaption>{t("reference.sectionTitle")}</SectionCaption>
            <References
              worldview={worldview}
              characters={characters}
              kind="race"
              id={race.id}
            />
          </section>

          <section className="mt-6">
            <SectionCaption>{t("race.relationsTitle")}</SectionCaption>
            <div className="flex flex-col gap-2">
              {race.relations.map((relation, relationIndex) => (
                <div
                  key={`${relation.targetRaceId}-${relationIndex}`}
                  className="flex items-center gap-2"
                >
                  <Link
                    href={raceHref(locale, worldview.id, relation.targetRaceId)}
                    className="w-28 shrink-0 truncate text-sm font-semibold hover:text-accent"
                  >
                    {raceName(relation.targetRaceId)}
                  </Link>
                  <Input
                    placeholder={t("race.relationLabelPlaceholder")}
                    value={relation.label}
                    onChange={(event) =>
                      dispatchCommand({
                        type: "set-race-relation",
                        raceId: race.id,
                        relationIndex,
                        relation: {
                          ...relation,
                          label: event.target.value,
                        },
                      })
                    }
                  />
                  <button
                    aria-label={`${raceName(relation.targetRaceId)} · ${t("common.delete")}`}
                    className="rounded p-1 text-muted hover:text-danger"
                    onClick={() =>
                      dispatchCommand({
                        type: "remove-race-relation",
                        raceId: race.id,
                        relationIndex,
                      })
                    }
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            {relationCandidates.length > 0 && (
              <div className="mt-3">
                <Select
                  value=""
                  onValueChange={(targetRaceId) =>
                    dispatchCommand({
                      type: "add-race-relation",
                      raceId: race.id,
                      relation: { targetRaceId, label: "" },
                    })
                  }
                >
                  <SelectTrigger className="bg-hover">
                    <SelectValue placeholder={t("race.addRelation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {relationCandidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {raceDisplayName(candidate, locale) || "-"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>

          <section className="mt-8">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setPendingDelete(race)}
            >
              {t("race.deleteRace")}
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
                {t("race.deleteTitle", {
                  name: raceDisplayName(race, locale) || "-",
                })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("race.deleteDescription")}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-danger"
                  onClick={() => {
                    dispatchCommand({ type: "remove-race", raceId: race.id });
                    setPendingDelete(null);
                    router.replace(raceListHref(locale, worldview.id));
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
  const rootRaces = selectRootRaces(worldview);
  // 상징색이 있으면 그 색으로 틴트한 아이콘 썸네일, 없으면 공통 accent 썸네일.
  const raceCardThumb = (node: Race) =>
    node.symbolColor ? (
      <div
        className="grid size-full place-items-center"
        style={{ background: `${node.symbolColor}22`, color: node.symbolColor }}
      >
        <Dna size={26} aria-hidden="true" />
      </div>
    ) : (
      <IconCardThumb icon={Dna} />
    );
  const raceRowThumb = (node: Race) =>
    node.symbolColor ? (
      <div
        className="grid size-7 shrink-0 place-items-center rounded-md"
        style={{ background: `${node.symbolColor}22`, color: node.symbolColor }}
      >
        <Dna size={16} aria-hidden="true" />
      </div>
    ) : (
      <IconRowThumb icon={Dna} />
    );
  // 트리 순서(루트→자식)로 평탄화해 부모·자식이 인접하도록 한다.
  const flattenTree = (
    nodes: Race[],
    depth: number,
    into: { node: Race; depth: number }[],
  ) => {
    for (const node of nodes) {
      into.push({ node, depth });
      flattenTree(selectChildRaces(worldview, node.id), depth + 1, into);
    }
    return into;
  };
  const orderedRaces = flattenTree(rootRaces, 0, []);

  return (
    <WorldShell active="races" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <ListHeader
          icon={Dna}
          title={t("race.tab")}
          view={view}
          onViewChange={setView}
          trailing={
            <Button size="sm" onClick={addRace}>
              <Plus size={15} aria-hidden="true" />
              {t("race.add")}
            </Button>
          }
        />

        {worldview.races.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("race.listEmpty")}
          </p>
        ) : view === "gallery" ? (
          <div className={cn("mt-4", galleryGridClass)}>
            {orderedRaces.map(({ node }) => (
              <EntityCard
                key={node.id}
                href={raceHref(locale, worldview.id, node.id)}
                thumb={raceCardThumb(node)}
                name={raceDisplayName(node, locale) || "-"}
                subtitle={node.description || undefined}
              />
            ))}
          </div>
        ) : (
          <div className={cn("mt-4", tableClass)}>
            {orderedRaces.map(({ node, depth }) => (
              <Link
                key={node.id}
                href={raceHref(locale, worldview.id, node.id)}
                className={entityRowLinkClass}
                style={
                  depth > 0
                    ? { paddingLeft: `${0.75 + depth * 1.25}rem` }
                    : undefined
                }
              >
                <EntityRowBody
                  thumb={raceRowThumb(node)}
                  name={raceDisplayName(node, locale) || "-"}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
