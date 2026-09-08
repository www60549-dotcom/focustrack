export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";

export interface GoalDto {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  progress: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PAUSED: "Paused",
};
