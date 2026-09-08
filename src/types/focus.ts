export type FocusMode = "pomodoro" | "short" | "long" | "custom";

export interface FocusSessionDto {
  id: string;
  taskId: string | null;
  taskTitle?: string | null;
  duration: number;
  actualDuration: number | null;
  mode: string;
  startedAt: string;
  endedAt: string | null;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

export const FOCUS_PRESETS = [
  { id: "pomodoro" as const, label: "Pomodoro", minutes: 25 },
  { id: "short" as const, label: "Short break", minutes: 5 },
  { id: "long" as const, label: "Long break", minutes: 15 },
  { id: "custom" as const, label: "Custom", minutes: 50 },
];
