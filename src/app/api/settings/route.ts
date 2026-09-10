import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  theme: z.enum(["system", "light", "dark"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  taskReminders: z.boolean().optional(),
  habitReminders: z.boolean().optional(),
  pomodoroWork: z.number().int().min(5).max(120).optional(),
  pomodoroBreak: z.number().int().min(1).max(60).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: data.theme ?? "system",
        notificationsEnabled: data.notificationsEnabled ?? true,
        taskReminders: data.taskReminders ?? true,
        habitReminders: data.habitReminders ?? true,
        pomodoroWork: data.pomodoroWork ?? 25,
        pomodoroBreak: data.pomodoroBreak ?? 5,
      },
      update: {
        ...(data.theme !== undefined ? { theme: data.theme } : {}),
        ...(data.notificationsEnabled !== undefined
          ? { notificationsEnabled: data.notificationsEnabled }
          : {}),
        ...(data.taskReminders !== undefined
          ? { taskReminders: data.taskReminders }
          : {}),
        ...(data.habitReminders !== undefined
          ? { habitReminders: data.habitReminders }
          : {}),
        ...(data.pomodoroWork !== undefined
          ? { pomodoroWork: data.pomodoroWork }
          : {}),
        ...(data.pomodoroBreak !== undefined
          ? { pomodoroBreak: data.pomodoroBreak }
          : {}),
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PATCH /api/settings", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
