import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { buildUserContext } from "@/lib/ai/context";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(8000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are FocusTrack AI — a helpful productivity assistant.
Answer in the same language the user writes in (Russian or English).
Be concise and practical. Use the provided user context when relevant.
When the user clearly asks to create a task, respond normally and include:
\`\`\`action
{"type":"create_task","title":"...","priority":"MEDIUM"}
\`\`\`
Only when they explicitly request creation.`;

type ActionPayload = {
  type: string;
  title?: string;
  name?: string;
  priority?: string;
  description?: string;
};

function extractAction(text: string): ActionPayload | null {
  const match = text.match(/```action\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim()) as ActionPayload;
  } catch {
    return null;
  }
}

async function executeAction(
  userId: string,
  action: ActionPayload
): Promise<string | null> {
  try {
    if (action.type === "create_task" && action.title) {
      await prisma.task.create({
        data: {
          userId,
          title: action.title.slice(0, 200),
          description: action.description || null,
          priority: (action.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM",
        },
      });
      return `Created task: “${action.title}”.`;
    }
    if (action.type === "create_habit" && (action.name || action.title)) {
      const name = (action.name || action.title)!.slice(0, 100);
      await prisma.habit.create({
        data: { userId, name, frequency: "DAILY" },
      });
      return `Created habit: “${name}”.`;
    }
    return null;
  } catch (e) {
    console.error("AI action", e);
    return "Action failed.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI is not configured. Add AI_API_KEY to your .env file.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let context = "";
    try {
      context = await buildUserContext(user.id);
    } catch {
      context = "(context unavailable)";
    }

    const baseUrl =
      process.env.AI_BASE_URL?.replace(/\/$/, "") ||
      "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: context },
      ...parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      console.error("AI provider error", aiRes.status, errText.slice(0, 200));
      return NextResponse.json(
        { error: "AI provider request failed. Check AI_API_KEY / AI_BASE_URL." },
        { status: 502 }
      );
    }

    const aiData = (await aiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let reply =
      aiData.choices?.[0]?.message?.content?.trim() ||
      "I could not generate a response.";

    const action = extractAction(reply);
    if (action) {
      const result = await executeAction(user.id, action);
      reply = reply.replace(/```action[\s\S]*?```/g, "").trim();
      if (result) reply = `${reply}\n\n✓ ${result}`.trim();
    }

    return NextResponse.json({
      message: { role: "assistant", content: reply },
    });
  } catch (error) {
    console.error("POST /api/ai/chat", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
