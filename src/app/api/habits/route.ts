import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createHabitSchema } from "@/lib/validations/habit";
import { startOfToday } from "date-fns";

function serializeHabit(
  habit: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    frequency: string;
    selectedDays: number[];
    reminderTime: string | null;
    startDate: Date;
    goal: number | null;
    isActive: boolean;
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    createdAt: Date;
    updatedAt: Date;
    completions?: { id: string }[];
  },
  completedToday: boolean
) {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    selectedDays: habit.selectedDays,
    reminderTime: habit.reminderTime,
    startDate: habit.startDate.toISOString(),
    goal: habit.goal,
    isActive: habit.isActive,
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    totalCompletions: habit.totalCompletions,
    completedToday,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeOnly = request.nextUrl.searchParams.get("active") !== "0";
    const today = startOfToday();

    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        completions: {
          where: { date: today },
          take: 1,
        },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    return NextResponse.json({
      habits: habits.map((h) =>
        serializeHabit(h, h.completions.length > 0)
      ),
    });
  } catch (error) {
    console.error("GET /api/habits", error);
    return NextResponse.json(
      { error: "Failed to load habits", habits: [] },
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
    const parsed = createHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        icon: data.icon || "check-circle",
        color: data.color || "#22c55e",
        frequency: data.frequency,
        selectedDays: data.selectedDays ?? [],
        reminderTime: data.reminderTime || null,
        goal: data.goal ?? null,
      },
    });

    return NextResponse.json(
      { habit: serializeHabit(habit, false) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/habits", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
