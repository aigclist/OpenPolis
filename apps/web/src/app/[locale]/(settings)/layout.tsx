import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";

type SettingsGroupLayoutProps = {
  children: ReactNode;
};

export default function SettingsGroupLayout({
  children
}: SettingsGroupLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
