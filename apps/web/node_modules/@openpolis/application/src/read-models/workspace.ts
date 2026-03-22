import type { WorkspaceModule } from "@openpolis/contracts";

export type CoreModuleId = Exclude<
  WorkspaceModule,
  "dashboard" | "ai_workspace" | "skills"
>;

export type WorkspaceMetricKey =
  | "active"
  | "monitoring"
  | "response_needed"
  | "draft"
  | "approved"
  | "localized"
  | "queued"
  | "scheduled"
  | "in_review"
  | "blocked"
  | "attention"
  | "resolved"
  | "generated"
  | "archived"
  | "enabled"
  | "restricted"
  | "configured"
  | "changes_requested"
  | "ready";

export type DashboardPriorityRow = {
  code: string;
  title: string | null;
  summary: string | null;
  status: string;
  priority: string;
  ownerTeam: string;
  updatedAt: string;
  regionCode: string;
};

export type RegionRow = {
  code: string;
  status: string;
  completionRate: number;
  blockedCount: number;
  updatedAt: string;
};

export type GenericRecordRow = {
  code: string;
  title: string | null;
  summary: string | null;
  status: string;
  priority: string | null;
  ownerTeam: string | null;
  assigneeTeam: string | null;
  requestedByTeam: string | null;
  dueDate: string | null;
  updatedAt: string | null;
  regionCode: string | null;
  kind: string | null;
  scope: string | null;
  issueCode: string | null;
  briefCode: string | null;
  taskCode: string | null;
  approvalCode: string | null;
  subjectCode: string | null;
  subjectType: string | null;
  source: string | null;
  locale: string | null;
  sensitivity: string | null;
};

export type DashboardSnapshot = {
  priorities: DashboardPriorityRow[];
  regions: RegionRow[];
  feedback: GenericRecordRow[];
  reviews: GenericRecordRow[];
  metrics: {
    openTasks: number;
    inReview: number;
    blocked: number;
    urgentFeedback: number;
  };
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ModuleSnapshot = {
  metrics: Array<{
    key: WorkspaceMetricKey;
    value: number;
  }>;
  records: GenericRecordRow[];
  pagination?: PaginationMetadata;
};

export type DetailFieldRow = {
  label: string;
  value: string;
};

export type SkillProviderSnapshot = {
  providers: GenericRecordRow[];
  skills: GenericRecordRow[];
};

export type SettingsSnapshot = {
  locales: number;
  retention: number;
  exports: number;
};

export type AdminSnapshot = {
  roles: number;
  audit: number;
  sensitive: number;
};

export interface WorkspaceReadService {
  getDashboardSnapshot(): DashboardSnapshot;
  getCoreModuleSnapshot(
    moduleId: CoreModuleId,
    pagination?: PaginationParams
  ): ModuleSnapshot;
  getSkillProviderSnapshot(): SkillProviderSnapshot;
  getSettingsSnapshot(): SettingsSnapshot;
  getAdminSnapshot(): AdminSnapshot;
}
