import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("reports", params);
}

export default async function ReportRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("reports", params);
}
