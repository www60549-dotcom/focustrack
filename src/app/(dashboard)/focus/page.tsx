import { Timer } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Focus" };

export default function FocusPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pomodoro and custom focus sessions
        </p>
      </header>
      <EmptyState
        icon={Timer}
        title="Focus timer coming in Phase 7"
        description="25/50 min modes, custom duration, and session tracking will live here."
      />
    </div>
  );
}
