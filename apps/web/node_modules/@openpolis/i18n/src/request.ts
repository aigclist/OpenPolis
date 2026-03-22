import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const localeCandidate = await requestLocale;
  const locale = locales.includes(localeCandidate as (typeof locales)[number])
    ? (localeCandidate as (typeof locales)[number])
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "UTC"
  };
});
