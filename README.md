# Мой день — v1.2

Личный планировщик на Next.js с авторизацией и синхронизацией через Supabase.

## Возможности

- отдельные страницы: главная, дела, расходы, настройки;
- регистрация и вход по email/паролю;
- подтверждение email через Supabase;
- отдельные данные для каждого пользователя через RLS;
- задачи, расходы и категории хранятся в Supabase;
- адаптивный интерфейс и мобильная навигация;
- плавные анимации.

## Переменные окружения

Создай `.env.local` по примеру `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

## Запуск

```bash
npm install
npm run dev
```

Открой http://localhost:3000

## Supabase Auth

В Authentication → URL Configuration укажи `http://localhost:3000` как Site URL на этапе локальной разработки.

В Authentication → Email Templates → Confirm signup замени ссылку подтверждения на:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

При переносе на сервер замени Site URL на реальный HTTPS-домен.
