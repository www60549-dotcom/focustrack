"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  subDays,
  format,
  startOfToday,
  isSameDay,
} from "date-fns";
import { cn } from "@/lib/utils";

export function HabitHeatmap({
  completedDates,
  weeks = 12,
}: {
  completedDates: string[];
  weeks?: number;
}) {
  const today = startOfToday();
  const start = subDays(today, weeks * 7 - 1);
  const days = eachDayOfInterval({ start, end: today });

  const set = useMemo(() => new Set(completedDates), [completedDates]);

  const cols: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    cols.push(days.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Consistency</p>
        <p className="text-[11px] text-muted-foreground">Last {weeks} weeks</p>
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {cols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const done = set.has(key);
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={key}
                  title={`${format(d, "MMM d")}${done ? " · completed" : ""}`}
                  className={cn(
                    "h-2.5 w-2.5 rounded-[3px] transition-colors",
                    done ? "bg-primary" : "bg-muted",
                    isToday && "ring-1 ring-primary/50"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-primary/40" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
