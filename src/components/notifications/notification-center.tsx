"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckSquare, Target, Flag, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type NoteItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  href?: string;
};

export function NotificationCenter({
  overdue = 0,
  habitsLeft = 0,
  goalsDueSoon = 0,
}: {
  overdue?: number;
  habitsLeft?: number;
  goalsDueSoon?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items: NoteItem[] = [];
  if (overdue > 0) {
    items.push({
      id: "overdue",
      title: `${overdue} overdue task${overdue === 1 ? "" : "s"}`,
      message: "Review and reschedule or complete them.",
      type: "task",
      href: "/tasks?filter=overdue",
    });
  }
  if (habitsLeft > 0) {
    items.push({
      id: "habits",
      title: `${habitsLeft} habit${habitsLeft === 1 ? "" : "s"} left today`,
      message: "Keep your streak going.",
      type: "habit",
      href: "/habits",
    });
  }
  if (goalsDueSoon > 0) {
    items.push({
      id: "goals",
      title: `${goalsDueSoon} goal deadline${goalsDueSoon === 1 ? "" : "s"} soon`,
      message: "Check progress on upcoming goals.",
      type: "goal",
      href: "/goals",
    });
  }

  const count = items.length;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const iconFor = (type: string) => {
    if (type === "habit") return Target;
    if (type === "goal") return Flag;
    if (type === "focus") return Timer;
    return CheckSquare;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {items.map((item) => {
                const Icon = iconFor(item.type);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href || "/dashboard"}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-3 py-2.5 hover:bg-muted/70 transition-colors"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.message}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
