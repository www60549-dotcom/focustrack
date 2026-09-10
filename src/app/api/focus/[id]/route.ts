import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { completeFocusSessionSchema } from "@/lib/validations/focus";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = completeFocusSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.focusSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const data = parsed.data;
    const session = await prisma.focusSession.update({
      where: { id },
      data: {
        completed: data.completed,
        actualDuration: data.actualDuration,
        endedAt: new Date(),
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        duration: session.duration,
        actualDuration: session.actualDuration,
        completed: session.completed,
        mode: session.mode,
      },
    });
  } catch (error) {
    console.error("PATCH /api/focus/[id]", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
