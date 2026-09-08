import { z } from "zod";

export const habitFrequencyEnum = z.enum([
  "DAILY",
  "WEEKDAYS",
  "WEEKLY",
  "CUSTOM",
]);

export const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(50).optional().default("check-circle"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
    .optional()
    .default("#22c55e"),
  frequency: habitFrequencyEnum.default("DAILY"),
  selectedDays: z.array(z.number().int().min(0).max(6)).optional().default([]),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  goal: z.number().int().positive().optional().nullable(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
