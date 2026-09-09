import { z } from "zod";

export const createFocusSessionSchema = z.object({
  duration: z.number().int().min(1).max(240),
  mode: z.string().max(32).default("pomodoro"),
  taskId: z.string().cuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const completeFocusSessionSchema = z.object({
  actualDuration: z.number().int().min(0).max(240),
  completed: z.boolean().default(true),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateFocusSessionInput = z.infer<typeof createFocusSessionSchema>;
export type CompleteFocusSessionInput = z.infer<
  typeof completeFocusSessionSchema
>;
