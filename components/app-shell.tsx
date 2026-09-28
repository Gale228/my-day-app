"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CheckSquare2,
  CircleDollarSign,
  Goal,
  Home,
  HelpCircle,
  MoreHorizontal,
  NotebookPen,
  Repeat2,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/app-provider";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/tasks", label: "Дела", icon: CheckSquare2 },
  { href: "/expenses", label: "Расходы", icon: CircleDollarSign },
  { href: "/shared", label: "Общее", icon: UsersRound },
  { href: "/goals", label: "Цели", icon: Goal },
  { href: "/habits", label: "Привычки", icon: Repeat2 },
  { href: "/notes", label: "Заметки", icon: NotebookPen },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/settings", label: "Настройки", icon: Settings },
];

const mobileNavigation = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/tasks", label: "Дела", icon: CheckSquare2 },
  { href: "/expenses", label: "Расходы", icon: CircleDollarSign },
  { href: "/shared", label: "Общее", icon: UsersRound },
  { href: "/more", label: "Ещё", icon: MoreHorizontal },
];

function NavigationLink({ href, label, icon: Icon }: (typeof navigation)[number]) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link href={href} className={`nav-link ${active ? "nav-link-active" : ""}`} aria-current={active ? "page" : undefined}>
      <span className="nav-icon-wrap"><Icon size={20} strokeWidth={2} /></span>
      <span>{label}</span>
      {active && <motion.span layoutId="sidebar-indicator" className="nav-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (authPage) return <>{children}</>;

  return (
    <AppProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-logo"><Sparkles size={20} /></div>
            <div><strong>Мой день</strong><span>личное пространство</span></div>
          </div>

          <div className="space-switcher" aria-label="Режим пространства">
            <Link href="/" className={!pathname.startsWith("/shared") ? "active" : ""}>Моё</Link>
            <Link href="/shared" className={pathname.startsWith("/shared") ? "active" : ""}><UsersRound size={14} /> Общее</Link>
          </div>

          <nav className="desktop-nav" aria-label="Основная навигация">
            {navigation.map((item) => <NavigationLink key={item.href} {...item} />)}
          </nav>

          <div className="sidebar-footer-stack">
            <ThemeToggle />
            <div className="sidebar-tip">
              <Sparkles size={18} />
              <div><strong>Всё синхронизировано</strong><p>Задачи, финансы, цели, привычки и заметки хранятся в Supabase.</p></div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        <div className="content-shell">{children}</div>

        <nav className="mobile-nav" aria-label="Мобильная навигация">
          {mobileNavigation.map(({ href, label, icon: Icon }) => <MobileNavigationLink key={href} href={href} label={label} Icon={Icon} />)}
        </nav>
      </div>
    </AppProvider>
  );
}

function MobileNavigationLink({ href, label, Icon }: { href: string; label: string; Icon: typeof Home }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/more" && ["/goals", "/habits", "/notes", "/analytics", "/faq", "/settings"].some((path) => pathname.startsWith(path)));
  return <Link href={href} className={`mobile-nav-link ${active ? "active" : ""}`}><Icon size={20} /><span>{label}</span></Link>;
}
