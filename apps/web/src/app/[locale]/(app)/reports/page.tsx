import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { getCoreModuleViewModel } from "@/server/view-models";

type ReportsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    record?: string;
  }>;
};

export default async function ReportsPage({
  params,
  searchParams
}: ReportsPageProps) {
  const { locale } = await params;
  const { record } = await searchParams;
  const viewModel = await getCoreModuleViewModel(locale, "reports", {
    recordCode: record,
    basePath: `/${locale}/reports`
  });

  return <ModulePageTemplate {...viewModel} />;
}
