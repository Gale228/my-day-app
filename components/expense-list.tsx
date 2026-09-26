"use client";

import { AnimatePresence, motion } from "motion/react";
import { ReceiptText, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { EmptyState } from "@/components/ui";
import { formatMoney, formatShortDate } from "@/lib/date";
import type { Expense } from "@/lib/types";

export function ExpenseList({
  expenses,
  compact = false,
}: {
  expenses: Expense[];
  compact?: boolean;
}) {
  const { categories, deleteExpense } = useApp();

  if (!expenses.length) {
    return (
      <EmptyState
        icon={<ReceiptText size={22} />}
        title="Расходов пока нет"
        text="Запиши первую покупку, чтобы видеть реальную картину за день."
      />
    );
  }

  return (
    <div className="expense-list">
      <AnimatePresence initial={false}>
        {expenses.map((expense) => {
          const category = categories.find((item) => item.id === expense.categoryId);
          return (
            <motion.article
              layout
              key={expense.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="expense-row"
            >
              <div className="expense-icon">{category?.icon ?? "✨"}</div>
              <div className="expense-main">
                <strong>{expense.title}</strong>
                <span>
                  {category?.name ?? "Без категории"} · {formatShortDate(expense.date)}
                </span>
              </div>
              <strong className="expense-amount">{formatMoney(expense.amount)}</strong>
              {!compact && (
                <button
                  className="row-action danger-hover"
                  onClick={() => deleteExpense(expense.id)}
                  aria-label="Удалить расход"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
