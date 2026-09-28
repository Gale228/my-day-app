"use client";

import { useMemo } from "react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { formatDateKey, formatMoney } from "@/lib/date";

export function ExpenseTrendChart({ expenses, days = 14 }: { expenses: Expense[]; days?: number }) {
  const data = useMemo(() => Array.from({ length: days }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (days - 1 - index));
    const key = formatDateKey(date);
    return { key, label: new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit" }).format(date), value: expenses.filter((item) => item.date === key).reduce((sum, item) => sum + item.amount, 0) };
  }), [days, expenses]);
  const max = Math.max(...data.map((item) => item.value), 1);
  const width = 760, height = 240, padX = 18, padY = 24;
  const points = data.map((item, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const y = height - padY - (item.value / max) * (height - padY * 2);
    return `${x},${y}`;
  }).join(" ");
  return <div className="chart-wrap"><div className="chart-head"><div><span className="eyebrow">Динамика</span><h2>Расходы за {days} дней</h2></div><strong>{formatMoney(data.reduce((sum, item) => sum + item.value, 0))}</strong></div><div className="line-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График расходов"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".22"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polyline className="chart-grid-line" points={`0,${height-padY} ${width},${height-padY}`} /><polygon className="chart-area" points={`${padX},${height-padY} ${points} ${width-padX},${height-padY}`} /><polyline className="chart-line" points={points} />{data.map((item, index) => { const [x,y] = points.split(" ")[index].split(","); return <circle key={item.key} className="chart-point" cx={x} cy={y} r="4"><title>{item.label}: {formatMoney(item.value)}</title></circle>; })}</svg><div className="chart-labels">{data.filter((_, i) => i % Math.max(1, Math.floor(days / 7)) === 0).map((item) => <span key={item.key}>{item.label}</span>)}</div></div></div>;
}

export function ExpenseCategoryChart({ expenses, categories }: { expenses: Expense[]; categories: ExpenseCategory[] }) {
  const month = formatDateKey(new Date()).slice(0, 7);
  const data = useMemo(() => {
    const map = new Map<string, number>();
    expenses.filter((item) => item.date.startsWith(month)).forEach((item) => map.set(item.categoryId ?? "none", (map.get(item.categoryId ?? "none") ?? 0) + item.amount));
    return [...map.entries()].map(([id, value]) => ({ id, value, category: categories.find((item) => item.id === id) })).sort((a,b) => b.value-a.value);
  }, [categories, expenses, month]);
  const max = Math.max(...data.map((item) => item.value), 1);
  return <div className="category-chart"><div className="chart-head"><div><span className="eyebrow">Структура</span><h2>Категории месяца</h2></div></div>{data.length ? data.map((item) => <div className="category-chart-row" key={item.id}><div className="category-chart-label"><span>{item.category?.icon ?? "✨"}</span><strong>{item.category?.name ?? "Без категории"}</strong></div><div className="category-chart-bar"><span style={{ width: `${Math.max(3, (item.value/max)*100)}%` }} /></div><b>{formatMoney(item.value)}</b></div>) : <p className="muted-copy">Добавь расходы — здесь появится график по категориям.</p>}</div>;
}
