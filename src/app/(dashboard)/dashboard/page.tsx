import { format, startOfToday, endOfToday } from "date-fns";
import {
  CheckSquare,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getGreeting,
  calculateProductivityScore,
  formatDuration,
} from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { FocusWidget } from "@/components/dashboard/focus-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "there";

  let tasksCompleted = 0;
  let tasksTotal = 0;
  let habitsCompleted = 0;
  let habitsTotal = 0;
  let focusMinutesToday = 0;
  let sessionsToday = 0;
  let overdueTasks = 0;
  let currentStreak = 0;

  const todayTasks: {
    id: string;
    title: string;
    completed: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    categoryName?: string | null;
    dueTime?: string | null;
  }[] = [];

  const todayHabits: {
    id: string;
    name: string;
    completed: boolean;
    currentStreak: number;
    color?: string;
  }[] = [];

  if (user?.id) {
    try {
      // Ensure user row exists
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email || `${user.id}@user.local`,
          name,
          profile: { create: {} },
          settings: { create: {} },
        },
        update: {},
      });

      const todayStart = startOfToday();
      const todayEnd = endOfToday();

      const [allActive, completedToday, overdue, focusAgg] = await Promise.all([
        prisma.task.findMany({
          where: {
            userId: user.id,
            status: { notIn: ["CANCELLED"] },
            OR: [
              { dueDate: { gte: todayStart, lte: todayEnd } },
              {
                dueDate: null,
                status: { not: "COMPLETED" },
              },
              {
                status: "COMPLETED",
                completedAt: { gte: todayStart, lte: todayEnd },
              },
            ],
          },
          include: {
            category: { select: { name: true } },
          },
          orderBy: [{ priority: "asc" }, { order: "asc" }],
          take: 20,
        }),
        prisma.task.count({
          where: {
            userId: user.id,
            status: "COMPLETED",
            completedAt: { gte: todayStart, lte: todayEnd },
          },
        }),
        prisma.task.count({
          where: {
            userId: user.id,
            status: { notIn: ["COMPLETED", "CANCELLED"] },
            dueDate: { lt: todayStart },
          },
        }),
        prisma.focusSession.aggregate({
          where: {
            userId: user.id,
            startedAt: { gte: todayStart, lte: todayEnd },
            completed: true,
          },
          _sum: { actualDuration: true },
          _count: true,
        }),
      ]);

      tasksTotal = allActive.length;
      tasksCompleted = allActive.filter((t) => t.status === "COMPLETED").length;
      // Prefer count of completed today if list is mixed
      if (completedToday > tasksCompleted) tasksCompleted = completedToday;
      overdueTasks = overdue;
      focusMinutesToday = focusAgg._sum.actualDuration || 0;
      sessionsToday = focusAgg._count;

      for (const t of allActive.slice(0, 8)) {
        todayTasks.push({
          id: t.id,
          title: t.title,
          completed: t.status === "COMPLETED",
          priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          categoryName: t.category?.name ?? null,
          dueTime: t.dueTime,
        });
      }

      // Habits for today
      const habits = await prisma.habit.findMany({
        where: { userId: user.id, isActive: true },
        include: {
          completions: {
            where: {
              date: todayStart,
            },
            take: 1,
          },
        },
        take: 10,
      });
      habitsTotal = habits.length;
      habitsCompleted = habits.filter((h) => h.completions.length > 0).length;
      currentStreak = Math.max(0, ...habits.map((h) => h.currentStreak), 0);

      for (const h of habits) {
        todayHabits.push({
          id: h.id,
          name: h.name,
          completed: h.completions.length > 0,
          currentStreak: h.currentStreak,
          color: h.color,
        });
      }
    } catch (e) {
      console.error("Dashboard data load failed (DB may be unavailable):", e);
    }
  }

  const { score, breakdown } = calculateProductivityScore({
    tasksCompleted,
    tasksTotal,
    habitsCompleted,
    habitsTotal,
    focusMinutes: focusMinutesToday,
    overdueTasks,
  });

  const taskPct =
    tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const habitPct =
    habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

  const greeting = getGreeting();
  const todayLabel = format(new Date(), "EEEE, MMMM d, yyyy");

  const motivational =
    score >= 80
      ? "Outstanding focus today — keep the momentum going."
      : score >= 50
        ? "Solid progress. A few more wins will push you further."
        : tasksTotal === 0 && habitsTotal === 0
          ? "Start your day by adding a task or completing a habit."
          : "Every small step counts. You’ve got this.";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greeting}, {name} 👋
        </h1>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
        <p className="text-sm text-muted-foreground max-w-xl">{motivational}</p>
      </header>

      <section
        aria-label="Productivity overview"
        className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Today's Tasks"
          value={tasksTotal === 0 ? "—" : `${tasksCompleted}/${tasksTotal}`}
          subtitle={
            tasksTotal === 0 ? "No tasks scheduled" : `${taskPct}% complete`
          }
          icon={CheckSquare}
        />
        <StatCard
          title="Habits"
          value={
            habitsTotal === 0 ? "—" : `${habitsCompleted}/${habitsTotal}`
          }
          subtitle={
            habitsTotal === 0
              ? "No habits yet"
              : currentStreak > 0
                ? `${currentStreak}-day streak`
                : `${habitPct}% complete`
          }
          icon={Target}
        />
        <StatCard
          title="Focus Time"
          value={formatDuration(focusMinutesToday)}
          subtitle={
            sessionsToday === 0
              ? "No sessions yet"
              : `${sessionsToday} session${sessionsToday === 1 ? "" : "s"}`
          }
          icon={Timer}
        />
        <StatCard
          title="Productivity Score"
          value={score}
          subtitle={`Tasks ${breakdown.tasks >= 0 ? "+" : ""}${breakdown.tasks} · Habits ${breakdown.habits >= 0 ? "+" : ""}${breakdown.habits} · Focus ${breakdown.focus >= 0 ? "+" : ""}${breakdown.focus}`}
          icon={TrendingUp}
        />
      </section>

      <QuickActions />

      <section className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <TodayTasks tasks={todayTasks} />
        <TodayHabits habits={todayHabits} />
      </section>

      <section className="max-w-md">
        <FocusWidget
          focusMinutesToday={focusMinutesToday}
          sessionsToday={sessionsToday}
        />
      </section>
    </div>
  );
}
