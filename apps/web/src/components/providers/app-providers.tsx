"use client";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";

import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <RootProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </RootProvider>
  );
}
