"use client";

import { BarChart3, CalendarRange, CircleDollarSign } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { ExpenseCategoryChart, ExpenseTrendChart } from "@/components/expense-charts";
import { PageTransition } from "@/components/page-transition";
import { formatMoney, todayKey } from "@/lib/date";

export default function AnalyticsPage() {
  const { expenses, categories } = useApp();
  const month = todayKey().slice(0, 7);
  const monthExpenses = useMemo(() => expenses.filter((item) => item.date.startsWith(month)), [expenses, month]);
  const total = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const avg = monthExpenses.length ? total / new Date().getDate() : 0;
  const biggest = monthExpenses.reduce((max, item) => Math.max(max, item.amount), 0);
  return <PageTransition><header className="page-header"><div><span className="eyebrow">Финансовая картина</span><h1>Аналитика</h1><p>Смотри тренд расходов и замечай, где бюджет утекает быстрее всего.</p></div></header><section className="stats-grid"><article className="stat-card stat-lavender"><div className="stat-icon"><CircleDollarSign size={20}/></div><span>За месяц</span><strong>{formatMoney(total)}</strong><p>{monthExpenses.length} операций</p></article><article className="stat-card stat-green"><div className="stat-icon"><CalendarRange size={20}/></div><span>Среднее в день</span><strong>{formatMoney(avg)}</strong><p>по текущему месяцу</p></article><article className="stat-card stat-neutral"><div className="stat-icon"><BarChart3 size={20}/></div><span>Самая крупная трата</span><strong>{formatMoney(biggest)}</strong><p>в этом месяце</p></article></section><div className="analytics-grid"><section className="panel analytics-panel"><ExpenseTrendChart expenses={expenses} days={14} /></section><section className="panel analytics-panel"><ExpenseCategoryChart expenses={expenses} categories={categories} /></section></div></PageTransition>;
}
