import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "My Day" };

export default function MyDayPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">My Day</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan morning, afternoon, and evening
        </p>
      </header>
      <EmptyState
        icon={CalendarDays}
        title="Daily planner coming soon"
        description="Organize your day into morning, afternoon, and evening blocks."
      />
    </div>
  );
}
