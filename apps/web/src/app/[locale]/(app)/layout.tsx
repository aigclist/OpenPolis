import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { createOperatorSettingsHref } from "@/lib/operator-route-guard";
import { readOperatorSession } from "@/server/auth/session";
import { isOperatorSessionConfigured } from "@/server/auth/config";

type AppGroupLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function AppGroupLayout({
  children,
  params
}: AppGroupLayoutProps) {
  const { locale } = await params;

  if (isOperatorSessionConfigured()) {
    const session = await readOperatorSession();

    if (!session) {
      redirect(
        createOperatorSettingsHref(locale, {
          session: "error",
          sessionError: "auth"
        })
      );
    }
  }

  return <AppShell>{children}</AppShell>;
}
