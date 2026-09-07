import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Month, week, and day views
        </p>
      </header>
      <EmptyState
        icon={Calendar}
        title="Calendar coming in Phase 8"
        description="See tasks, habits, and focus sessions on a calendar."
      />
    </div>
  );
}
