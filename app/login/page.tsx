import Link from "next/link";
import { LockKeyhole, LogIn, Sparkles } from "lucide-react";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo"><Sparkles size={24} /></div>
        <div className="auth-heading">
          <span className="eyebrow">Личное пространство</span>
          <h1>С возвращением</h1>
          <p>Войди в «Мой день», чтобы продолжить с любого устройства.</p>
        </div>

        {params.message && <div className="auth-message success">{params.message}</div>}
        {params.error && <div className="auth-message error">{params.error}</div>}

        <form action={login} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          </label>
          <label className="field">
            <span>Пароль</span>
            <div className="auth-input-icon">
              <LockKeyhole size={17} />
              <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
            </div>
          </label>
          <button className="auth-submit" type="submit"><LogIn size={18} /> Войти</button>
        </form>

        <p className="auth-switch">Нет аккаунта? <Link href="/register">Зарегистрироваться</Link></p>
      </section>
    </main>
  );
}
