import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { DEFAULT_LOCALE, isLocale } from "@/locales";
import { libraryHref } from "@/react/links";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  setRequestLocale(resolved);
  const t = await getTranslations({ locale: resolved });
  const paragraphs = [t("about.p1"), t("about.p2"), t("about.p3")];

  return (
    <article className="mx-auto max-w-page px-5 py-14">
      <h1 className="text-2xl font-extrabold tracking-tight">
        {t("about.title")}
      </h1>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Link
        href={libraryHref(resolved)}
        className="mt-8 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        {t("about.back")}
      </Link>
    </article>
  );
}
