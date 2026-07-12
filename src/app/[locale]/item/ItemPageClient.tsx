"use client";

import { ChevronLeft, Plus, Swords, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { DetailItem } from "@/components/DetailItem";
import { EntityImages } from "@/components/EntityImages";
import { LocaleTabs } from "@/components/LocaleTabs";
import { PaletteEditor } from "@/components/PaletteEditor";
import { References } from "@/components/References";
import { Avatar } from "@/components/Avatar";
import {
  EntityCard,
  EntityRowBody,
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
  createItem,
  itemDisplayName,
  type Item,
  type ItemAttributeKey,
} from "@/core/model";
import { selectChildItems, selectRootItems } from "@/core/selectors";
import { DETAIL_LAYOUTS, orderedDetailKeys } from "@/core/detailLayout";
import { LOCALES, type Locale } from "@/locales";
import { itemHref, itemListHref } from "@/react/links";
import { cn } from "@/lib/utils";
import { guardedKeyDownHandler } from "@/react/inputGuards";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
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

function AttributeRow({
  item,
  attributeKey,
  label,
}: {
  item: Item;
  attributeKey: ItemAttributeKey;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line py-1.5">
      <span className="w-24 shrink-0 text-sm text-muted">{label}</span>
      <Input
        value={item[attributeKey]}
        onChange={(event) =>
          dispatchCommand({
            type: "set-item-attribute",
            itemId: item.id,
            key: attributeKey,
            value: event.target.value,
          })
        }
      />
    </div>
  );
}

function EffectsEditor({ item }: { item: Item }) {
  const t = useTranslations();
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const effect = draft.trim().replace(/,+$/, "");
    setDraft("");
    if (!effect || item.effects.includes(effect)) return;
    dispatchCommand({
      type: "set-item-effects",
      itemId: item.id,
      effects: [...item.effects, effect],
    });
  };

  const removeEffect = (effect: string) =>
    dispatchCommand({
      type: "set-item-effects",
      itemId: item.id,
      effects: item.effects.filter((existing) => existing !== effect),
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.effects.map((effect) => (
        <Badge key={effect} className="py-1 text-sm">
          {effect}
          <button
            aria-label={`${effect} · ${t("common.delete")}`}
            className="-my-2 -mr-2 p-2 opacity-60 hover:opacity-100"
            onClick={() => removeEffect(effect)}
          >
            <X size={13} aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <Input
        className="min-w-32 flex-1"
        placeholder={t("item.effectPlaceholder")}
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

export function ItemPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const itemId = searchParams.get("i");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);

  const item = worldview?.items.find((existing) => existing.id === itemId);
  const itemMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    itemId !== null &&
    !item;

  useEffect(() => {
    if (itemMissing && worldviewId) {
      router.replace(itemListHref(locale, worldviewId));
    }
  }, [itemMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addItem = () => {
    const created = createItem();
    dispatchCommand({ type: "add-item", item: created });
    router.push(itemHref(locale, worldview.id, created.id));
  };

  // ── 상세 (데스크탑 2컬럼) ──
  if (itemId && item) {
    const parentCandidates = worldview.items.filter(
      (candidate) => candidate.id !== item.id,
    );
    const relationCandidates = worldview.items.filter(
      (candidate) =>
        candidate.id !== item.id &&
        !item.relations.some(
          (relation) => relation.targetItemId === candidate.id,
        ),
    );
    const itemName = (targetItemId: string) => {
      const target = worldview.items.find((existing) => existing.id === targetItemId);
      return target ? itemDisplayName(target, locale) || "-" : "-";
    };

    const mainItems: Record<string, ReactNode> = {
      palette: (
        <>
          <SectionCaption>{t("palette.title")}</SectionCaption>
          <PaletteEditor target={{ kind: "item", item }} />
        </>
      ),
    };
    const asideItems: Record<string, ReactNode> = {
      kind: (
        <AttributeRow item={item} attributeKey="kind" label={t("item.kindLabel")} />
      ),
      rarity: (
        <AttributeRow
          item={item}
          attributeKey="rarity"
          label={t("item.rarityLabel")}
        />
      ),
      origin: (
        <AttributeRow
          item={item}
          attributeKey="origin"
          label={t("item.originLabel")}
        />
      ),
      parent: (
        <div className="flex items-center gap-2 border-b border-line py-1.5">
          <span className="w-24 shrink-0 text-sm text-muted">
            {t("item.parentPlaceholder")}
          </span>
          <Select
            value={item.parentId ?? NO_PARENT}
            onValueChange={(value) =>
              dispatchCommand({
                type: "set-item-parent",
                itemId: item.id,
                parentId: value === NO_PARENT ? null : value,
              })
            }
          >
            <SelectTrigger className="bg-hover">
              <SelectValue placeholder={t("item.parentNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PARENT}>{t("item.parentNone")}</SelectItem>
              {parentCandidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {itemDisplayName(candidate, locale) || "-"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
      effects: (
        <>
          <SectionCaption>{t("item.effectsLabel")}</SectionCaption>
          <EffectsEditor item={item} />
        </>
      ),
      description: (
        <>
          <SectionCaption>{t("item.descriptionLabel")}</SectionCaption>
          <Textarea
            className="min-h-28"
            placeholder={t("item.descriptionPlaceholder")}
            value={item.description}
            onChange={(event) =>
              dispatchCommand({
                type: "set-item-description",
                itemId: item.id,
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
            kind="item"
            id={item.id}
          />
        </>
      ),
      relations: (
        <>
          <SectionCaption>{t("item.relationsTitle")}</SectionCaption>
          <div className="flex flex-col gap-2">
            {item.relations.map((relation, relationIndex) => (
              <div
                key={`${relation.targetItemId}-${relationIndex}`}
                className="flex items-center gap-2"
              >
                <Link
                  href={itemHref(locale, worldview.id, relation.targetItemId)}
                  className="w-28 shrink-0 truncate text-sm font-semibold hover:text-accent"
                >
                  {itemName(relation.targetItemId)}
                </Link>
                <Input
                  placeholder={t("item.relationLabelPlaceholder")}
                  value={relation.label}
                  onChange={(event) =>
                    dispatchCommand({
                      type: "set-item-relation",
                      itemId: item.id,
                      relationIndex,
                      relation: {
                        ...relation,
                        label: event.target.value,
                      },
                    })
                  }
                />
                <button
                  aria-label={`${itemName(relation.targetItemId)} · ${t("common.delete")}`}
                  className="rounded p-1 text-muted hover:text-danger"
                  onClick={() =>
                    dispatchCommand({
                      type: "remove-item-relation",
                      itemId: item.id,
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
                onValueChange={(targetItemId) =>
                  dispatchCommand({
                    type: "add-item-relation",
                    itemId: item.id,
                    relation: { targetItemId, label: "" },
                  })
                }
              >
                <SelectTrigger className="bg-hover">
                  <SelectValue placeholder={t("item.addRelation")} />
                </SelectTrigger>
                <SelectContent>
                  {relationCandidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {itemDisplayName(candidate, locale) || "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      ),
    };
    const orderedMainKeys = orderedDetailKeys(
      DETAIL_LAYOUTS["item-main"],
      worldview.detailOrders["item-main"],
    );
    const orderedAsideKeys = orderedDetailKeys(
      DETAIL_LAYOUTS["item-aside"],
      worldview.detailOrders["item-aside"],
    );

    return (
      <WorldShell active="items" worldviewId={worldview.id}>
        <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              href={itemListHref(locale, worldview.id)}
              className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
            >
              <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{t("item.tab")}</span>
            </Link>
            <span className="ml-auto">
              <SavedIndicator />
            </span>
          </div>

          <div className="mt-4 lg:grid lg:grid-cols-detail lg:gap-10">
            <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
              <EntityImages target={{ kind: "item", item }} />
              <div className="mt-3">
                <BackgroundPicker target={{ kind: "item", item }} />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Input
                  className="text-2xl font-extrabold tracking-tight"
                  placeholder={
                    nameLocale !== worldview.primaryLocale
                      ? item.name || t("item.namePlaceholder")
                      : t("item.namePlaceholder")
                  }
                  value={
                    nameLocale !== worldview.primaryLocale
                      ? (item.nameTranslations[nameLocale] ?? "")
                      : item.name
                  }
                  onChange={(event) =>
                    dispatchCommand({
                      type: "rename-item",
                      itemId: item.id,
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
                      ? Boolean(item.name)
                      : Boolean(item.nameTranslations[availableLocale]),
                  )}
                  primaryLocale={worldview.primaryLocale}
                  primaryLabel={t("settings.primaryLocaleLabel")}
                />
              </div>

              {orderedMainKeys.map((key, index) => (
                <DetailItem
                  key={key}
                  className="mt-5"
                  layoutId="item-main"
                  itemKey={key}
                  index={index}
                  total={orderedMainKeys.length}
                >
                  {mainItems[key]}
                </DetailItem>
              ))}
            </div>

            <div className="mt-7 lg:mt-0">
              {orderedAsideKeys.map((key, index) => (
                <DetailItem
                  key={key}
                  className="mt-4 first:mt-0"
                  layoutId="item-aside"
                  itemKey={key}
                  index={index}
                  total={orderedAsideKeys.length}
                >
                  {asideItems[key]}
                </DetailItem>
              ))}

              <section className="mt-8">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDelete(item)}
                >
                  {t("item.deleteItem")}
                </Button>
              </section>
            </div>
          </div>

          <AlertDialog
            open={pendingDelete !== null}
            onOpenChange={(open) => {
              if (!open) setPendingDelete(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogTitle>
                {t("item.deleteTitle", {
                  name: itemDisplayName(item, locale) || "-",
                })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("item.deleteDescription")}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-danger"
                  onClick={() => {
                    dispatchCommand({ type: "remove-item", itemId: item.id });
                    setPendingDelete(null);
                    router.replace(itemListHref(locale, worldview.id));
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
  const rootItems = selectRootItems(worldview);
  // 트리 순서(루트→자식)로 평탄화해 세트와 부품이 인접하도록 한다.
  const flattenTree = (
    nodes: Item[],
    depth: number,
    into: { node: Item; depth: number }[],
  ) => {
    for (const node of nodes) {
      into.push({ node, depth });
      flattenTree(selectChildItems(worldview, node.id), depth + 1, into);
    }
    return into;
  };
  const orderedItems = flattenTree(rootItems, 0, []);

  return (
    <WorldShell active="items" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <ListHeader
          icon={Swords}
          title={t("item.tab")}
          view={view}
          onViewChange={setView}
          trailing={
            <Button size="sm" onClick={addItem}>
              <Plus size={15} aria-hidden="true" />
              {t("item.add")}
            </Button>
          }
        />

        {worldview.items.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("item.listEmpty")}
          </p>
        ) : view === "gallery" ? (
          <div className={cn("mt-4", galleryGridClass)}>
            {orderedItems.map(({ node }) => (
              <EntityCard
                key={node.id}
                href={itemHref(locale, worldview.id, node.id)}
                thumb={<Avatar subject={node} fill className="rounded-none" />}
                name={itemDisplayName(node, locale) || "-"}
                subtitle={node.kind || node.description || undefined}
              />
            ))}
          </div>
        ) : (
          <div className={cn("mt-4", tableClass)}>
            {orderedItems.map(({ node, depth }) => (
              <Link
                key={node.id}
                href={itemHref(locale, worldview.id, node.id)}
                className={entityRowLinkClass}
                style={
                  depth > 0
                    ? { paddingLeft: `${0.75 + depth * 1.25}rem` }
                    : undefined
                }
              >
                <EntityRowBody
                  thumb={<Avatar subject={node} className="size-7 shrink-0" />}
                  name={itemDisplayName(node, locale) || "-"}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
