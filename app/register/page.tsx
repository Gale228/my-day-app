import Link from "next/link";
import { Sparkles, UserPlus } from "lucide-react";
import { register } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-logo"><Sparkles size={24} /></div>
        <div className="auth-heading">
          <span className="eyebrow">Новый аккаунт</span>
          <h1>Создать свой «Мой день»</h1>
          <p>У каждого пользователя будут свои задачи, расходы и категории.</p>
        </div>

        {params.error && <div className="auth-message error">{params.error}</div>}

        <form action={register} className="auth-form">
          <label className="field">
            <span>Имя</span>
            <input name="name" type="text" autoComplete="name" placeholder="Например, Дарья" maxLength={50} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          </label>
          <div className="auth-two-fields">
            <label className="field">
              <span>Пароль</span>
              <input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Минимум 8 символов" required />
            </label>
            <label className="field">
              <span>Повтори пароль</span>
              <input name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} placeholder="Ещё раз" required />
            </label>
          </div>
          <button className="auth-submit" type="submit"><UserPlus size={18} /> Создать аккаунт</button>
        </form>

        <p className="auth-switch">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
      </section>
    </main>
  );
}
