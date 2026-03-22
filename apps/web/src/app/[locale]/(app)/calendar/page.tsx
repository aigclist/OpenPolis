import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { getCoreModuleViewModel } from "@/server/view-models";

type CalendarPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    record?: string;
  }>;
};

export default async function CalendarPage({
  params,
  searchParams
}: CalendarPageProps) {
  const { locale } = await params;
  const { record } = await searchParams;
  const viewModel = await getCoreModuleViewModel(locale, "calendar", {
    recordCode: record,
    basePath: `/${locale}/calendar`
  });

  return <ModulePageTemplate {...viewModel} />;
}
