import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import type { CoreModuleId } from "@openpolis/application";

import { ModuleDetailPage } from "@/components/modules/module-detail-page";
import { getCoreRecordDetailViewModel } from "../view-models";

export type CoreRecordPageProps = {
  params: Promise<{
    locale: string;
    recordCode: string;
  }>;
};

export async function generateCoreRecordMetadata(
  moduleId: CoreModuleId,
  paramsPromise: CoreRecordPageProps["params"]
): Promise<Metadata> {
  try {
    const { locale, recordCode } = await paramsPromise;
    const viewModel = await getCoreRecordDetailViewModel(
      locale,
      moduleId,
      recordCode
    );

    if (!viewModel) {
      return {};
    }

    return {
      title: viewModel.title,
      description: viewModel.description
    };
  } catch {
    return {};
  }
}

export async function renderCoreRecordPage(
  moduleId: CoreModuleId,
  paramsPromise: CoreRecordPageProps["params"]
): Promise<JSX.Element> {
  const { locale, recordCode } = await paramsPromise;
  const viewModel = await getCoreRecordDetailViewModel(
    locale,
    moduleId,
    recordCode
  );

  if (!viewModel) {
    notFound();
  }

  return <ModuleDetailPage {...viewModel} />;
}
