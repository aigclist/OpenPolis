import { z } from "zod";

import {
  PrioritySchema,
  SeveritySchema,
  TimestampSchema,
  type DashboardQuery
} from "@openpolis/contracts";

export const DashboardMetricSchema = z.object({
  key: z.enum(["open_tasks", "in_review", "blocked", "urgent_feedback"]),
  value: z.number().int().min(0)
});

export const DashboardPriorityItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  priority: PrioritySchema,
  ownerTeamId: z.string().min(1),
  updatedAt: TimestampSchema
});

export const DashboardFeedbackItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  severity: SeveritySchema,
  regionId: z.string().min(1).optional(),
  updatedAt: TimestampSchema
});

export const DashboardSnapshotSchema = z.object({
  metrics: z.array(DashboardMetricSchema),
  priorities: z.array(DashboardPriorityItemSchema),
  feedback: z.array(DashboardFeedbackItemSchema)
});

export type DashboardMetric = z.infer<typeof DashboardMetricSchema>;
export type DashboardPriorityItem = z.infer<typeof DashboardPriorityItemSchema>;
export type DashboardFeedbackItem = z.infer<typeof DashboardFeedbackItemSchema>;
export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>;

export interface DashboardQueryService {
  getSnapshot(query: DashboardQuery): Promise<DashboardSnapshot>;
}
