import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("assets", params);
}

export default async function AssetRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("assets", params);
}
