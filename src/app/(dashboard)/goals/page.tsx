import { Flag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Long-term goals and progress
        </p>
      </header>
      <EmptyState
        icon={Flag}
        title="Goals coming in Phase 9"
        description="Set deadlines, track progress, and manage goal status."
      />
    </div>
  );
}
