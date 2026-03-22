import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("feedback", params);
}

export default async function FeedbackRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("feedback", params);
}
