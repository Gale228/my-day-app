"use client";

import Link from "next/link";
import { LockKeyhole, LogIn, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get("error") ?? "");
    setMessage(params.get("message") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Не удалось войти. Проверь email и пароль.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <Sparkles size={24} />
        </div>

        <div className="auth-heading">
          <span className="eyebrow">Личное пространство</span>
          <h1>С возвращением</h1>
          <p>Войди в «Мой день», чтобы продолжить с любого устройства.</p>
        </div>

        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              suppressHydrationWarning
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <div className="auth-input-icon">
              <LockKeyhole size={17} />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                suppressHydrationWarning
              />
            </div>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </section>
    </main>
  );
}
