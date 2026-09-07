"use client";

import Link from "next/link";
import { CheckSquare, Circle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface DashboardTask {
  id: string;
  title: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  categoryName?: string | null;
  dueTime?: string | null;
}

interface TodayTasksProps {
  tasks: DashboardTask[];
  onToggle?: (id: string) => void;
}

const priorityVariant: Record<
  DashboardTask["priority"],
  "secondary" | "warning" | "danger" | "default"
> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "danger",
};

export function TodayTasks({ tasks, onToggle }: TodayTasksProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Today's Tasks</CardTitle>
        <Link
          href="/tasks?new=1"
          className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks for today"
            description="You're all caught up. Add a task to get started."
            action={
              <Link
                href="/tasks?new=1"
                className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create task
              </Link>
            }
          />
        ) : (
          <ul className="space-y-1" role="list">
            {tasks.map((task) => (
              <li key={task.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggle?.(task.id)}
                    className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      task.completed
                        ? `Mark "${task.title}" incomplete`
                        : `Mark "${task.title}" complete`
                    }
                  >
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <Link
                    href={`/tasks?id=${task.id}`}
                    className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={priorityVariant[task.priority]}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {task.priority}
                      </Badge>
                      {task.categoryName && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {task.categoryName}
                        </span>
                      )}
                      {task.dueTime && (
                        <span className="text-[10px] text-muted-foreground">
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <Link
              href="/tasks"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all tasks →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
