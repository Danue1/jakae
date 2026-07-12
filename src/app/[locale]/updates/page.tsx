import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { UpdateKindBadge } from "@/components/UpdateKindBadge";
import { releaseNotes } from "@/core/updates";
import { DEFAULT_LOCALE, isLocale } from "@/locales";
import { cn } from "@/lib/utils";
import { libraryHref } from "@/react/links";

export default async function UpdatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  setRequestLocale(resolved);
  const t = await getTranslations({ locale: resolved });
  const entryText = (id: string) =>
    t(`updates.entryText.${id}` as Parameters<typeof t>[0]);

  const kindLabels = {
    new: t("updates.kindNew"),
    improve: t("updates.kindImprove"),
    fix: t("updates.kindFix"),
  } as const;
  const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat(resolved, { dateStyle: "long" }).format(
      new Date(isoDate),
    );

  return (
    <article className="mx-auto max-w-xl px-5 py-14">
      <Link
        href={libraryHref(resolved)}
        className="text-sm text-muted hover:text-ink"
      >
        ‹ {t("library.title")}
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
        {t("updates.pageTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted">{t("updates.pageSubtitle")}</p>

      <div className="mt-8">
        {releaseNotes.map((release, index) => (
          <section
            key={release.version}
            className="relative border-l-2 border-line pb-7 pl-6 last:border-transparent last:pb-0"
          >
            <span
              className={cn(
                "absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-ground",
                index === 0 ? "border-accent" : "border-line",
              )}
            />
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-extrabold">{release.version}</h2>
              {index === 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                  {t("updates.latest")}
                </span>
              )}
              <span className="ml-auto text-xs text-muted">
                {formatDate(release.date)}
              </span>
            </div>
            <ul className="mt-2.5 flex flex-col gap-2">
              {release.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <UpdateKindBadge
                    kind={entry.kind}
                    label={kindLabels[entry.kind]}
                  />
                  <span>{entryText(entry.id)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
