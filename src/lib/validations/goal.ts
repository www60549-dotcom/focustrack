import { z } from "zod";

export const goalStatusEnum = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "PAUSED",
]);

export const createGoalSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  deadline: z.string().optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().default(0),
  status: goalStatusEnum.optional().default("NOT_STARTED"),
});

export const updateGoalSchema = createGoalSchema.partial();
