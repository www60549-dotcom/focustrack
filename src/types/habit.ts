export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKLY" | "CUSTOM";

export interface HabitDto {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  selectedDays: number[];
  reminderTime: string | null;
  startDate: string;
  goal: number | null;
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  DAILY: "Daily",
  WEEKDAYS: "Weekdays",
  WEEKLY: "Weekly",
  CUSTOM: "Custom days",
};

export const HABIT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
];
