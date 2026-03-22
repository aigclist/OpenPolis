import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("network", params);
}

export default async function NetworkRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("network", params);
}
