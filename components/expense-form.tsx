"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, Modal } from "@/components/ui";
import { todayKey } from "@/lib/date";

export function ExpenseFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { categories, addExpense, addCategory } = useApp();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayKey());
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const selectedCategory = useMemo(
    () => categoryId || categories[0]?.id || "",
    [categoryId, categories],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numberAmount = Number(amount.replace(",", "."));
    if (!title.trim() || !numberAmount || numberAmount <= 0 || !selectedCategory) return;

    addExpense({
      title: title.trim(),
      amount: numberAmount,
      categoryId: selectedCategory,
      date,
    });

    setTitle("");
    setAmount("");
    setDate(todayKey());
    onClose();
  };

  const createCategory = () => {
    if (!newCategory.trim()) return;
    const id = addCategory(newCategory.trim());
    setCategoryId(id);
    setNewCategory("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Новый расход">
      <form className="form-stack" onSubmit={submit}>
        <div className="two-fields">
          <label className="field">
            <span>Сумма</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0 ₽"
            />
          </label>
          <label className="field">
            <span>Дата</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>На что потрачено?</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, обед"
            maxLength={120}
          />
        </label>

        <label className="field">
          <span>Категория</span>
          <select
            value={selectedCategory}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-category-form">
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Своя категория"
          />
          <Button type="button" variant="secondary" onClick={createCategory}>
            <Plus size={16} />
            Добавить
          </Button>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Записать расход</Button>
        </div>
      </form>
    </Modal>
  );
}
