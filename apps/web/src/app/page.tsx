import { redirect } from "next/navigation";

import { defaultLocale } from "@openpolis/i18n/config";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
