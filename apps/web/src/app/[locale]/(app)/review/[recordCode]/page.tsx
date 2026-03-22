import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("review", params);
}

export default async function ReviewRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("review", params);
}
