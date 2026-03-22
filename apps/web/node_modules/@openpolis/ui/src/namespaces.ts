export const moduleIds = [
  "dashboard",
  "issues",
  "assets",
  "briefs",
  "operations",
  "network",
  "calendar",
  "feedback",
  "review",
  "reports",
] as const;

export type ModuleId = (typeof moduleIds)[number];

export const utilityIds = [
  "aiWorkspace",
  "skills",
  "settings",
  "admin",
  "docs",
] as const;

export type UtilityId = (typeof utilityIds)[number];

export const mainNavigation = [
  { id: "dashboard", href: "/" },
  { id: "issues", href: "/issues" },
  { id: "assets", href: "/assets" },
  { id: "briefs", href: "/briefs" },
  { id: "operations", href: "/operations" },
  { id: "network", href: "/network" },
  { id: "calendar", href: "/calendar" },
  { id: "feedback", href: "/feedback" },
  { id: "review", href: "/review" },
  { id: "reports", href: "/reports" }
] as const satisfies readonly {
  id: ModuleId;
  href: string;
}[];

export const utilityNavigation = [
  { id: "aiWorkspace", href: "/ai-workspace" },
  { id: "skills", href: "/skills" },
  { id: "settings", href: "/settings" },
  { id: "admin", href: "/admin" },
  { id: "docs", href: "/docs" }
] as const satisfies readonly {
  id: UtilityId;
  href: string;
}[];

export const workspaceNavigationGroups = [
  {
    id: "control",
    items: [
      { kind: "module", id: "dashboard", href: "/" },
      { kind: "utility", id: "aiWorkspace", href: "/ai-workspace" }
    ]
  },
  {
    id: "moveWork",
    items: [
      { kind: "module", id: "issues", href: "/issues" },
      { kind: "module", id: "briefs", href: "/briefs" },
      { kind: "module", id: "operations", href: "/operations" },
      { kind: "module", id: "assets", href: "/assets" }
    ]
  },
  {
    id: "knowWhatIsHappening",
    items: [
      { kind: "module", id: "network", href: "/network" },
      { kind: "module", id: "calendar", href: "/calendar" },
      { kind: "module", id: "feedback", href: "/feedback" },
      { kind: "module", id: "review", href: "/review" },
      { kind: "module", id: "reports", href: "/reports" }
    ]
  },
  {
    id: "systemManagement",
    items: [
      { kind: "utility", id: "skills", href: "/skills" },
      { kind: "utility", id: "settings", href: "/settings" },
      { kind: "utility", id: "admin", href: "/admin" },
      { kind: "utility", id: "docs", href: "/docs" }
    ]
  }
] as const satisfies readonly {
  id:
    | "control"
    | "moveWork"
    | "knowWhatIsHappening"
    | "systemManagement";
  items: readonly (
    | {
        kind: "module";
        id: ModuleId;
        href: string;
      }
    | {
        kind: "utility";
        id: UtilityId;
        href: string;
      }
  )[];
}[];

export const uiNamespaces = {
  shell: "shell",
  hero: "hero",
  summary: "summary",
  recordList: "record-list",
  recordDetail: "record-detail",
  dashboard: "dashboard",
  module: "module",
  agent: "agent",
  docs: "docs"
} as const;

export type UiNamespace = keyof typeof uiNamespaces;

export function getUiNamespace(namespace: UiNamespace, slot: string) {
  return `openpolis/${uiNamespaces[namespace]}/${slot}`;
}
