import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { calculateStreaks, toDateOnly } from "@/lib/habits/streak";
import type { HabitFrequency } from "@/types/habit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const habit = await prisma.habit.findFirst({
      where: { id, userId: user.id },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    let wantCompleted: boolean | undefined;
    try {
      const body = await request.json();
      if (typeof body.completed === "boolean") {
        wantCompleted = body.completed;
      }
    } catch {
      // empty body = toggle
    }

    const today = toDateOnly();
    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: { habitId: id, date: today },
      },
    });

    const currentlyCompleted = !!existing?.completed;
    const nextCompleted =
      wantCompleted !== undefined ? wantCompleted : !currentlyCompleted;

    if (nextCompleted && !currentlyCompleted) {
      await prisma.habitCompletion.upsert({
        where: { habitId_date: { habitId: id, date: today } },
        create: {
          habitId: id,
          userId: user.id,
          date: today,
          completed: true,
        },
        update: { completed: true },
      });
    } else if (!nextCompleted && currentlyCompleted) {
      await prisma.habitCompletion.delete({
        where: { habitId_date: { habitId: id, date: today } },
      });
    }

    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: id,
        completed: true,
      },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 400,
    });

    const { currentStreak, bestStreak } = calculateStreaks(
      completions.map((c) => c.date),
      habit.frequency as HabitFrequency,
      habit.selectedDays
    );

    const totalCompletions = await prisma.habitCompletion.count({
      where: { habitId: id, completed: true },
    });

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        currentStreak,
        bestStreak: Math.max(habit.bestStreak, bestStreak),
        totalCompletions,
      },
    });

    return NextResponse.json({
      habit: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        icon: updated.icon,
        color: updated.color,
        frequency: updated.frequency,
        selectedDays: updated.selectedDays,
        reminderTime: updated.reminderTime,
        startDate: updated.startDate.toISOString(),
        goal: updated.goal,
        isActive: updated.isActive,
        currentStreak: updated.currentStreak,
        bestStreak: updated.bestStreak,
        totalCompletions: updated.totalCompletions,
        completedToday: nextCompleted,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/habits/[id]/complete", error);
    return NextResponse.json(
      { error: "Failed to toggle habit completion" },
      { status: 500 }
    );
  }
}
