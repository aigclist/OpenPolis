"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BlocksIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CircleCheckBigIcon,
  ClipboardListIcon,
  FileStackIcon,
  LayoutDashboardIcon,
  MessageSquareMoreIcon,
  NetworkIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  WavesLadderIcon
} from "lucide-react";

import { LocaleSwitcher } from "@/components/shell/locale-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@openpolis/i18n/navigation";
import {
  type ModuleId,
  type UtilityId,
  workspaceNavigationGroups
} from "@openpolis/ui/namespaces";

const moduleIcons: Record<ModuleId, typeof LayoutDashboardIcon> = {
  dashboard: LayoutDashboardIcon,
  issues: ClipboardListIcon,
  assets: FileStackIcon,
  briefs: BookOpenIcon,
  operations: WavesLadderIcon,
  network: NetworkIcon,
  calendar: CalendarClockIcon,
  feedback: MessageSquareMoreIcon,
  review: CircleCheckBigIcon,
  reports: FileStackIcon
};

const utilityIcons: Record<UtilityId, typeof SparklesIcon> = {
  aiWorkspace: SparklesIcon,
  skills: BlocksIcon,
  settings: Settings2Icon,
  admin: ShieldCheckIcon,
  docs: BookOpenIcon
};

type AppShellProps = {
  children: ReactNode;
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const tShell = useTranslations("shell");

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        mobileDescription={tShell("brand.tagline")}
        mobileTitle={tShell("brand.name")}
        variant="sidebar"
      >
        <SidebarHeader className="gap-4 border-b border-sidebar-border px-4 py-5">
          <Link
            className="flex items-center gap-3 text-sidebar-foreground"
            href="/"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboardIcon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <div className="truncate font-semibold">{tShell("brand.name")}</div>
              <div className="line-clamp-2 text-xs text-sidebar-foreground/75">
                {tShell("brand.tagline")}
              </div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          {workspaceNavigationGroups.map((group, index) => (
            <div key={group.id}>
              {index > 0 ? <SidebarSeparator /> : null}
              <SidebarGroup>
                <SidebarGroupLabel>{tShell(`groups.${group.id}`)}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      const Icon =
                        item.kind === "module"
                          ? moduleIcons[item.id]
                          : utilityIcons[item.id];
                      const labelKey =
                        item.kind === "module"
                          ? `navigation.${item.id}`
                          : `utility.${item.id}`;

                      return (
                        <SidebarMenuItem key={`${item.kind}:${item.id}`}>
                          <SidebarMenuButton
                            isActive={active}
                            render={
                              <Link
                                aria-current={active ? "page" : undefined}
                                href={item.href}
                              />
                            }
                          >
                            <Icon />
                            <span>{tShell(labelKey)}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter className="gap-4 border-t border-sidebar-border px-4 py-4">
          <div className="group-data-[collapsible=icon]:hidden">
            <LocaleSwitcher />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {tShell("header.eyebrow")}
                </div>
                <div className="truncate text-lg font-semibold">
                  {tShell("header.title")}
                </div>
              </div>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <Badge variant="secondary">{tShell("header.deployment")}</Badge>
              <Badge variant="secondary">{tShell("header.governance")}</Badge>
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
