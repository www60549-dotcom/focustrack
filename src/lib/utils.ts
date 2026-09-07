import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calculateProductivityScore(params: {
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  focusMinutes: number;
  overdueTasks: number;
}): { score: number; breakdown: Record<string, number> } {
  const {
    tasksCompleted,
    tasksTotal,
    habitsCompleted,
    habitsTotal,
    focusMinutes,
    overdueTasks,
  } = params;

  const taskScore =
    tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 35) : 0;
  const habitScore =
    habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 25) : 0;
  const focusScore = Math.min(20, Math.round((focusMinutes / 120) * 20));
  const overduePenalty = Math.min(15, overdueTasks * 3);

  const score = Math.max(
    0,
    Math.min(100, taskScore + habitScore + focusScore - overduePenalty)
  );

  return {
    score,
    breakdown: {
      tasks: taskScore,
      habits: habitScore,
      focus: focusScore,
      overdue: -overduePenalty,
    },
  };
}
