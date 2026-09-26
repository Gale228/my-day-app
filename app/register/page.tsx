"use client";

import Link from "next/link";
import { Sparkles, UserPlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (name.length < 2) {
      setError("Укажи имя.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Укажи email.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message || "Не удалось создать аккаунт.");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setMessage(
      "Аккаунт создан. Проверь почту и подтверди email, затем вернись на сайт."
    );
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-logo">
          <Sparkles size={24} />
        </div>

        <div className="auth-heading">
          <span className="eyebrow">Новый аккаунт</span>
          <h1>Создать свой «Мой день»</h1>
          <p>У каждого пользователя будут свои задачи, расходы и категории.</p>
        </div>

        {error && <div className="auth-message error">{error}</div>}
        {message && <div className="auth-message success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Имя</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Например, Дарья"
              maxLength={50}
              required
              suppressHydrationWarning
            />
          </label>

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

          <div className="auth-two-fields">
            <label className="field">
              <span>Пароль</span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Минимум 8 символов"
                required
                suppressHydrationWarning
              />
            </label>

            <label className="field">
              <span>Повтори пароль</span>
              <input
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Ещё раз"
                required
                suppressHydrationWarning
              />
            </label>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </section>
    </main>
  );
}
