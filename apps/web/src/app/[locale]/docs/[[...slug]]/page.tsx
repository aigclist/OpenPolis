import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle
} from "fumadocs-ui/page";

import { createDocsSource } from "@/lib/docs/source";

type DocsPageProps = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

export default async function LocaleDocsPage({ params }: DocsPageProps) {
  const { locale, slug } = await params;
  const source = createDocsSource(locale);
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "docs" });
  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title ?? t("title")}</DocsTitle>
      <DocsDescription>{page.data.description ?? t("description")}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            a: createRelativeLink(source, page)
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}
