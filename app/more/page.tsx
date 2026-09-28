"use client";
import Link from "next/link";
import { BarChart3, ChevronRight, CircleHelp, Goal, NotebookPen, Repeat2, Settings } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const items = [
  { href: "/goals", title: "Цели", text: "Прогресс по личным и финансовым целям", icon: Goal },
  { href: "/habits", title: "Привычки", text: "Ежедневный и недельный трекер привычек", icon: Repeat2 },
  { href: "/notes", title: "Заметки", text: "Идеи и важные записи", icon: NotebookPen },
  { href: "/analytics", title: "Аналитика", text: "Графики и статистика расходов", icon: BarChart3 },
  { href: "/faq", title: "FAQ", text: "Ответы о возможностях и синхронизации", icon: CircleHelp },
  { href: "/settings", title: "Настройки", text: "Тема, категории и аккаунт", icon: Settings },
];
export default function MorePage() { return <PageTransition><header className="page-header"><div><span className="eyebrow">Все инструменты</span><h1>Ещё</h1><p>Дополнительные разделы твоего личного пространства.</p></div></header><div className="more-grid">{items.map(({href,title,text,icon:Icon}) => <Link href={href} className="panel more-card" key={href}><div className="more-icon"><Icon size={22}/></div><div><h2>{title}</h2><p>{text}</p></div><ChevronRight size={20}/></Link>)}</div></PageTransition>; }
