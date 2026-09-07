import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

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

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name,
        avatarUrl: (user.user_metadata?.avatar_url as string) || null,
        profile: { create: {} },
        settings: { create: {} },
      },
      update: {
        email: user.email,
        name: name ?? undefined,
      },
    });
  } catch {
    // DB may be unavailable during local UI development
  }

  return {
    id: user.id,
    email: user.email,
    name,
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
