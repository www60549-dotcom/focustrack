"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  email: string;
  name: string;
  initial: {
    theme: string;
    notificationsEnabled: boolean;
    taskReminders: boolean;
    habitReminders: boolean;
    pomodoroWork: number;
    pomodoroBreak: number;
  };
}

export function SettingsForm({ email, name, initial }: SettingsFormProps) {
  const router = useRouter();
  const [theme, setTheme] = useState(initial.theme);
  const [pomodoroWork, setPomodoroWork] = useState(initial.pomodoroWork);
  const [pomodoroBreak, setPomodoroBreak] = useState(initial.pomodoroBreak);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, pomodoroWork, pomodoroBreak }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={email} disabled className="mt-1" />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name || "—"} disabled className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="work">Focus work (min)</Label>
                <Input
                  id="work"
                  type="number"
                  min={5}
                  max={120}
                  value={pomodoroWork}
                  onChange={(e) => setPomodoroWork(Number(e.target.value) || 25)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="break">Break (min)</Label>
                <Input
                  id="break"
                  type="number"
                  min={1}
                  max={60}
                  value={pomodoroBreak}
                  onChange={(e) => setPomodoroBreak(Number(e.target.value) || 5)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save preferences"}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
