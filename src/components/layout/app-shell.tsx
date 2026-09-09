"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    email?: string | null;
    name?: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <MobileNav user={user} />
        <main
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin",
            "pb-16 md:pb-0"
          )}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-5 sm:py-6">
            {children}
          </div>
        </main>
      </div>
      <AssistantPanel />
    </div>
  );
}
