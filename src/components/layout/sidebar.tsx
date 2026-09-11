"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, bottomNavItems, isNavActive } from "./nav-items";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  }

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="hidden md:flex w-[232px] shrink-0 flex-col h-full border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))]"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center gap-2.5 px-4 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-semibold text-[15px] text-foreground tracking-tight">
            FocusTrack
          </span>
        </Link>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-foreground truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              Productivity
            </p>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            aria-label="Account menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1 space-y-4"
        aria-label="Primary"
      >
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/75">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "nav-item",
                        active ? "nav-item-active" : "nav-item-idle"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <p className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/75">
            Setting
          </p>
          <ul className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-item",
                      active ? "nav-item-active" : "nav-item-idle"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="nav-item nav-item-idle w-full text-left"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
