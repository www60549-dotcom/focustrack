import { HabitsView } from "@/components/habits/habits-view";

export const metadata = { title: "Habits" };

type SearchParams = Promise<{ new?: string }>;

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const openCreate = params.new === "1";

  return <HabitsView openCreate={openCreate} />;
}
