import { startOfToday, endOfToday } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function buildUserContext(userId: string): Promise<string> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  try {
    const [tasksToday, overdue, habits, focusAgg, goals] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "CANCELLED" },
          OR: [
            { dueDate: { gte: todayStart, lte: todayEnd } },
            {
              dueDate: null,
              status: { not: "COMPLETED" },
              createdAt: { gte: todayStart, lte: todayEnd },
            },
          ],
        },
        select: { title: true, status: true, priority: true, dueTime: true },
        take: 20,
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: { notIn: ["COMPLETED", "CANCELLED"] },
          dueDate: { lt: todayStart },
        },
        select: { title: true, priority: true, dueDate: true },
        take: 15,
        orderBy: { dueDate: "asc" },
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
        select: {
          name: true,
          currentStreak: true,
          completions: { where: { date: todayStart }, take: 1 },
        },
        take: 20,
      }),
      prisma.focusSession.aggregate({
        where: {
          userId,
          completed: true,
          startedAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { actualDuration: true },
        _count: true,
      }),
      prisma.goal.findMany({
        where: { userId, status: { notIn: ["COMPLETED"] } },
        select: { name: true, progress: true, status: true },
        take: 10,
      }),
    ]);

    const lines: string[] = ["## User productivity snapshot (today)"];
    lines.push("\n### Today's tasks");
    if (tasksToday.length === 0) lines.push("- None scheduled");
    else
      for (const t of tasksToday)
        lines.push(
          `- [${t.status}] ${t.title} (priority: ${t.priority}${t.dueTime ? `, time: ${t.dueTime}` : ""})`
        );
    lines.push("\n### Overdue tasks");
    if (overdue.length === 0) lines.push("- None");
    else
      for (const t of overdue)
        lines.push(`- ${t.title} (priority: ${t.priority})`);
    lines.push("\n### Habits");
    if (habits.length === 0) lines.push("- No active habits");
    else
      for (const h of habits) {
        const done = h.completions.length > 0;
        lines.push(
          `- ${h.name}: ${done ? "done today" : "not done"} (streak: ${h.currentStreak})`
        );
      }
    const focusMin = focusAgg._sum.actualDuration ?? 0;
    lines.push(
      `\n### Focus today: ${focusMin} minutes across ${focusAgg._count} session(s)`
    );
    lines.push("\n### Active goals");
    if (goals.length === 0) lines.push("- None");
    else
      for (const g of goals)
        lines.push(`- ${g.name}: ${g.progress}% (${g.status})`);
    return lines.join("\n");
  } catch (error) {
    console.error("buildUserContext", error);
    return "## User productivity snapshot\n(Could not load data from database.)";
  }
}
