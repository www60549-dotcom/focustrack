import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateGoalSchema } from "@/lib/validations/goal";

type RouteContext = { params: Promise<{ id: string }> };

function serialize(g: {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  deadline: Date | null;
  progress: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    deadline: g.deadline?.toISOString() ?? null,
    progress: g.progress,
    status: g.status,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.deadline !== undefined)
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.status !== undefined) updateData.status = data.status;

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ goal: serialize(goal) });
  } catch (error) {
    console.error("PATCH /api/goals/[id]", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/goals/[id]", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
