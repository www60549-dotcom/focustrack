import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let settings = {
    theme: "system",
    notificationsEnabled: true,
    taskReminders: true,
    habitReminders: true,
    pomodoroWork: 25,
    pomodoroBreak: 5,
  };

  if (user?.id) {
    try {
      const row = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });
      if (row) {
        settings = {
          theme: row.theme,
          notificationsEnabled: row.notificationsEnabled,
          taskReminders: row.taskReminders,
          habitReminders: row.habitReminders,
          pomodoroWork: row.pomodoroWork,
          pomodoroBreak: row.pomodoroBreak,
        };
      }
    } catch {
      // DB unavailable — show defaults
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Account and preferences
        </p>
      </header>
      <SettingsForm
        email={user?.email ?? ""}
        name={
          (user?.user_metadata?.name as string) ||
          (user?.user_metadata?.full_name as string) ||
          ""
        }
        initial={settings}
      />
    </div>
  );
}
