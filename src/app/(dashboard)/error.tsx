"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error.message);
  }, [error]);

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
      <h2 className="text-lg font-semibold">Couldn&apos;t load this page</h2>
      <p className="text-sm text-muted-foreground">
        Check your connection and database settings, then try again.
      </p>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  );
}
