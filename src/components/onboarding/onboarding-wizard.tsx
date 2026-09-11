"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, CheckSquare, Target, Timer, Flag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const INTERESTS = [
  { id: "productivity", label: "Productivity", icon: CheckSquare },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "habits", label: "Habits", icon: Target },
  { id: "goals", label: "Goals", icon: Flag },
  { id: "organization", label: "Organization", icon: CheckSquare },
] as const;

export function OnboardingWizard({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    try {
      localStorage.setItem(`focustrack-onboarded-${userId}`, "1");
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => null);
      toast.success("Welcome to FocusTrack");
      onComplete?.();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function skip() {
    localStorage.setItem(`focustrack-onboarded-${userId}`, "1");
    onComplete?.();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
        <div className="p-6 space-y-5">
          {step === 0 && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Welcome to FocusTrack
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your command center for tasks, habits, focus, and goals — designed
                  to help you make consistent progress every day.
                </p>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  What do you want to improve?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick one or more — you can change this anytime.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((item) => {
                  const Icon = item.icon;
                  const on = selected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelected((s) =>
                          on ? s.filter((x) => x !== item.id) : [...s, item.id]
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                        on
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Start with one action
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first task, or jump straight into focus mode.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full justify-between"
                  onClick={() => {
                    localStorage.setItem(`focustrack-onboarded-${userId}`, "1");
                    router.push("/tasks?new=1");
                  }}
                >
                  Create a task
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    localStorage.setItem(`focustrack-onboarded-${userId}`, "1");
                    router.push("/focus");
                  }}
                >
                  Start a focus session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  You&apos;re ready
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Press <kbd className="rounded border px-1 text-xs">⌘K</kbd> anytime
                  for the command menu. Shortcuts: N task · F focus · H habits.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={skip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button size="sm" onClick={finish} disabled={saving}>
                  Open dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
