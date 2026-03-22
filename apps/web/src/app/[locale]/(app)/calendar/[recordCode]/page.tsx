import type { Metadata } from "next";

import {
  generateCoreRecordMetadata,
  renderCoreRecordPage,
  type CoreRecordPageProps
} from "@/server/workspace/core-record-page";

export async function generateMetadata({
  params
}: CoreRecordPageProps): Promise<Metadata> {
  return generateCoreRecordMetadata("calendar", params);
}

export default async function CalendarRecordPage({
  params
}: CoreRecordPageProps) {
  return renderCoreRecordPage("calendar", params);
}
