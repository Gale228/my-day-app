"use client";

import { CircleDollarSign, Plus, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { ExpenseFormModal } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui";
import { formatMoney, todayKey } from "@/lib/date";

export default function ExpensesPage() {
  const { expenses, categories } = useApp();
  const [open, setOpen] = useState(false);
  const today = todayKey();
  const monthPrefix = today.slice(0, 7);

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthPrefix)),
    [expenses, monthPrefix],
  );
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayTotal = expenses
    .filter((expense) => expense.date === today)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    monthExpenses.forEach((expense) => {
      totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount);
    });

    return [...totals.entries()]
      .map(([id, total]) => ({
        category: categories.find((category) => category.id === id),
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [monthExpenses, categories]);

  return (
    <PageTransition>
      <header className="page-header">
        <div>
          <span className="eyebrow">Финансы без таблиц</span>
          <h1>Расходы</h1>
          <p>Записывай траты по ходу дня и смотри, куда уходит бюджет.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} /> Добавить расход
        </Button>
      </header>

      <section className="stats-grid expense-stats">
        <article className="stat-card stat-green">
          <div className="stat-icon"><CircleDollarSign size={20} /></div>
          <span>Сегодня</span>
          <strong>{formatMoney(todayTotal)}</strong>
          <p>расходы за день</p>
        </article>
        <article className="stat-card stat-lavender">
          <div className="stat-icon"><WalletCards size={20} /></div>
          <span>Этот месяц</span>
          <strong>{formatMoney(monthTotal)}</strong>
          <p>{monthExpenses.length} операций</p>
        </article>
      </section>

      <div className="expense-page-grid">
        <section className="panel page-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">История</span>
              <h2>Последние расходы</h2>
            </div>
          </div>
          <ExpenseList expenses={expenses} />
        </section>

        <aside className="panel category-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">За месяц</span>
              <h2>По категориям</h2>
            </div>
          </div>
          {categoryTotals.length ? (
            <div className="category-bars">
              {categoryTotals.map(({ category, total }) => {
                const percent = monthTotal ? Math.round((total / monthTotal) * 100) : 0;
                return (
                  <div className="category-bar-item" key={category?.id ?? total}>
                    <div className="category-bar-head">
                      <span>{category?.icon ?? "✨"} {category?.name ?? "Без категории"}</span>
                      <strong>{formatMoney(total)}</strong>
                    </div>
                    <div className="bar-track"><span style={{ width: `${percent}%` }} /></div>
                    <small>{percent}% от расходов месяца</small>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-copy">После первых расходов здесь появится распределение бюджета.</p>
          )}
        </aside>
      </div>

      <ExpenseFormModal open={open} onClose={() => setOpen(false)} />
    </PageTransition>
  );
}
