import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("operations", params);
}

export default async function OperationRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("operations", params);
}
