import { z } from "zod";

import {
  PrioritySchema,
  TimestampSchema,
  type ModuleListQuery
} from "@openpolis/contracts";

export const ModuleRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  priority: PrioritySchema.optional(),
  ownerTeamId: z.string().min(1).optional(),
  regionId: z.string().min(1).optional(),
  dueAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional()
});

export const ModuleSnapshotSchema = z.object({
  metrics: z.array(
    z.object({
      key: z.string().min(1),
      value: z.number().int().min(0)
    })
  ),
  records: z.array(ModuleRecordSchema)
});

export type ModuleRecord = z.infer<typeof ModuleRecordSchema>;
export type ModuleSnapshot = z.infer<typeof ModuleSnapshotSchema>;

export interface ModuleQueryService {
  list(query: ModuleListQuery): Promise<ModuleSnapshot>;
}
