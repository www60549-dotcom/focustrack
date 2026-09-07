import { TasksView } from "@/components/tasks/tasks-view";

export const metadata = { title: "Tasks" };

type SearchParams = Promise<{ new?: string; filter?: string }>;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const openCreate = params.new === "1";
  const filter =
    params.filter === "upcoming" ||
    params.filter === "overdue" ||
    params.filter === "completed" ||
    params.filter === "all" ||
    params.filter === "today"
      ? params.filter
      : "today";

  return <TasksView initialFilter={filter} openCreate={openCreate} />;
}
