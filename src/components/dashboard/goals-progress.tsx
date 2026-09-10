import Link from "next/link";
import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface GoalProgressItem {
  id: string;
  name: string;
  progress: number;
  status: string;
  deadline: string | null;
}

export function GoalsProgress({ goals }: { goals: GoalProgressItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Goals Progress</CardTitle>
        <Link
          href="/goals"
          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No active goals"
            description="Set a goal to track long-term progress."
            action={
              <Link
                href="/goals"
                className="text-xs font-medium text-primary hover:underline"
              >
                Add goal
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3.5">
            {goals.map((g) => (
              <li key={g.id}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {g.name}
                  </p>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0">
                    {g.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      g.progress >= 100 ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, g.progress))}%`,
                    }}
                  />
                </div>
                {g.deadline && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Due {format(new Date(g.deadline), "MMM d, yyyy")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
