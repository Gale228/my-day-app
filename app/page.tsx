"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, Plus, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarWidget } from "@/components/calendar-widget";
import { ExpenseFormModal } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { PageTransition } from "@/components/page-transition";
import { TaskFormModal } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui";
import { useApp, useTodayKey } from "@/components/app-provider";
import { formatLongDate, formatMoney } from "@/lib/date";

export default function DashboardPage() {
  const { tasks, expenses, hydrated } = useApp();
  const today = useTodayKey();
  const [taskModal, setTaskModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.dueDate === today)
        .sort((a, b) => Number(b.important) - Number(a.important))
        .slice(0, 5),
    [tasks, today],
  );

  const todayExpenses = useMemo(
    () => expenses.filter((expense) => expense.date === today),
    [expenses, today],
  );

  const monthPrefix = today.slice(0, 7);
  const monthExpenseTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.date.startsWith(monthPrefix))
        .reduce((sum, expense) => sum + expense.amount, 0),
    [expenses, monthPrefix],
  );

  const todayExpenseTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const openToday = todayTasks.filter((task) => !task.completed).length;
  const importantToday = todayTasks.filter((task) => task.important && !task.completed).length;

  return (
    <PageTransition>
      <header className="page-header dashboard-header">
        <div>
          <span className="eyebrow">{formatLongDate()}</span>
          <h1>Доброе утро, Андрей</h1>
          <p>Спокойно разложим день по полочкам.</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => setExpenseModal(true)}>
            <CircleDollarSign size={18} />
            Расход
          </Button>
          <Button onClick={() => setTaskModal(true)}>
            <Plus size={18} />
            Новое дело
          </Button>
        </div>
      </header>

      <section className="stats-grid">
        <motion.article whileHover={{ y: -3 }} className="stat-card stat-lavender">
          <div className="stat-icon"><Sparkles size={20} /></div>
          <span>Осталось дел сегодня</span>
          <strong>{hydrated ? openToday : "—"}</strong>
          <p>{importantToday ? `${importantToday} важных` : "без аврала"}</p>
        </motion.article>

        <motion.article whileHover={{ y: -3 }} className="stat-card stat-green">
          <div className="stat-icon"><CircleDollarSign size={20} /></div>
          <span>Расходы сегодня</span>
          <strong>{hydrated ? formatMoney(todayExpenseTotal) : "—"}</strong>
          <p>{todayExpenses.length} записей</p>
        </motion.article>

        <motion.article whileHover={{ y: -3 }} className="stat-card stat-neutral">
          <div className="stat-icon"><Star size={20} /></div>
          <span>Расходы за месяц</span>
          <strong>{hydrated ? formatMoney(monthExpenseTotal) : "—"}</strong>
          <p>текущий месяц</p>
        </motion.article>
      </section>

      <div className="dashboard-grid">
        <section className="panel tasks-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Фокус</span>
              <h2>Дела на сегодня</h2>
            </div>
            <Link href="/tasks" className="text-link">
              Все дела <ArrowRight size={16} />
            </Link>
          </div>
          <TaskList tasks={todayTasks} compact />
          <button className="quick-add" onClick={() => setTaskModal(true)}>
            <Plus size={17} /> Добавить дело
          </button>
        </section>

        <CalendarWidget />

        <section className="panel expenses-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Деньги</span>
              <h2>Сегодняшние расходы</h2>
            </div>
            <Link href="/expenses" className="text-link">
              История <ArrowRight size={16} />
            </Link>
          </div>
          <ExpenseList expenses={todayExpenses.slice(0, 4)} compact />
          <button className="quick-add" onClick={() => setExpenseModal(true)}>
            <Plus size={17} /> Записать расход
          </button>
        </section>
      </div>

      <TaskFormModal open={taskModal} onClose={() => setTaskModal(false)} />
      <ExpenseFormModal open={expenseModal} onClose={() => setExpenseModal(false)} />
    </PageTransition>
  );
}
