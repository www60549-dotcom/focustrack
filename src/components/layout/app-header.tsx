"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainNavItems, bottomNavItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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

export function AppHeader() {
  const pathname = usePathname();
  const match =
    [...mainNavItems, ...bottomNavItems].find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    )?.title || titles[pathname] || "FocusTrack";

  return (
    <header className="hidden md:flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-5 lg:px-6">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground truncate">
          {match}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-52 rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Link
          href="/tasks?new=1"
          className={cn(buttonVariants({ size: "sm" }), "h-8 gap-1.5 text-xs")}
        >
          <Plus className="h-3.5 w-3.5" />
          New task
        </Link>
      </div>
    </header>
  );
}
