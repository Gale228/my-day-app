"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Star, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import type { Task } from "@/lib/types";

export function TaskList({ tasks, compact = false }: { tasks: Task[]; compact?: boolean }) {
  const { toggleTask, deleteTask } = useApp();

  if (!tasks.length) {
    return (
      <EmptyState
        icon={<Check size={22} />}
        title="Здесь пока спокойно"
        text="Добавь первое дело — оно появится в этом списке."
      />
    );
  }

  return (
    <div className="task-list">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.article
            layout
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
            className={`task-row ${task.completed ? "completed" : ""}`}
          >
            <button
              className={`task-check ${task.completed ? "checked" : ""}`}
              onClick={() => toggleTask(task.id)}
              aria-label={task.completed ? "Вернуть задачу" : "Выполнить задачу"}
            >
              <Check size={15} />
            </button>

            <div className="task-main">
              <div className="task-title-line">
                <strong>{task.title}</strong>
                {task.important && (
                  <span className="important-badge" title="Важная цель">
                    <Star size={13} fill="currentColor" />
                    {!compact && "Важно"}
                  </span>
                )}
              </div>
              <span>{formatShortDate(task.dueDate)}</span>
            </div>

            {!compact && (
              <button
                className="row-action danger-hover"
                onClick={() => deleteTask(task.id)}
                aria-label="Удалить задачу"
              >
                <Trash2 size={17} />
              </button>
            )}
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}
