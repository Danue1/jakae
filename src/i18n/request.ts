import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, MESSAGES } from "@/locales";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(LOCALES, requested) ? requested : DEFAULT_LOCALE;
  return { locale, messages: MESSAGES[locale] };
});
