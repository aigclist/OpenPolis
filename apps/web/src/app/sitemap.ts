import type { MetadataRoute } from "next";

import { locales } from "@openpolis/i18n/config";
import { mainNavigation, utilityNavigation } from "@openpolis/ui/namespaces";

import { getSiteUrl } from "@/lib/config/site";

function getLocalizedPath(locale: string, href: string) {
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const localizedRoutes = new Set<string>();

  for (const locale of locales) {
    localizedRoutes.add(getLocalizedPath(locale, "/"));

    for (const item of mainNavigation) {
      localizedRoutes.add(getLocalizedPath(locale, item.href));
    }

    for (const item of utilityNavigation) {
      localizedRoutes.add(getLocalizedPath(locale, item.href));
    }
  }

  return Array.from(localizedRoutes).map((pathname) => ({
    url: new URL(pathname, siteUrl).toString(),
    lastModified
  }));
}
