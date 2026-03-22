import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { getSkillViewModel } from "@/server/view-models";

type SkillsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { locale } = await params;
  const viewModel = await getSkillViewModel(locale);

  return <ModulePageTemplate {...viewModel} />;
}
