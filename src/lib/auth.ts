import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function ensureDbUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      profile: { create: {} },
      settings: { create: {} },
    },
    update: {
      email: user.email,
      ...(user.name ? { name: user.name } : {}),
    },
  });
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const name =
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    null;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name,
  };

  try {
    await ensureDbUser({
      ...authUser,
      avatarUrl: (user.user_metadata?.avatar_url as string) || null,
    });
  } catch (error) {
    console.error(
      "ensureDbUser failed:",
      error instanceof Error ? error.message : error
    );
    const err = new Error(
      "DATABASE_UNAVAILABLE: Cannot reach PostgreSQL. Check DATABASE_URL / DIRECT_URL and run `npx prisma db push`."
    );
    (err as Error & { cause?: unknown }).cause = error;
    throw err;
  }

  return authUser;
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.startsWith("DATABASE_UNAVAILABLE") ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("P1001") ||
      error.message.includes("P1000") ||
      error.message.includes("P1017") ||
      error.message.includes("P2021") ||
      error.message.includes("does not exist"))
  );
}

export function databaseErrorResponse() {
  return {
    error:
      "Database unavailable. Check DATABASE_URL and DIRECT_URL in .env, then run: npx prisma db push",
  };
}
