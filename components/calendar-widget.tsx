"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp, useTodayKey } from "@/components/app-provider";
import { formatDateKey, getCalendarDays, monthTitle } from "@/lib/date";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarWidget() {
  const { tasks, expenses } = useApp();
  const today = useTodayKey();
  const [cursor, setCursor] = useState(() => new Date());
  const [collapsed, setCollapsed] = useState(false);

  const days = useMemo(() => getCalendarDays(cursor), [cursor]);
  const busyDays = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((task) => set.add(task.dueDate));
    expenses.forEach((expense) => set.add(expense.date));
    return set;
  }, [tasks, expenses]);

  const changeMonth = (delta: number) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return (
    <motion.section layout className="panel calendar-panel">
      <div className="panel-heading calendar-heading">
        <div>
          <span className="eyebrow">Планирование</span>
          <h2>Календарь</h2>
        </div>
        <button
          className="calendar-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          {collapsed ? "Показать" : "Скрыть"}
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronDown size={17} />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="calendar-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="calendar-body"
          >
            <div className="calendar-toolbar">
              <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Предыдущий месяц">
                <ChevronLeft size={18} />
              </button>
              <strong>{monthTitle(cursor)}</strong>
              <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Следующий месяц">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-grid calendar-weekdays">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {days.map(({ date, key, isCurrentMonth }) => {
                const isToday = key === today;
                return (
                  <div
                    key={key}
                    className={`calendar-day ${!isCurrentMonth ? "muted" : ""} ${isToday ? "today" : ""}`}
                    title={busyDays.has(key) ? "Есть записи" : undefined}
                  >
                    <span>{date.getDate()}</span>
                    {busyDays.has(key) && <i />}
                  </div>
                );
              })}
            </div>

            <button
              className="today-link"
              onClick={() => {
                const now = new Date();
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
            >
              Сегодня · {formatDateKey(new Date()).split("-").reverse().join(".")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
