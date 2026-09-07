"use client";

import { format, isToday, isPast, parseISO } from "date-fns";
import {
  Circle,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TaskDto, Priority } from "@/types/task";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface TaskItemProps {
  task: TaskDto;
  onToggle: (id: string) => void;
  onEdit: (task: TaskDto) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
}

const priorityVariant: Record<
  Priority,
  "secondary" | "default" | "warning" | "danger"
> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "danger",
};

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onRestore,
}: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const completed = task.status === "COMPLETED";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  let dueLabel: string | null = null;
  let dueOverdue = false;
  if (task.dueDate) {
    try {
      const d = parseISO(task.dueDate);
      if (isToday(d)) {
        dueLabel = task.dueTime ? `Today ${task.dueTime}` : "Today";
      } else {
        dueLabel = format(d, "MMM d");
        if (task.dueTime) dueLabel += ` ${task.dueTime}`;
      }
      if (!completed && isPast(d) && !isToday(d)) {
        dueOverdue = true;
      }
    } catch {
      dueLabel = null;
    }
  }

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/30",
        completed && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className="mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={completed ? `Mark incomplete: ${task.title}` : `Complete: ${task.title}`}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium text-foreground leading-snug",
            completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge
            variant={priorityVariant[task.priority]}
            className="text-[10px] px-1.5 py-0"
          >
            {task.priority}
          </Badge>
          {task.category && (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: task.category.color }}
                aria-hidden
              />
              {task.category.name}
            </span>
          )}
          {dueLabel && (
            <span
              className={cn(
                "text-[10px] font-medium",
                dueOverdue
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {dueLabel}
            </span>
          )}
          {task.isRecurring && (
            <span className="text-[10px] text-muted-foreground">
              ↻ {task.recurrence}
            </span>
          )}
        </div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
          aria-label="Task actions"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-md">
            {!completed && (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {completed && onRestore && (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                onClick={() => {
                  setMenuOpen(false);
                  onRestore(task.id);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </button>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent text-left"
              onClick={() => {
                setMenuOpen(false);
                onDelete(task.id);
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
