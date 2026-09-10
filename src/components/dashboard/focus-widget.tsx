import Link from "next/link";
import { Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

interface FocusWidgetProps {
  focusMinutesToday: number;
  sessionsToday: number;
}

export function FocusWidget({
  focusMinutesToday,
  sessionsToday,
}: FocusWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Focus Today
        </CardTitle>
        <Link
          href="/focus"
          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Open timer
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/60 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">Total time</p>
            <p className="text-lg font-semibold tabular-nums tracking-tight">
              {formatDuration(focusMinutesToday)}
            </p>
          </div>
          <div className="rounded-md bg-muted/60 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">Sessions</p>
            <p className="text-lg font-semibold tabular-nums tracking-tight">
              {sessionsToday}
            </p>
          </div>
        </div>
        <Link
          href="/focus"
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Start Focus
        </Link>
      </CardContent>
    </Card>
  );
}
