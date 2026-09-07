import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Notes" };

export default function NotesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quick notes and ideas
        </p>
      </header>
      <EmptyState
        icon={StickyNote}
        title="Notes coming in Phase 9"
        description="Create, pin, search, and tag notes."
      />
    </div>
  );
}
