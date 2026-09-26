"use client";

import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui";

const emojiChoices = ["✨", "🍜", "🚕", "🛍️", "🏠", "🎮", "☕", "💻", "🎁", "💊"];

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");

  const create = () => {
    if (!name.trim()) return;
    addCategory(name.trim(), icon);
    setName("");
  };

  return (
    <PageTransition>
      <header className="page-header">
        <div>
          <span className="eyebrow">Персонализация</span>
          <h1>Настройки</h1>
          <p>Пока здесь находятся категории. Позже добавим темы, аккаунт и синхронизацию.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="panel page-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Расходы</span>
              <h2>Категории</h2>
            </div>
          </div>

          <div className="category-create">
            <div className="emoji-picker" aria-label="Иконка категории">
              {emojiChoices.map((emoji) => (
                <button
                  key={emoji}
                  className={icon === emoji ? "selected" : ""}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="inline-category-form">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Название категории"
              />
              <Button onClick={create}>
                <Plus size={16} /> Добавить
              </Button>
            </div>
          </div>

          <div className="settings-category-list">
            {categories.map((category) => (
              <div className="settings-category-row" key={category.id}>
                <span className="settings-category-icon">{category.icon}</span>
                <strong>{category.name}</strong>
                <button
                  className="row-action danger-hover"
                  onClick={() => deleteCategory(category.id)}
                  aria-label={`Удалить категорию ${category.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel privacy-card">
          <div className="privacy-icon"><ShieldCheck size={24} /></div>
          <span className="eyebrow">Первая версия</span>
          <h2>Данные остаются у тебя</h2>
          <p>
            Сейчас задачи и расходы сохраняются в localStorage браузера. Серверу ничего не отправляется.
          </p>
          <div className="privacy-note">
            Следующий этап — аккаунт и собственная база данных для синхронизации между устройствами.
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
