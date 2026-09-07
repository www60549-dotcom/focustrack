import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Account, appearance, and preferences
        </p>
      </header>
      <EmptyState
        icon={Settings}
        title="Settings coming in Phase 11"
        description="Theme, timezone, notifications, and account management."
      />
    </div>
  );
}
