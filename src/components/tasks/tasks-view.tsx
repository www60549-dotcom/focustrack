"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, CheckSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskItem } from "./task-item";
import { TaskForm, type TaskFormValues } from "./task-form";
import type { TaskDto, TaskViewFilter } from "@/types/task";
import { cn } from "@/lib/utils";

const FILTERS: { id: TaskViewFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

export function TasksView({
  initialFilter = "today",
  openCreate = false,
}: {
  initialFilter?: TaskViewFilter;
  openCreate?: boolean;
}) {
  const [filter, setFilter] = useState<TaskViewFilter>(initialFilter);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [formOpen, setFormOpen] = useState(openCreate);
  const [editing, setEditing] = useState<TaskDto | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (searchDebounced) params.set("q", searchDebounced);
      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load tasks");
      }
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
      setTasks([]);
      // Soft fail when DB not configured
      if (err instanceof Error && !err.message.includes("Unauthorized")) {
        toast.error("Could not load tasks. Check database connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [filter, searchDebounced]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(values: TaskFormValues) {
    const body = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      dueDate: values.dueDate
        ? new Date(values.dueDate + "T12:00:00").toISOString()
        : null,
      dueTime: values.dueTime || null,
      isRecurring: values.isRecurring,
      recurrence: values.recurrence || null,
    };
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    toast.success("Task created");
    await loadTasks();
  }

  async function handleUpdate(values: TaskFormValues) {
    if (!editing) return;
    const body = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      dueDate: values.dueDate
        ? new Date(values.dueDate + "T12:00:00").toISOString()
        : null,
      dueTime: values.dueTime || null,
      isRecurring: values.isRecurring,
      recurrence: values.recurrence || null,
    };
    const res = await fetch(`/api/tasks/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    toast.success("Task updated");
    setEditing(null);
    await loadTasks();
  }

  async function handleToggle(id: string) {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "COMPLETED" ? "TODO" : "COMPLETED",
              completedAt:
                t.status === "COMPLETED" ? null : new Date().toISOString(),
            }
          : t
      )
    );
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleComplete: true }),
      });
      if (!res.ok) {
        await loadTasks();
        toast.error("Failed to update task");
      }
    } catch {
      await loadTasks();
      toast.error("Failed to update task");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        await loadTasks();
        toast.error("Failed to delete");
      } else {
        toast.success("Task deleted");
      }
    } catch {
      await loadTasks();
      toast.error("Failed to delete");
    }
  }

  async function handleRestore(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TODO" }),
      });
      if (!res.ok) toast.error("Failed to restore");
      else {
        toast.success("Task restored");
        await loadTasks();
      }
    } catch {
      toast.error("Failed to restore");
    }
  }

  const emptyCopy: Record<TaskViewFilter, { title: string; desc: string }> = {
    today: {
      title: "No tasks for today",
      desc: "You're all caught up. Create a task to get started.",
    },
    upcoming: {
      title: "No upcoming tasks",
      desc: "Tasks with future due dates will appear here.",
    },
    overdue: {
      title: "No overdue tasks",
      desc: "Great — nothing is past due.",
    },
    completed: {
      title: "No completed tasks",
      desc: "Completed tasks will show up here.",
    },
    all: {
      title: "No tasks yet",
      desc: "Create your first task to start organizing your day.",
    },
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize and track what needs to get done
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
          New task
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div
          className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1"
          role="tablist"
          aria-label="Task filters"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={emptyCopy[filter].title}
          description={emptyCopy[filter].desc}
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New task
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2" role="list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
        </ul>
      )}

      <TaskForm
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
