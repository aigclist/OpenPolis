import { z } from "zod";

import { ActorRefSchema, EntityIdSchema } from "../primitives";

export const WorkspaceModuleSchema = z.enum([
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
  "ai_workspace",
  "skills"
]);

export const DashboardQuerySchema = z.object({
  actor: ActorRefSchema,
  regionIds: z.array(EntityIdSchema).optional(),
  includeAgentQueues: z.boolean().default(true)
});

export const ModuleListQuerySchema = z.object({
  actor: ActorRefSchema,
  module: WorkspaceModuleSchema,
  regionIds: z.array(EntityIdSchema).optional(),
  teamIds: z.array(EntityIdSchema).optional(),
  status: z.array(z.string().min(1).max(64)).optional()
});

export type WorkspaceModule = z.infer<typeof WorkspaceModuleSchema>;
export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type ModuleListQuery = z.infer<typeof ModuleListQuerySchema>;
