import { z } from "zod";

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const taskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  priority: priorityEnum.default("MEDIUM"),
  status: taskStatusEnum.default("TODO"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => !v || !Number.isNaN(Date.parse(v)),
      "Invalid date"
    ),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  categoryId: z.string().cuid().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurrence: z
    .enum(["daily", "weekdays", "weekly", "custom"])
    .optional()
    .nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().min(1).max(200).optional(),
  completedAt: z.string().datetime().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskFilterSchema = z.enum([
  "all",
  "today",
  "upcoming",
  "overdue",
  "completed",
]);

export type TaskFilter = z.infer<typeof taskFilterSchema>;
