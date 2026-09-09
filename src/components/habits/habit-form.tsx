"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { HabitDto, HabitFrequency } from "@/types/habit";
import { FREQUENCY_LABELS, HABIT_COLORS } from "@/types/habit";
import { cn } from "@/lib/utils";

export interface HabitFormValues {
  name: string;
  description: string;
  color: string;
  frequency: HabitFrequency;
  selectedDays: number[];
  reminderTime: string;
}

const empty: HabitFormValues = {
  name: "",
  description: "",
  color: "#22c55e",
  frequency: "DAILY",
  selectedDays: [],
  reminderTime: "",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormValues) => Promise<void>;
  initial?: HabitDto | null;
  mode?: "create" | "edit";
}

export function HabitForm({
  open,
  onClose,
  onSubmit,
  initial,
  mode = "create",
}: HabitFormProps) {
  const [values, setValues] = useState<HabitFormValues>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        setValues({
          name: initial.name,
          description: initial.description || "",
          color: initial.color,
          frequency: initial.frequency,
          selectedDays: initial.selectedDays || [],
          reminderTime: initial.reminderTime || "",
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
    if (!values.name.trim()) {
      setError("Name is required");
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

  function toggleDay(day: number) {
    setValues((v) => ({
      ...v,
      selectedDays: v.selectedDays.includes(day)
        ? v.selectedDays.filter((d) => d !== day)
        : [...v.selectedDays, day].sort(),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-form-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-card z-10">
          <h2 id="habit-form-title" className="text-lg font-semibold">
            {mode === "edit" ? "Edit habit" : "New habit"}
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
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
              placeholder="e.g. Morning stretch"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-desc">Description</Label>
            <Textarea
              id="habit-desc"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, color: c }))}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    values.color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-freq">Frequency</Label>
            <select
              id="habit-freq"
              value={values.frequency}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  frequency: e.target.value as HabitFrequency,
                }))
              }
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {(Object.keys(FREQUENCY_LABELS) as HabitFrequency[]).map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          {values.frequency === "CUSTOM" && (
            <div className="space-y-1.5">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-1.5">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "h-9 min-w-[2.5rem] rounded-lg px-2 text-xs font-medium transition-colors",
                      values.selectedDays.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="habit-reminder">Reminder (optional)</Label>
            <Input
              id="habit-reminder"
              type="time"
              value={values.reminderTime}
              onChange={(e) =>
                setValues((v) => ({ ...v, reminderTime: e.target.value }))
              }
            />
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
                "Create habit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
