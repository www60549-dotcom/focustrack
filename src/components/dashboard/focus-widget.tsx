import Link from "next/link";
import { Timer, Play } from "lucide-react";
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" aria-hidden="true" />
          Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {formatDuration(focusMinutesToday)}
            </p>
            <p className="text-xs text-muted-foreground">today</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {sessionsToday}
            </p>
            <p className="text-xs text-muted-foreground">sessions</p>
          </div>
        </div>
        <Link
          href="/focus"
          className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Play className="h-4 w-4" />
          Start Focus Session
        </Link>
      </CardContent>
    </Card>
  );
}
