"use client";

import Link from "next/link";
import { Target, Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface DashboardHabit {
  id: string;
  name: string;
  completed: boolean;
  currentStreak: number;
  color?: string;
}

interface TodayHabitsProps {
  habits: DashboardHabit[];
  onToggle?: (id: string) => void;
}

export function TodayHabits({ habits, onToggle }: TodayHabitsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Today&apos;s Habits</CardTitle>
        <Link
          href="/habits?new=1"
          className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Link>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No habits yet"
            description="Build consistency by adding your first habit."
            action={
              <Link
                href="/habits?new=1"
                className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Add habit
              </Link>
            }
          />
        ) : (
          <ul className="space-y-1" role="list">
            {habits.map((habit) => (
              <li key={habit.id}>
                <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors">
                  <button
                    type="button"
                    onClick={() => onToggle?.(habit.id)}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      habit.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-transparent hover:border-primary/50"
                    )}
                    aria-label={
                      habit.completed
                        ? `Uncomplete ${habit.name}`
                        : `Complete ${habit.name}`
                    }
                    style={
                      !habit.completed && habit.color
                        ? { borderColor: habit.color }
                        : undefined
                    }
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/habits?id=${habit.id}`}
                    className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        habit.completed && "text-muted-foreground"
                      )}
                    >
                      {habit.name}
                    </p>
                    {habit.currentStreak > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {habit.currentStreak} day streak
                      </p>
                    )}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {habits.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <Link
              href="/habits"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all habits →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
