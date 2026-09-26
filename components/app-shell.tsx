"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare2,
  CircleDollarSign,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/app-provider";
import { LogoutButton } from "@/components/logout-button";

const navigation = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/tasks", label: "Дела", icon: CheckSquare2 },
  { href: "/expenses", label: "Расходы", icon: CircleDollarSign },
  { href: "/settings", label: "Настройки", icon: Settings },
];

function NavigationLink({
  href,
  label,
  icon: Icon,
}: (typeof navigation)[number]) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`nav-link ${active ? "nav-link-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="nav-icon-wrap"><Icon size={20} strokeWidth={2} /></span>
      <span>{label}</span>
      {active && (
        <motion.span
          layoutId="sidebar-indicator"
          className="nav-indicator"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
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
            <div>
              <strong>Мой день</strong>
              <span>личное пространство</span>
            </div>
          </div>

          <nav className="desktop-nav" aria-label="Основная навигация">
            {navigation.map((item) => <NavigationLink key={item.href} {...item} />)}
          </nav>

          <div className="sidebar-footer-stack">
            <div className="sidebar-tip">
              <CalendarDays size={18} />
              <div>
                <strong>Синхронизация включена</strong>
                <p>Задачи и расходы хранятся в твоём аккаунте Supabase.</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        <div className="content-shell">{children}</div>

        <nav className="mobile-nav" aria-label="Мобильная навигация">
          {navigation.map(({ href, label, icon: Icon }) => (
            <MobileNavigationLink key={href} href={href} label={label} Icon={Icon} />
          ))}
        </nav>
      </div>
    </AppProvider>
  );
}

function MobileNavigationLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={`mobile-nav-link ${active ? "active" : ""}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}
