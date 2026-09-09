import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNoteSchema } from "@/lib/validations/note";

function serialize(n: {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    isPinned: n.isPinned,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ notes: notes.map(serialize) });
  } catch (error) {
    console.error("GET /api/notes", error);
    return NextResponse.json({ error: "Failed to load notes", notes: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: data.title,
        content: data.content ?? "",
        isPinned: data.isPinned ?? false,
      },
    });

    return NextResponse.json({ note: serialize(note) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
