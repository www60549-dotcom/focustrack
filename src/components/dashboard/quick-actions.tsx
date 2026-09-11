import Link from "next/link";
import { CheckSquare, Timer, Target, Flag, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { href: "/tasks?new=1", label: "New Task", hint: "N", icon: CheckSquare },
  { href: "/focus", label: "Start Focus", hint: "F", icon: Timer },
  { href: "/habits", label: "Add Habit", hint: "H", icon: Target },
  { href: "/goals", label: "New Goal", hint: "G", icon: Flag },
  { href: "/notes", label: "New Note", hint: "", icon: StickyNote },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href + a.label}
                href={a.href}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-3 text-center transition-all hover:border-primary/40 hover:bg-accent hover:shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[12px] font-medium text-foreground">
                  {a.label}
                </span>
                {a.hint && (
                  <kbd className="text-[10px] text-muted-foreground">{a.hint}</kbd>
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
