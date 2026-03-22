import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { createDocsSource } from "@/lib/docs/source";

type DocsLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleDocsLayout({
  children,
  params
}: DocsLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs" });
  const source = createDocsSource(locale);

  return (
    <DocsLayout
      nav={{ title: t("navTitle"), url: `/${locale}` }}
      tree={source.pageTree}
    >
      {children}
    </DocsLayout>
  );
}
