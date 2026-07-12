"use client";

import { ChevronLeft, Plus, X } from "lucide-react";
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
  characterDisplayName,
  createGroup,
  groupDisplayName,
  type Group,
} from "@/core/model";
import { selectActiveCharacters, selectOrganizationMembers } from "@/core/selectors";
import { LOCALES, type Locale } from "@/locales";
import {
  characterHref,
  organizationHref,
  organizationListHref,
} from "@/react/links";
import { useLocale, useTranslations } from "next-intl";
import { useOpenWorldview } from "@/react/useOpenWorldview";
import { useWorldviewStore } from "@/react/useWorldviewStore";
import { dispatchCommand } from "@/store/worldviewStore";

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
    const members = selectOrganizationMembers(characters, organization.id, locale);
    const candidates = selectActiveCharacters(characters).filter(
      (character) => !character.groupIds.includes(organization.id),
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

        <section className="mt-6">
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
        </section>

        <section className="mt-6">
          <SectionCaption>{t("organization.membersTitle")}</SectionCaption>
          <div className="flex flex-col">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 border-b border-line py-2"
              >
                <Link
                  href={characterHref(locale, worldview.id, member.id)}
                  className="flex-1 truncate text-sm hover:text-accent"
                >
                  {characterDisplayName(member, locale) || "-"}
                </Link>
                <button
                  aria-label={`${characterDisplayName(member, locale)} · ${t("common.delete")}`}
                  className="rounded p-1 text-muted hover:text-danger"
                  onClick={() =>
                    dispatchCommand({
                      type: "set-group-membership",
                      characterId: member.id,
                      groupId: organization.id,
                      assigned: false,
                    })
                  }
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          {candidates.length > 0 && (
            <div className="mt-3">
              <Select
                value=""
                onValueChange={(characterId) =>
                  dispatchCommand({
                    type: "set-group-membership",
                    characterId,
                    groupId: organization.id,
                    assigned: true,
                  })
                }
              >
                <SelectTrigger className="bg-hover">
                  <SelectValue placeholder={t("organization.addMember")} />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {characterDisplayName(candidate, locale) || "-"}
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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            {t("organization.tab")}
          </h1>
          <span className="ml-auto hidden lg:block">
            <SavedIndicator />
          </span>
          <Button size="sm" onClick={addOrganization}>
            <Plus size={15} aria-hidden="true" />
            {t("organization.add")}
          </Button>
        </div>

        {worldview.groups.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted">
            {t("organization.listEmpty")}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {worldview.groups.map((group) => (
              <Link
                key={group.id}
                href={organizationHref(locale, worldview.id, group.id)}
                className="rounded-2xl border border-line p-4 hover:border-accent"
              >
                <div className="truncate font-bold">
                  {groupDisplayName(group, locale) || "-"}
                </div>
                {group.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {group.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorldShell>
  );
}
