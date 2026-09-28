"use client";

import { Check, Flag, Minus, Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { PageTransition } from "@/components/page-transition";
import { Button, EmptyState, Modal } from "@/components/ui";
import { formatShortDate } from "@/lib/date";

export default function GoalsPage() {
  const { goals, addGoal, setGoalProgress, toggleGoal, deleteGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");

  async function createGoal() {
    if (!title.trim()) return;
    const id = await addGoal({
      title: title.trim(), description: description.trim(),
      targetValue: targetValue ? Number(targetValue) : null,
      unit: unit.trim(), targetDate: targetDate || null,
    });
    if (!id) return;
    setTitle(""); setDescription(""); setTargetValue(""); setUnit(""); setTargetDate(""); setOpen(false);
  }

  const active = goals.filter((goal) => !goal.completed);
  const completed = goals.filter((goal) => goal.completed);

  return (
    <PageTransition>
      <header className="page-header">
        <div><span className="eyebrow">Двигаться вперёд</span><h1>Цели</h1><p>Большие планы становятся проще, когда виден прогресс.</p></div>
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Новая цель</Button>
      </header>

      <section className="stats-grid">
        <article className="stat-card stat-lavender"><div className="stat-icon"><Target size={20} /></div><span>Активные</span><strong>{active.length}</strong><p>целей в работе</p></article>
        <article className="stat-card stat-green"><div className="stat-icon"><Check size={20} /></div><span>Завершено</span><strong>{completed.length}</strong><p>можно гордиться</p></article>
      </section>

      {goals.length ? (
        <div className="goal-grid">
          {goals.map((goal) => {
            const percent = goal.targetValue ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : goal.completed ? 100 : 0;
            const step = goal.targetValue ? Math.max(1, Math.round(goal.targetValue / 20)) : 1;
            return (
              <article className={`panel goal-card ${goal.completed ? "goal-completed" : ""}`} key={goal.id}>
                <div className="goal-top"><div className="goal-symbol"><Flag size={20} /></div><button className="row-action danger-hover" onClick={() => deleteGoal(goal.id)} aria-label="Удалить цель"><Trash2 size={17} /></button></div>
                <div><h2>{goal.title}</h2>{goal.description && <p>{goal.description}</p>}</div>
                {goal.targetValue ? <>
                  <div className="goal-progress-row"><strong>{goal.currentValue.toLocaleString("ru-RU")} {goal.unit}</strong><span>{goal.targetValue.toLocaleString("ru-RU")} {goal.unit}</span></div>
                  <div className="goal-progress-track"><span style={{ width: `${percent}%` }} /></div>
                  <div className="goal-controls"><button onClick={() => setGoalProgress(goal.id, goal.currentValue - step)}><Minus size={16} /></button><span>{percent}%</span><button onClick={() => setGoalProgress(goal.id, goal.currentValue + step)}><Plus size={16} /></button></div>
                </> : <button className={`goal-check ${goal.completed ? "done" : ""}`} onClick={() => toggleGoal(goal.id)}><Check size={18} /> {goal.completed ? "Выполнено" : "Отметить выполненной"}</button>}
                <div className="goal-meta">{goal.targetDate ? `До ${formatShortDate(goal.targetDate)}` : "Без дедлайна"}</div>
              </article>
            );
          })}
        </div>
      ) : <section className="panel page-panel"><EmptyState icon={<Target size={24} />} title="Целей пока нет" text="Добавь первую цель — финансовую, личную или профессиональную." /></section>}

      <Modal open={open} onClose={() => setOpen(false)} title="Новая цель">
        <div className="modal-form">
          <label className="field"><span>Название</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, накопить на отпуск" /></label>
          <label className="field"><span>Описание</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Зачем эта цель важна?" rows={3} /></label>
          <div className="form-grid-2"><label className="field"><span>Цель числом</span><input type="number" min="0" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="100000" /></label><label className="field"><span>Единица</span><input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="₽, км, книг" /></label></div>
          <label className="field"><span>Срок</span><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
          <Button onClick={createGoal}><Plus size={18} /> Добавить цель</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
