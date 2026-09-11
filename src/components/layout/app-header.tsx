"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Search, PanelLeft } from "lucide-react";
import { mainNavItems, bottomNavItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/notification-center";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-day": "My Day",
  "/tasks": "Tasks",
  "/habits": "Habits",
  "/focus": "Focus",
  "/calendar": "Calendar",
  "/goals": "Goals",
  "/notes": "Notes",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function AppHeader({
  overdue = 0,
  habitsLeft = 0,
}: {
  overdue?: number;
  habitsLeft?: number;
} = {}) {
  const pathname = usePathname();
  const match =
    [...mainNavItems, ...bottomNavItems].find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    )?.title ||
    titles[pathname] ||
    "FocusTrack";

  return (
    <header className="hidden md:flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5 lg:px-6 min-h-[52px]">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
          title="Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <h1 className="text-[15px] font-semibold text-foreground truncate tracking-tight">
          {match}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            readOnly
            placeholder="Search… ⌘K"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }
            }}
            className="h-8 w-48 cursor-pointer rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open command menu"
          />
        </div>
        <NotificationCenter overdue={overdue} habitsLeft={habitsLeft} />
        <Link
          href="/tasks?new=1"
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-8 gap-1.5 text-xs font-medium shadow-sm"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </Link>
      </div>
    </header>
  );
}
