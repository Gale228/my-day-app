"use client";

import Link from "next/link";
import { CircleHelp, Cloud, Download, Mail, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { LogoutButton } from "@/components/logout-button";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";

const emojiChoices = ["✨", "🍜", "🚕", "🛍️", "🏠", "🎮", "☕", "💻", "🎁", "💊"];

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory, userName, userEmail } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const create = async () => { if (!name.trim()) return; const id = await addCategory(name.trim(), icon); if (id) setName(""); };
  return <PageTransition><header className="page-header"><div><span className="eyebrow">Персонализация</span><h1>Настройки</h1><p>Внешний вид, аккаунт, PWA и категории расходов.</p></div></header><div className="settings-grid"><section className="panel page-panel"><div className="panel-heading"><div><span className="eyebrow">Расходы</span><h2>Категории</h2></div></div><div className="category-create"><div className="emoji-picker" aria-label="Иконка категории">{emojiChoices.map((emoji) => <button key={emoji} className={icon===emoji?"selected":""} onClick={() => setIcon(emoji)}>{emoji}</button>)}</div><div className="inline-category-form"><input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Название категории"/><Button onClick={create}><Plus size={16}/> Добавить</Button></div></div><div className="settings-category-list">{categories.map((category)=><div className="settings-category-row" key={category.id}><span className="settings-category-icon">{category.icon}</span><strong>{category.name}</strong><button className="row-action danger-hover" onClick={()=>deleteCategory(category.id)} aria-label={`Удалить категорию ${category.name}`}><Trash2 size={17}/></button></div>)}</div></section><aside className="settings-side-stack"><section className="panel account-card"><div className="account-avatar">{userName?.slice(0,1).toUpperCase()||"Я"}</div><div><span className="eyebrow">Аккаунт</span><h2>{userName||"Пользователь"}</h2><p className="account-email"><Mail size={14}/> {userEmail}</p></div><div className="mobile-logout"><LogoutButton/></div></section><section className="panel settings-feature-card"><span className="eyebrow">Оформление</span><h2>Тема приложения</h2><p>Можно переключаться между светлой и тёмной темой. Выбор сохранится на устройстве.</p><ThemeToggle /></section><section className="panel settings-feature-card"><div className="privacy-icon"><Download size={24}/></div><span className="eyebrow">PWA</span><h2>Установи как приложение</h2><p>На iPhone: Safari → Поделиться → «На экран Домой». На Android/Chrome — «Установить приложение».</p><div className="privacy-note sync-note"><Cloud size={16}/> После публикации по HTTPS приложение сможет работать в полноэкранном режиме и кэшировать оболочку.</div></section><Link href="/faq" className="panel settings-feature-card settings-help-card"><div className="privacy-icon"><CircleHelp size={24}/></div><span className="eyebrow">Помощь</span><h2>FAQ</h2><p>Ответы о задачах, расходах, синхронизации, PWA и безопасности.</p></Link><section className="panel privacy-card"><div className="privacy-icon"><ShieldCheck size={24}/></div><span className="eyebrow">Облако</span><h2>Данные синхронизируются</h2><p>Все личные разделы привязаны к текущему аккаунту через Supabase и RLS.</p></section></aside></div></PageTransition>;
}
