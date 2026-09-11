"use client";

import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { AppHeader } from "./app-header";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { CommandPalette } from "@/components/command/command-palette";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <MobileNav user={user} />
        <AppHeader />
        <main
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin bg-[hsl(var(--background))]",
            "pb-16 md:pb-0"
          )}
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
            {children}
          </div>
        </main>
      </div>
      <AssistantPanel />
      <CommandPalette />
      {user.id && <OnboardingGate userId={user.id} />}
    </div>
  );
}
