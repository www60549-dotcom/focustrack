import {
  startOfDay,
  subDays,
  isSameDay,
  isWeekend,
  getDay,
} from "date-fns";
import type { HabitFrequency } from "@/types/habit";

/**
 * Whether a habit is scheduled on a given date.
 */
export function isHabitDueOn(
  frequency: HabitFrequency,
  selectedDays: number[],
  date: Date
): boolean {
  const day = getDay(date); // 0 = Sun … 6 = Sat
  switch (frequency) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return !isWeekend(date);
    case "WEEKLY":
      return true;
    case "CUSTOM":
      return selectedDays.includes(day);
    default:
      return true;
  }
}

/**
 * Recalculate current and best streak from completion dates.
 */
export function calculateStreaks(
  completionDates: Date[],
  frequency: HabitFrequency,
  selectedDays: number[],
  today: Date = new Date()
): { currentStreak: number; bestStreak: number } {
  if (completionDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const normalized = completionDates
    .map((d) => startOfDay(d).getTime())
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b - a)
    .map((t) => new Date(t));

  const completedSet = new Set(normalized.map((d) => d.getTime()));

  let best = 0;
  let run = 0;
  const allDaysAsc = [...normalized].reverse();
  for (let i = 0; i < allDaysAsc.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = allDaysAsc[i - 1];
      const curr = allDaysAsc[i];
      const dayDiff = Math.round(
        (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff === 1) {
        run += 1;
      } else if (dayDiff > 1) {
        let allSkipped = true;
        for (let g = 1; g < dayDiff; g++) {
          const mid = subDays(curr, dayDiff - g);
          if (isHabitDueOn(frequency, selectedDays, mid)) {
            allSkipped = false;
            break;
          }
        }
        if (allSkipped) {
          run += 1;
        } else {
          run = 1;
        }
      } else {
        run = 1;
      }
    }
    best = Math.max(best, run);
  }

  let current = 0;
  let cursor = startOfDay(today);

  if (
    isHabitDueOn(frequency, selectedDays, cursor) &&
    !completedSet.has(cursor.getTime())
  ) {
    cursor = subDays(cursor, 1);
  }

  for (let i = 0; i < 400; i++) {
    if (!isHabitDueOn(frequency, selectedDays, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    if (completedSet.has(cursor.getTime())) {
      current += 1;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  return {
    currentStreak: current,
    bestStreak: Math.max(best, current),
  };
}

export function toDateOnly(d: Date = new Date()): Date {
  return startOfDay(d);
}
