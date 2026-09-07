import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations/task";

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  dueTime: string | null;
  completedAt: Date | null;
  isRecurring: boolean;
  recurrence: string | null;
  categoryId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; color: string } | null;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    dueTime: task.dueTime,
    completedAt: task.completedAt?.toISOString() ?? null,
    isRecurring: task.isRecurring,
    recurrence: task.recurrence,
    categoryId: task.categoryId,
    category: task.category
      ? {
          id: task.category.id,
          name: task.category.name,
          color: task.category.color,
        }
      : null,
    order: task.order,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: serializeTask(task) });
  } catch (error) {
    console.error("GET /api/tasks/[id]", error);
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (body.toggleComplete === true) {
      const existing = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const isCompleting = existing.status !== "COMPLETED";
      const task = await prisma.task.update({
        where: { id },
        data: {
          status: isCompleting ? "COMPLETED" : "TODO",
          completedAt: isCompleting ? new Date() : null,
        },
        include: {
          category: { select: { id: true, name: true, color: true } },
        },
      });

      return NextResponse.json({ task: serializeTask(task) });
    }

    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "COMPLETED" && existing.status !== "COMPLETED") {
        updateData.completedAt = new Date();
      } else if (data.status !== "COMPLETED") {
        updateData.completedAt = null;
      }
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.dueTime !== undefined) updateData.dueTime = data.dueTime || null;
    if (data.categoryId !== undefined)
      updateData.categoryId = data.categoryId || null;
    if (data.isRecurring !== undefined)
      updateData.isRecurring = data.isRecurring;
    if (data.recurrence !== undefined)
      updateData.recurrence = data.recurrence || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ task: serializeTask(task) });
  } catch (error) {
    console.error("PATCH /api/tasks/[id]", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
