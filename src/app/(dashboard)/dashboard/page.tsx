import { format, startOfToday, endOfToday } from "date-fns";
import {
  CheckSquare,
  Target,
  Timer,
  TrendingUp,
  Play,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getGreeting,
  calculateProductivityScore,
  formatDuration,
} from "@/lib/utils";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { GoalsProgress } from "@/components/dashboard/goals-progress";
import { ActivityList } from "@/components/dashboard/activity-list";
import { ProgressRing } from "@/components/motion/progress-ring";

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

  const goals: {
    id: string;
    name: string;
    progress: number;
    status: string;
    deadline: string | null;
  }[] = [];

  if (user?.id) {
    try {
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
            OR: [
              { status: { notIn: ["COMPLETED", "CANCELLED"] } },
              {
                status: "COMPLETED",
                completedAt: { gte: todayStart, lte: todayEnd },
              },
            ],
          },
          include: { category: true },
          orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
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

      const habits = await prisma.habit.findMany({
        where: { userId: user.id, isActive: true },
        include: {
          completions: {
            where: { date: todayStart },
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

      const activeGoals = await prisma.goal.findMany({
        where: {
          userId: user.id,
          status: { notIn: ["COMPLETED"] },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
      });
      for (const g of activeGoals) {
        goals.push({
          id: g.id,
          name: g.name,
          progress: g.progress,
          status: g.status,
          deadline: g.deadline?.toISOString() ?? null,
        });
      }
    } catch (e) {
      console.error("Dashboard data load failed (DB may be unavailable):", e);
    }
  }

  const { score } = calculateProductivityScore({
    tasksCompleted,
    tasksTotal,
    habitsCompleted,
    habitsTotal,
    focusMinutes: focusMinutesToday,
    overdueTasks,
  });

  const greeting = getGreeting();
  const todayLabel = format(new Date(), "EEEE, MMMM d");
  const nextTask = todayTasks.find((t) => !t.completed);

  return (
    <div className="space-y-5">
      <section className="hero-panel relative overflow-hidden rounded-xl text-white animate-in fade-in slide-in-from-top-1">
        <div className="relative z-10 p-5 sm:p-6 lg:p-7">
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-3 space-y-5">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                  {todayLabel}
                </p>
                <h1 className="text-2xl sm:text-[1.85rem] font-semibold tracking-tight leading-tight">
                  Dashboard
                </h1>
                <p className="text-sm text-white/80">
                  {greeting}, {name}. Stay focused. Get things done.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <HeroStat
                  className="animate-in fade-in slide-in-from-bottom-2 stagger-1"
                  icon={<CheckSquare className="h-3.5 w-3.5" />}
                  label="TODAY'S TASKS"
                  value={
                    tasksTotal === 0 ? "—" : `${tasksCompleted} / ${tasksTotal}`
                  }
                  hint="Tasks completed"
                />
                <HeroStat
                  className="animate-in fade-in slide-in-from-bottom-2 stagger-2"
                  icon={<Target className="h-3.5 w-3.5" />}
                  label="ACTIVE HABITS"
                  value={
                    habitsTotal === 0
                      ? "—"
                      : `${habitsCompleted} / ${habitsTotal}`
                  }
                  hint={
                    currentStreak > 0
                      ? `${currentStreak}d best streak`
                      : "Completed today"
                  }
                />
                <HeroStat
                  className="animate-in fade-in slide-in-from-bottom-2 stagger-3"
                  icon={<Timer className="h-3.5 w-3.5" />}
                  label="FOCUS TIME"
                  value={formatDuration(focusMinutesToday)}
                  hint={
                    sessionsToday > 0
                      ? `${sessionsToday} session${sessionsToday === 1 ? "" : "s"}`
                      : "Focused today"
                  }
                />
                <HeroStat
                  className="animate-in fade-in slide-in-from-bottom-2 stagger-4"
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  label="PRODUCTIVITY"
                  value={`${score}%`}
                  hint="Today's score"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="h-full rounded-xl bg-white text-foreground shadow-lg p-4 sm:p-5 flex flex-col animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold">Today&apos;s Focus</p>
                  <Link
                    href="/focus"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Timer className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {nextTask?.title || "Deep Work"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sessionsToday > 0
                          ? `${sessionsToday} session${sessionsToday === 1 ? "" : "s"} · ${formatDuration(focusMinutesToday)}`
                          : "25 min · Ready"}
                      </p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Ready
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/focus"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Start Focus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <TodayTasks tasks={todayTasks} />
          <TodayHabits habits={todayHabits} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] p-4 flex items-center gap-4">
            <ProgressRing
              value={score}
              size={100}
              stroke={7}
              label="Score"
              sublabel={
                score >= 80
                  ? "Great day"
                  : score >= 50
                    ? "Solid progress"
                    : "Keep going"
              }
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold">Productivity score</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tasks {tasksCompleted}/{tasksTotal || 0} · Habits{" "}
                {habitsCompleted}/{habitsTotal || 0} · Focus{" "}
                {formatDuration(focusMinutesToday)}
              </p>
              {overdueTasks > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {overdueTasks} overdue reducing score
                </p>
              )}
            </div>
          </div>
          <GoalsProgress goals={goals} />
          <ActivityList
            tasksCompleted={tasksCompleted}
            habitsCompleted={habitsCompleted}
            sessionsToday={sessionsToday}
          />
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  hint,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg bg-white/12 ring-1 ring-white/15 px-3.5 py-3 backdrop-blur-[2px] hover:bg-white/16 transition-colors ${className || ""}`}
    >
      <div className="flex items-center gap-1.5 text-white/75 text-[10px] font-semibold tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-white/65">{hint}</p>
    </div>
  );
}
