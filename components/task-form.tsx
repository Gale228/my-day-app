"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Star } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, Modal } from "@/components/ui";
import { todayKey } from "@/lib/date";

export function TaskFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addTask } = useApp();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayKey());
  const [important, setImportant] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    await addTask({ title: title.trim(), dueDate, important });
    setTitle("");
    setDueDate(todayKey());
    setImportant(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Новое дело">
      <form className="form-stack" onSubmit={submit}>
        <label className="field">
          <span>Что нужно сделать?</span>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, проверить резервные копии"
            maxLength={120}
          />
        </label>

        <label className="field">
          <span>Дата</span>
          <div className="input-with-icon">
            <CalendarDays size={18} />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </label>

        <button
          type="button"
          className={`priority-toggle ${important ? "active" : ""}`}
          onClick={() => setImportant((value) => !value)}
        >
          <Star size={18} fill={important ? "currentColor" : "none"} />
          <div>
            <strong>Важная цель</strong>
            <span>{important ? "Будет выделена в списке" : "Обычный приоритет"}</span>
          </div>
        </button>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Добавить дело</Button>
        </div>
      </form>
    </Modal>
  );
}
