"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Timer,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FOCUS_PRESETS } from "@/types/focus";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TimerState = "idle" | "running" | "paused" | "finished";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusTimer() {
  const [presetId, setPresetId] = useState<string>("pomodoro");
  const [customMinutes, setCustomMinutes] = useState(50);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [state, setState] = useState<TimerState>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ sessionsToday: 0, focusMinutesToday: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedPreset =
    FOCUS_PRESETS.find((p) => p.id === presetId) || FOCUS_PRESETS[0];
  const durationMinutes =
    presetId === "custom" ? customMinutes : selectedPreset.minutes;

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/focus?today=1");
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // soft fail
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (state !== "running") return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setState("finished");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (state === "finished") {
      void completeSession(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function applyPreset(id: string) {
    if (state === "running" || state === "paused") return;
    setPresetId(id);
    const preset = FOCUS_PRESETS.find((p) => p.id === id);
    const mins = id === "custom" ? customMinutes : preset?.minutes ?? 25;
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setState("idle");
    setSessionId(null);
  }

  async function startSession() {
    const secs = durationMinutes * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setSaving(true);
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: durationMinutes,
          mode: presetId === "custom" ? "custom" : presetId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start session");
      }
      setSessionId(data.session?.id ?? null);
      setState("running");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start");
      setState("running");
    } finally {
      setSaving(false);
    }
  }

  function pause() {
    setState("paused");
  }

  function resume() {
    setState("running");
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = durationMinutes * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setState("idle");
    setSessionId(null);
  }

  async function completeSession(completed: boolean) {
    if (!sessionId) {
      if (completed) toast.success("Focus session finished!");
      void loadStats();
      return;
    }
    setSaving(true);
    try {
      const actual = Math.max(
        1,
        Math.round((totalSeconds - remaining) / 60) || durationMinutes
      );
      const res = await fetch(`/api/focus/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed,
          actualDuration: actual,
          endedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save session");
      }
      if (completed) toast.success("Focus session saved!");
      void loadStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setSessionId(null);
    }
  }

  async function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState("idle");
    await completeSession(remaining === 0);
    reset();
  }

  const progress =
    totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pomodoro and deep work sessions
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Sessions today</p>
            <p className="text-2xl font-semibold">{stats.sessionsToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Focus time</p>
            <p className="text-2xl font-semibold">
              {formatDuration(stats.focusMinutesToday)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {FOCUS_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={state === "running" || state === "paused"}
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                  presetId === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                {p.label}
                {p.id !== "custom" ? ` ${p.minutes}m` : ""}
              </button>
            ))}
          </div>

          {presetId === "custom" && state === "idle" && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Minutes</label>
              <input
                type="number"
                min={1}
                max={180}
                value={customMinutes}
                onChange={(e) => {
                  const v = Math.min(180, Math.max(1, Number(e.target.value) || 1));
                  setCustomMinutes(v);
                  setTotalSeconds(v * 60);
                  setRemaining(v * 60);
                }}
                className="h-9 w-20 rounded-lg border border-input bg-background px-2 text-sm"
              />
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-mono font-semibold tracking-tight">
              {formatTime(remaining)}
            </div>
            <div className="mt-4 h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground capitalize">
              {state}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {state === "idle" && (
              <Button onClick={() => void startSession()} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start
              </Button>
            )}
            {state === "running" && (
              <>
                <Button variant="secondary" onClick={pause}>
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" onClick={() => void stop()}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
            {state === "paused" && (
              <>
                <Button onClick={resume}>
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
            {state === "finished" && (
              <Button onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                New session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
