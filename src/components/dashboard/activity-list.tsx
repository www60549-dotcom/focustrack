import { CheckCircle2, Timer, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityListProps {
  tasksCompleted: number;
  habitsCompleted: number;
  sessionsToday: number;
}

export function ActivityList({
  tasksCompleted,
  habitsCompleted,
  sessionsToday,
}: ActivityListProps) {
  const items: { icon: typeof Target; title: string; meta: string }[] = [];

  if (tasksCompleted > 0) {
    items.push({
      icon: CheckCircle2,
      title: `${tasksCompleted} task${tasksCompleted === 1 ? "" : "s"} completed`,
      meta: "Today",
    });
  }
  if (habitsCompleted > 0) {
    items.push({
      icon: Target,
      title: `${habitsCompleted} habit${habitsCompleted === 1 ? "" : "s"} checked in`,
      meta: "Today",
    });
  }
  if (sessionsToday > 0) {
    items.push({
      icon: Timer,
      title: `${sessionsToday} focus session${sessionsToday === 1 ? "" : "s"} finished`,
      meta: "Today",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Complete a task, habit, or focus session to see activity here.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
