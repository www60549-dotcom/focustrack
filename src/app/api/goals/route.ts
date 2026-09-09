import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createGoalSchema } from "@/lib/validations/goal";

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

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ goals: goals.map(serialize) });
  } catch (error) {
    console.error("GET /api/goals", error);
    return NextResponse.json({ error: "Failed to load goals", goals: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        progress: data.progress ?? 0,
        status: data.status ?? "NOT_STARTED",
      },
    });

    return NextResponse.json({ goal: serialize(goal) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/goals", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
