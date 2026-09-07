import { Target } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Habits" };

export default function HabitsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build consistency with daily habits
        </p>
      </header>
      <EmptyState
        icon={Target}
        title="Habit tracker coming in Phase 6"
        description="Track streaks, frequencies, and completion rates. Structure is ready."
      />
    </div>
  );
}
