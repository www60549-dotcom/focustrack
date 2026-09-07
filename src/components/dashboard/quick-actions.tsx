import Link from "next/link";
import {
  Plus,
  Timer,
  Target,
  Flag,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const actions: QuickAction[] = [
  {
    title: "New Task",
    href: "/tasks?new=1",
    icon: Plus,
    description: "Add a task",
  },
  {
    title: "Start Focus",
    href: "/focus",
    icon: Timer,
    description: "Focus session",
  },
  {
    title: "Add Habit",
    href: "/habits?new=1",
    icon: Target,
    description: "Build a habit",
  },
  {
    title: "New Goal",
    href: "/goals?new=1",
    icon: Flag,
    description: "Set a goal",
  },
  {
    title: "New Note",
    href: "/notes?new=1",
    icon: StickyNote,
    description: "Quick note",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 sm:p-4",
                  "text-center transition-colors hover:bg-accent hover:border-primary/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {action.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block truncate">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
