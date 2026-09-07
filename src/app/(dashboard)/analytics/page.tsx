import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Productivity trends and insights
        </p>
      </header>
      <EmptyState
        icon={BarChart3}
        title="Analytics coming in Phase 10"
        description="7, 30, and 90-day overviews with charts and scores."
      />
    </div>
  );
}
