import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations/task";
import { startOfToday, endOfToday } from "date-fns";

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const filter = searchParams.get("filter") || "all";
    const q = searchParams.get("q")?.trim();
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    if (filter === "today") {
      where.OR = [
        {
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        {
          dueDate: null,
          status: { not: "COMPLETED" },
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      ];
      where.status = { not: "CANCELLED" };
    } else if (filter === "upcoming") {
      where.dueDate = { gt: todayEnd };
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    } else if (filter === "overdue") {
      where.dueDate = { lt: todayStart };
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    } else if (filter === "completed") {
      where.status = "COMPLETED";
    } else {
      if (!q) {
        where.status = { not: "CANCELLED" };
      }
    }

    if (priority && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      where.priority = priority;
    }

    if (q) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: where as never,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "asc" },
        { dueDate: "asc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      tasks: tasks.map(serializeTask),
    });
  } catch (error) {
    console.error("GET /api/tasks", error);
    return NextResponse.json(
      { error: "Failed to load tasks", tasks: [] },
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
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let dueDate: Date | null = null;
    if (data.dueDate) {
      dueDate = new Date(data.dueDate);
      if (Number.isNaN(dueDate.getTime())) dueDate = null;
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        dueDate,
        dueTime: data.dueTime || null,
        isRecurring: data.isRecurring ?? false,
        recurrence: data.recurrence || null,
        categoryId: data.categoryId || null,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(
      { task: serializeTask(task) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
