import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateHabitSchema } from "@/lib/validations/habit";
import { startOfToday } from "date-fns";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const today = startOfToday();
    const habit = await prisma.habit.findFirst({
      where: { id, userId: user.id },
      include: { completions: { where: { date: today }, take: 1 } },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json({
      habit: serializeHabit(habit, habit.completions.length > 0),
    });
  } catch (error) {
    console.error("GET /api/habits/[id]", error);
    return NextResponse.json({ error: "Failed to load habit" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existing = await prisma.habit.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    const data = parsed.data;
    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description || null }
          : {}),
        ...(data.frequency !== undefined ? { frequency: data.frequency } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
      },
    });
    return NextResponse.json({
      habit: serializeHabit(habit, false),
    });
  } catch (error) {
    console.error("PATCH /api/habits/[id]", error);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const existing = await prisma.habit.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    await prisma.habit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/habits/[id]", error);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
