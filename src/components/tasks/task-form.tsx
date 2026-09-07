"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TaskDto, Priority } from "@/types/task";
import { PRIORITY_LABELS } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  initial?: TaskDto | null;
  mode?: "create" | "edit";
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  isRecurring: boolean;
  recurrence: string;
}

const empty: TaskFormValues = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  dueTime: "",
  isRecurring: false,
  recurrence: "",
};

export function TaskForm({
  open,
  onClose,
  onSubmit,
  initial,
  mode = "create",
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        setValues({
          title: initial.title,
          description: initial.description || "",
          priority: initial.priority,
          dueDate: initial.dueDate
            ? initial.dueDate.slice(0, 10)
            : "",
          dueTime: initial.dueTime || "",
          isRecurring: initial.isRecurring,
          recurrence: initial.recurrence || "",
        });
      } else {
        setValues(empty);
      }
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-card z-10">
          <h2 id="task-form-title" className="text-lg font-semibold">
            {mode === "edit" ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={values.title}
              onChange={(e) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              placeholder="Optional details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={values.priority}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    priority: e.target.value as Priority,
                  }))
                }
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={values.dueDate}
                onChange={(e) =>
                  setValues((v) => ({ ...v, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due-time">Due time</Label>
              <Input
                id="task-due-time"
                type="time"
                value={values.dueTime}
                onChange={(e) =>
                  setValues((v) => ({ ...v, dueTime: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-recurrence">Recurrence</Label>
              <select
                id="task-recurrence"
                value={values.isRecurring ? values.recurrence || "daily" : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setValues((v) => ({
                    ...v,
                    isRecurring: !!val,
                    recurrence: val || "",
                  }));
                }}
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "edit" ? (
                "Save changes"
              ) : (
                "Create task"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
