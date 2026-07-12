"use client";

import { Building2, ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { References } from "@/components/References";
import { DetailItem } from "@/components/DetailItem";
import { LocaleTabs } from "@/components/LocaleTabs";
import {
  AvatarStack,
  EntityCard,
  EntityRow,
  IconCardThumb,
  IconRowThumb,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createGroup, groupDisplayName, type Group } from "@/core/model";
import { DETAIL_LAYOUTS, orderedDetailKeys } from "@/core/detailLayout";
import { selectReferencingCharacters } from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import { organizationHref, organizationListHref } from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useListView } from "@/react/useListView";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";
import { cn } from "@/lib/utils";

function SectionCaption({ children }: { children: string }) {
  return (
    <div className="mb-2 text-xs font-bold tracking-wide text-muted">
      {children}
    </div>
  );
}

export function OrganizationPageClient() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldviewId = searchParams.get("w");
  const organizationId = searchParams.get("o");

  const loadStatus = useOpenWorldview(worldviewId);
  const worldview = useWorldviewStore((state) => state.worldview);
  const characters = useWorldviewStore((state) => state.characters);
  const { view, setView } = useListView();
  const [nameLocale, setNameLocale] = useState<Locale>(locale);
  const [pendingDelete, setPendingDelete] = useState<Group | null>(null);

  const organization = worldview?.groups.find(
    (group) => group.id === organizationId,
  );
  const organizationMissing =
    loadStatus === "ready" &&
    worldview !== null &&
    worldview.id === worldviewId &&
    organizationId !== null &&
    !organization;

  useEffect(() => {
    if (organizationMissing && worldviewId) {
      router.replace(organizationListHref(locale, worldviewId));
    }
  }, [organizationMissing, worldviewId, locale, router]);

  if (loadStatus === "missing") return <MissingWorldview />;
  if (loadStatus !== "ready" || !worldview || worldview.id !== worldviewId) {
    return null;
  }

  const addOrganization = () => {
    const group = createGroup();
    dispatchCommand({ type: "add-group", group });
    router.push(organizationHref(locale, worldview.id, group.id));
  };

  // ── 상세 ──
  if (organizationId && organization) {
    const detailItems: Record<string, ReactNode> = {
      description: (
        <>
          <SectionCaption>{t("organization.descriptionLabel")}</SectionCaption>
          <Textarea
            className="min-h-28"
            placeholder={t("organization.descriptionPlaceholder")}
            value={organization.description}
            onChange={(event) =>
              dispatchCommand({
                type: "set-group-description",
                groupId: organization.id,
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
            kind="group"
            id={organization.id}
          />
        </>
      ),
    };
    const orderedKeys = orderedDetailKeys(
      DETAIL_LAYOUTS.organization,
      worldview.detailOrders.organization,
    );
    return (
      <WorldShell active="organizations" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-24 pt-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href={organizationListHref(locale, worldview.id)}
            className="flex min-w-0 items-center gap-1 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
          >
            <ChevronLeft size={17} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{t("organization.tab")}</span>
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
                ? organization.name || t("organization.namePlaceholder")
                : t("organization.namePlaceholder")
            }
            value={
              nameLocale !== worldview.primaryLocale
                ? (organization.nameTranslations[nameLocale] ?? "")
                : organization.name
            }
            onChange={(event) =>
              dispatchCommand({
                type: "rename-group",
                groupId: organization.id,
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
                ? Boolean(organization.name)
                : Boolean(organization.nameTranslations[availableLocale]),
            )}
            primaryLocale={worldview.primaryLocale}
            primaryLabel={t("settings.primaryLocaleLabel")}
          />
        </div>

        {orderedKeys.map((key, index) => (
          <DetailItem
            key={key}
            className="mt-6"
            layoutId="organization"
            itemKey={key}
            index={index}
            total={orderedKeys.length}
          >
            {detailItems[key]}
          </DetailItem>
        ))}

        <section className="mt-8">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setPendingDelete(organization)}
          >
            {t("organization.deleteOrg")}
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
              {t("organization.deleteOrgTitle", {
                name: groupDisplayName(organization, locale) || "-",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("organization.deleteOrgDescription")}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger"
                onClick={() => {
                  dispatchCommand({
                    type: "remove-group",
                    groupId: organization.id,
                  });
                  setPendingDelete(null);
                  router.replace(organizationListHref(locale, worldview.id));
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
  return (
    <WorldShell active="organizations" worldviewId={worldview.id}>
      <div className="mx-auto max-w-page px-4 pb-28 pt-5 sm:px-6">
        <ListHeader
          icon={Building2}
          title={t("organization.tab")}
          view={view}
          onViewChange={setView}
          trailing={
            <Button size="sm" onClick={addOrganization}>
              <Plus size={15} aria-hidden="true" />
              {t("organization.add")}
            </Button>
          }
        />

        {worldview.groups.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("organization.listEmpty")}
          </p>
        ) : (
          <div
            className={cn(
              "mt-4",
              view === "gallery" ? galleryGridClass : tableClass,
            )}
          >
            {worldview.groups.map((group) => {
              const members = selectReferencingCharacters(
                worldview,
                characters,
                "group",
                group.id,
                locale,
              );
              const props = {
                href: organizationHref(locale, worldview.id, group.id),
                name: groupDisplayName(group, locale) || "-",
                subtitle: group.description,
                meta: <AvatarStack characters={members} />,
              };
              return view === "gallery" ? (
                <EntityCard
                  key={group.id}
                  {...props}
                  thumb={<IconCardThumb icon={Building2} />}
                />
              ) : (
                <EntityRow
                  key={group.id}
                  {...props}
                  thumb={<IconRowThumb icon={Building2} />}
                />
              );
            })}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
