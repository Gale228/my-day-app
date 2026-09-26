"use client";

import { Cloud, Mail, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { LogoutButton } from "@/components/logout-button";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui";

const emojiChoices = ["✨", "🍜", "🚕", "🛍️", "🏠", "🎮", "☕", "💻", "🎁", "💊"];

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory, userName, userEmail } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");

  const create = async () => {
    if (!name.trim()) return;
    const id = await addCategory(name.trim(), icon);
    if (id) setName("");
  };

  return (
    <PageTransition>
      <header className="page-header">
        <div>
          <span className="eyebrow">Персонализация</span>
          <h1>Настройки</h1>
          <p>Аккаунт, синхронизация и категории расходов.</p>
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

        <aside className="settings-side-stack">
          <section className="panel account-card">
            <div className="account-avatar">{userName?.slice(0, 1).toUpperCase() || "Я"}</div>
            <div>
              <span className="eyebrow">Аккаунт</span>
              <h2>{userName || "Пользователь"}</h2>
              <p className="account-email"><Mail size={14} /> {userEmail}</p>
            </div>
            <div className="mobile-logout"><LogoutButton /></div>
          </section>

          <section className="panel privacy-card">
            <div className="privacy-icon"><ShieldCheck size={24} /></div>
            <span className="eyebrow">Облако</span>
            <h2>Данные синхронизируются</h2>
            <p>
              Задачи, расходы и категории теперь сохраняются в Supabase и привязаны к текущему аккаунту.
            </p>
            <div className="privacy-note sync-note">
              <Cloud size={16} /> На другом устройстве достаточно открыть сайт и войти под тем же email.
            </div>
          </section>
        </aside>
      </div>
    </PageTransition>
  );
}
