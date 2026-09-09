"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flame,
  Pause,
  Play,
} from "lucide-react";
import type { HabitDto } from "@/types/habit";
import { FREQUENCY_LABELS } from "@/types/habit";
import { cn } from "@/lib/utils";

interface HabitItemProps {
  habit: HabitDto;
  onToggle: (id: string) => void;
  onEdit: (habit: HabitDto) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function HabitItem({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
}: HabitItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/30",
        !habit.isActive && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(habit.id)}
        disabled={!habit.isActive}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          habit.completedToday
            ? "border-transparent text-white"
            : "text-transparent hover:opacity-80"
        )}
        style={{
          backgroundColor: habit.completedToday ? habit.color : "transparent",
          borderColor: habit.completedToday ? habit.color : habit.color,
        }}
        aria-label={
          habit.completedToday
            ? `Uncomplete ${habit.name}`
            : `Complete ${habit.name}`
        }
      >
        <Check className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {habit.name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{FREQUENCY_LABELS[habit.frequency]}</span>
          {habit.currentStreak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-orange-500 dark:text-orange-400">
              <Flame className="h-3 w-3" />
              {habit.currentStreak} day
              {habit.currentStreak === 1 ? "" : "s"}
            </span>
          )}
          {habit.bestStreak > 0 && habit.bestStreak !== habit.currentStreak && (
            <span>Best: {habit.bestStreak}</span>
          )}
          {!habit.isActive && <span className="text-amber-600">Paused</span>}
        </div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
          aria-label="Habit actions"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 min-w-[150px] rounded-lg border border-border bg-popover py-1 shadow-md">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
              onClick={() => {
                setMenuOpen(false);
                onEdit(habit);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
              onClick={() => {
                setMenuOpen(false);
                onToggleActive(habit.id, !habit.isActive);
              }}
            >
              {habit.isActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Resume
                </>
              )}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent text-left"
              onClick={() => {
                setMenuOpen(false);
                onDelete(habit.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
