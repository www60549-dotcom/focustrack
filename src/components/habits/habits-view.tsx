"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Target, Loader2, Flame } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HabitItem } from "./habit-item";
import { HabitForm, type HabitFormValues } from "./habit-form";
import type { HabitDto } from "@/types/habit";
import { cn } from "@/lib/utils";

export function HabitsView({ openCreate = false }: { openCreate?: boolean }) {
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(openCreate);
  const [editing, setEditing] = useState<HabitDto | null>(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/habits?active=${showInactive ? "0" : "1"}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setHabits(data.habits || []);
    } catch (err) {
      console.error(err);
      setHabits([]);
      if (err instanceof Error && !err.message.includes("Unauthorized")) {
        toast.error("Could not load habits. Check database connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  async function handleCreate(values: HabitFormValues) {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        description: values.description.trim() || null,
        color: values.color,
        frequency: values.frequency,
        selectedDays: values.selectedDays,
        reminderTime: values.reminderTime || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    toast.success("Habit created");
    await loadHabits();
  }

  async function handleUpdate(values: HabitFormValues) {
    if (!editing) return;
    const res = await fetch(`/api/habits/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        description: values.description.trim() || null,
        color: values.color,
        frequency: values.frequency,
        selectedDays: values.selectedDays,
        reminderTime: values.reminderTime || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    toast.success("Habit updated");
    setEditing(null);
    await loadHabits();
  }

  async function handleToggle(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              currentStreak: !h.completedToday
                ? h.currentStreak + 1
                : Math.max(0, h.currentStreak - 1),
            }
          : h
      )
    );
    try {
      const res = await fetch(`/api/habits/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        await loadHabits();
        toast.error("Failed to update habit");
        return;
      }
      const data = await res.json();
      if (data.habit) {
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? { ...h, ...data.habit } : h))
        );
      }
    } catch {
      await loadHabits();
      toast.error("Failed to update habit");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this habit and its history?")) return;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      if (!res.ok) {
        await loadHabits();
        toast.error("Failed to delete");
      } else {
        toast.success("Habit deleted");
      }
    } catch {
      await loadHabits();
      toast.error("Failed to delete");
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      toast.success(isActive ? "Habit resumed" : "Habit paused");
      await loadHabits();
    } catch {
      toast.error("Failed to update");
    }
  }

  const completedCount = habits.filter((h) => h.completedToday).length;
  const maxStreak = Math.max(0, ...habits.map((h) => h.currentStreak), 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build consistency day by day
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          New habit
        </Button>
      </header>

      {!loading && habits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-xl font-semibold mt-0.5">
              {completedCount}/{habits.filter((h) => h.isActive).length || habits.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Best streak</p>
            <p className="text-xl font-semibold mt-0.5 inline-flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              {maxStreak}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Total habits</p>
            <p className="text-xl font-semibold mt-0.5">{habits.length}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowInactive(false)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            !showInactive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setShowInactive(true)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            showInactive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading habits...
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No habits yet"
          description="Create your first habit to start building streaks."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New habit
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2" role="list">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onEdit={(h) => {
                setEditing(h);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </ul>
      )}

      <HabitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        mode={editing ? "edit" : "create"}
      />
    </div>
  );
}
