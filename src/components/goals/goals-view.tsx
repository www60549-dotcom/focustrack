"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Target, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import type { GoalDto, GoalStatus } from "@/types/goal";
import { GOAL_STATUS_LABELS } from "@/types/goal";
import { cn } from "@/lib/utils";

export function GoalsView() {
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setGoals(data.goals || []);
    } catch {
      setGoals([]);
      toast.error("Could not load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Goal created");
      setName("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function updateProgress(id: string, progress: number) {
    const status: GoalStatus =
      progress >= 100
        ? "COMPLETED"
        : progress > 0
          ? "IN_PROGRESS"
          : "NOT_STARTED";
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress, status } : g))
    );
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress, status }),
      });
      if (!res.ok) await load();
    } catch {
      await load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete");
        await load();
      } else {
        toast.success("Deleted");
      }
    } catch {
      toast.error("Failed to delete");
      await load();
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track long-term objectives and progress
        </p>
      </header>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New goal..."
          className="flex-1"
        />
        <Button type="submit" disabled={creating || !name.trim()}>
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create a goal to track your progress."
        />
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li
              key={g.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {GOAL_STATUS_LABELS[g.status]} · {g.progress}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(g.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={g.progress}
                  onChange={(e) =>
                    void updateProgress(g.id, Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span
                  className={cn(
                    "text-xs font-medium w-10 text-right",
                    g.progress >= 100 && "text-green-600"
                  )}
                >
                  {g.progress}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
