import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { getCoreModuleViewModel } from "@/server/view-models";

type NetworkPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    record?: string;
  }>;
};

export default async function NetworkPage({
  params,
  searchParams
}: NetworkPageProps) {
  const { locale } = await params;
  const { record } = await searchParams;
  const viewModel = await getCoreModuleViewModel(locale, "network", {
    recordCode: record,
    basePath: `/${locale}/network`
  });

  return <ModulePageTemplate {...viewModel} />;
}
