"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Target,
  Timer,
  Flag,
  StickyNote,
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Search,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Cmd = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  keywords?: string;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands: Cmd[] = useMemo(
    () => [
      { id: "d", label: "Go to Dashboard", group: "Navigate", icon: LayoutDashboard, href: "/dashboard" },
      { id: "t", label: "Go to Tasks", group: "Navigate", icon: CheckSquare, href: "/tasks" },
      { id: "h", label: "Go to Habits", group: "Navigate", icon: Target, href: "/habits" },
      { id: "f", label: "Go to Focus", group: "Navigate", icon: Timer, href: "/focus", keywords: "pomodoro" },
      { id: "c", label: "Go to Calendar", group: "Navigate", icon: Calendar, href: "/calendar" },
      { id: "g", label: "Go to Goals", group: "Navigate", icon: Flag, href: "/goals" },
      { id: "n", label: "Go to Notes", group: "Navigate", icon: StickyNote, href: "/notes" },
      { id: "a", label: "Go to Analytics", group: "Navigate", icon: BarChart3, href: "/analytics" },
      { id: "s", label: "Go to Settings", group: "Navigate", icon: Settings, href: "/settings" },
      { id: "nt", label: "Create task", group: "Actions", icon: Plus, href: "/tasks?new=1", hint: "N", keywords: "new task" },
      { id: "sf", label: "Start focus session", group: "Actions", icon: Timer, href: "/focus", hint: "F" },
      { id: "ah", label: "Add habit", group: "Actions", icon: Target, href: "/habits", hint: "H" },
      { id: "ag", label: "Create goal", group: "Actions", icon: Flag, href: "/goals", hint: "G" },
      { id: "an", label: "Create note", group: "Actions", icon: StickyNote, href: "/notes" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        (c.keywords && c.keywords.includes(q))
    );
  }, [commands, query]);

  const run = useCallback(
    (cmd: Cmd) => {
      setOpen(false);
      setQuery("");
      if (cmd.href) router.push(cmd.href);
    },
    [router]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      if (!open && !typing) {
        const k = e.key.toLowerCase();
        if (k === "n") {
          e.preventDefault();
          router.push("/tasks?new=1");
        } else if (k === "f") {
          e.preventDefault();
          router.push("/focus");
        } else if (k === "h") {
          e.preventDefault();
          router.push("/habits");
        } else if (k === "g") {
          e.preventDefault();
          router.push("/goals");
        } else if (k === "c") {
          e.preventDefault();
          router.push("/calendar");
        }
      }

      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        run(filtered[active]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, run, router]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, actions…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Command search"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No results</p>
          ) : (
            groups.map((group) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <ul>
                  {filtered
                    .filter((c) => c.group === group)
                    .map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      const Icon = cmd.icon;
                      return (
                        <li key={cmd.id}>
                          <button
                            type="button"
                            onClick={() => run(cmd)}
                            onMouseEnter={() => setActive(idx)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                              idx === active
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="flex-1 truncate">{cmd.label}</span>
                            {cmd.hint && (
                              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {cmd.hint}
                              </kbd>
                            )}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground flex gap-3">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
