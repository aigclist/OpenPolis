import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("briefs", params);
}

export default async function BriefRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("briefs", params);
}
