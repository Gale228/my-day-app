"use client";

import { Check, Flame, Plus, Repeat2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { PageTransition } from "@/components/page-transition";
import { Button, EmptyState, Modal } from "@/components/ui";
import { formatDateKey, todayKey } from "@/lib/date";

const icons = ["💧", "🏃", "📚", "🇬🇧", "🧘", "💪", "🥗", "😴", "🧹", "💻"];

function lastDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (count - 1 - index));
    return { key: formatDateKey(date), day: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).slice(0, 2) };
  });
}

export default function HabitsPage() {
  const { habits, habitCompletions, addHabit, toggleHabitForDate, deleteHabit } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("💧");
  const [target, setTarget] = useState(5);
  const days = useMemo(() => lastDays(7), []);
  const today = todayKey();

  async function createHabit() {
    if (!title.trim()) return;
    const id = await addHabit({ title: title.trim(), icon, targetPerWeek: target });
    if (id) { setTitle(""); setOpen(false); }
  }

  const doneToday = habits.filter((habit) => habitCompletions.some((item) => item.habitId === habit.id && item.date === today)).length;

  return (
    <PageTransition>
      <header className="page-header"><div><span className="eyebrow">Маленькие шаги</span><h1>Привычки</h1><p>Отмечай выполнение каждый день и собирай свою серию.</p></div><Button onClick={() => setOpen(true)}><Plus size={18} /> Новая привычка</Button></header>
      <section className="stats-grid habit-stats"><article className="stat-card stat-green"><div className="stat-icon"><Check size={20} /></div><span>Сегодня выполнено</span><strong>{doneToday}/{habits.length}</strong><p>привычек</p></article><article className="stat-card stat-lavender"><div className="stat-icon"><Flame size={20} /></div><span>Активных привычек</span><strong>{habits.length}</strong><p>держим ритм</p></article></section>

      {habits.length ? <section className="habit-list">
        {habits.map((habit) => {
          const weekCount = days.filter((day) => habitCompletions.some((item) => item.habitId === habit.id && item.date === day.key)).length;
          const todayDone = habitCompletions.some((item) => item.habitId === habit.id && item.date === today);
          return <article className="panel habit-card" key={habit.id}>
            <div className="habit-main"><div className="habit-icon">{habit.icon}</div><div className="habit-title"><h2>{habit.title}</h2><p>{weekCount} из {habit.targetPerWeek} раз на этой неделе</p></div><button className={`habit-today ${todayDone ? "done" : ""}`} onClick={() => toggleHabitForDate(habit.id)}>{todayDone ? <Check size={18} /> : <Repeat2 size={18} />}<span>{todayDone ? "Готово" : "Сегодня"}</span></button><button className="row-action danger-hover" onClick={() => deleteHabit(habit.id)} aria-label="Удалить привычку"><Trash2 size={17} /></button></div>
            <div className="habit-days">{days.map((day) => { const done = habitCompletions.some((item) => item.habitId === habit.id && item.date === day.key); return <button key={day.key} className={done ? "done" : ""} onClick={() => toggleHabitForDate(habit.id, day.key)}><span>{day.day}</span><i>{done ? <Check size={14} /> : new Date(`${day.key}T12:00:00`).getDate()}</i></button>; })}</div>
          </article>;
        })}
      </section> : <section className="panel page-panel"><EmptyState icon={<Repeat2 size={24} />} title="Привычек пока нет" text="Например: пить воду, читать, тренироваться или заниматься английским." /></section>}

      <Modal open={open} onClose={() => setOpen(false)} title="Новая привычка"><div className="modal-form"><div className="emoji-picker">{icons.map((item) => <button key={item} className={icon === item ? "selected" : ""} onClick={() => setIcon(item)}>{item}</button>)}</div><label className="field"><span>Название</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, 20 минут английского" /></label><label className="field"><span>Сколько раз в неделю</span><select value={target} onChange={(e) => setTarget(Number(e.target.value))}>{[1,2,3,4,5,6,7].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><Button onClick={createHabit}><Plus size={18} /> Добавить привычку</Button></div></Modal>
    </PageTransition>
  );
}
