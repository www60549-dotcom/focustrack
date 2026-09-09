import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).default(""),
  isPinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();
