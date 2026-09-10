import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createFocusSessionSchema } from "@/lib/validations/focus";
import { startOfToday, endOfToday } from "date-fns";

function serialize(session: {
  id: string;
  taskId: string | null;
  duration: number;
  actualDuration: number | null;
  mode: string;
  startedAt: Date;
  endedAt: Date | null;
  completed: boolean;
  notes: string | null;
  createdAt: Date;
  task?: { title: string } | null;
}) {
  return {
    id: session.id,
    taskId: session.taskId,
    taskTitle: session.task?.title ?? null,
    duration: session.duration,
    actualDuration: session.actualDuration,
    mode: session.mode,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    completed: session.completed,
    notes: session.notes,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const todayOnly = searchParams.get("today") === "1";

    const where: {
      userId: string;
      startedAt?: { gte: Date; lte: Date };
    } = { userId: user.id };

    if (todayOnly) {
      where.startedAt = {
        gte: startOfToday(),
        lte: endOfToday(),
      };
    }

    const sessions = await prisma.focusSession.findMany({
      where,
      include: { task: { select: { title: true } } },
      orderBy: { startedAt: "desc" },
      take: todayOnly ? 50 : 100,
    });

    const completedToday = sessions.filter((s) => s.completed);
    const focusMinutes = completedToday.reduce(
      (sum, s) => sum + (s.actualDuration ?? 0),
      0
    );

    return NextResponse.json({
      sessions: sessions.map(serialize),
      stats: {
        sessionsToday: completedToday.length,
        focusMinutesToday: focusMinutes,
      },
    });
  } catch (error) {
    console.error("GET /api/focus", error);
    return NextResponse.json(
      {
        error: "Failed to load sessions",
        sessions: [],
        stats: { sessionsToday: 0, focusMinutesToday: 0 },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createFocusSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: data.taskId, userId: user.id },
      });
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
    }

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        taskId: data.taskId || null,
        duration: data.duration,
        mode: data.mode,
        startedAt: new Date(),
        notes: data.notes || null,
        completed: false,
      },
      include: { task: { select: { title: true } } },
    });

    return NextResponse.json({ session: serialize(session) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/focus", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
