"use client";

import { CheckCircle2, Flag, ListFilter, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { PageTransition } from "@/components/page-transition";
import { TaskFormModal } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui";

type Filter = "all" | "important" | "open" | "done";

const filters: { id: Filter; label: string; icon: typeof ListFilter }[] = [
  { id: "all", label: "Все", icon: ListFilter },
  { id: "important", label: "Важные", icon: Flag },
  { id: "open", label: "В работе", icon: Plus },
  { id: "done", label: "Готово", icon: CheckCircle2 },
];

export default function TasksPage() {
  const { tasks } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (a.important !== b.important) return Number(b.important) - Number(a.important);
      return a.dueDate.localeCompare(b.dueDate);
    });

    if (filter === "important") return list.filter((task) => task.important);
    if (filter === "open") return list.filter((task) => !task.completed);
    if (filter === "done") return list.filter((task) => task.completed);
    return list;
  }, [tasks, filter]);

  return (
    <PageTransition>
      <header className="page-header">
        <div>
          <span className="eyebrow">Планы и цели</span>
          <h1>Дела</h1>
          <p>Важное выделяется, выполненное не мешает фокусу.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} /> Новое дело
        </Button>
      </header>

      <section className="panel page-panel">
        <div className="filter-row" role="tablist">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`filter-chip ${filter === id ? "active" : ""}`}
              role="tab"
              aria-selected={filter === id}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        <TaskList tasks={filtered} />
      </section>

      <TaskFormModal open={open} onClose={() => setOpen(false)} />
    </PageTransition>
  );
}
