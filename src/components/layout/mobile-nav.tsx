"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavItems, bottomNavItems, mobileBottomNavItems } from "./nav-items";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface MobileNavProps {
  user: {
    email?: string | null;
    name?: string | null;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out");
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  }

  const displayName = user.name || user.email?.split("@")[0] || "User";

  return (
    <>
      {/* Top bar – mobile only */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">FocusTrack</span>
        </Link>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,20rem)] bg-card border-r border-border shadow-xl transition-transform duration-200 ease-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FocusTrack</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 rounded-lg text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Primary">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-0.5 shrink-0">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.title}
              </Link>
            );
          })}

          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {user.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom tab bar – mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-pb"
        aria-label="Mobile bottom navigation"
      >
        <div className="flex items-center justify-around h-14 px-1">
          {mobileBottomNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 rounded-lg transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium truncate max-w-full px-0.5">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
