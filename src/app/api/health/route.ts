import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const result = {
    ok: false,
    database: "unknown" as string,
    prisma: "unknown" as string,
    auth: "unknown" as string,
    tables: {} as Record<string, boolean | string>,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database = "CONNECTED";
    result.prisma = "CONNECTED";
  } catch (error) {
    result.database = "DISCONNECTED";
    result.prisma = "ERROR";
    return NextResponse.json(
      {
        ...result,
        hint:
          "Prisma cannot reach PostgreSQL. Fix DATABASE_URL / DIRECT_URL (use Supabase Session pooler), then run npx prisma db push.",
        detail:
          error instanceof Error
            ? error.message.replace(/postgresql:\/\/[^\s]+/gi, "[redacted]")
            : "unknown",
      },
      { status: 503 }
    );
  }

  const tableChecks: { name: string; fn: () => Promise<unknown> }[] = [
    { name: "users", fn: () => prisma.user.count() },
    { name: "tasks", fn: () => prisma.task.count() },
    { name: "habits", fn: () => prisma.habit.count() },
    { name: "goals", fn: () => prisma.goal.count() },
    { name: "notes", fn: () => prisma.note.count() },
    { name: "focus_sessions", fn: () => prisma.focusSession.count() },
  ];

  for (const t of tableChecks) {
    try {
      await t.fn();
      result.tables[t.name] = true;
    } catch (error) {
      result.tables[t.name] =
        error instanceof Error && error.message.includes("does not exist")
          ? "MISSING — run npx prisma db push"
          : "ERROR";
    }
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    result.auth = error ? "ERROR" : "CONNECTED";
  } catch {
    result.auth = "ERROR";
  }

  const missingTables = Object.entries(result.tables).filter(
    ([, v]) => v !== true
  );
  result.ok =
    result.database === "CONNECTED" &&
    result.prisma === "CONNECTED" &&
    missingTables.length === 0;

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
