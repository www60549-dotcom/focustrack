export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TaskCategoryDto {
  id: string;
  name: string;
  color: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  completedAt: string | null;
  isRecurring: boolean;
  recurrence: string | null;
  categoryId: string | null;
  category: TaskCategoryDto | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskViewFilter =
  | "all"
  | "today"
  | "upcoming"
  | "overdue"
  | "completed";

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};
