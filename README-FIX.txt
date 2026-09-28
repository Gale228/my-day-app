MY DAY — AUTH FIX v1.3

Что исправлено:
1. Регистрация больше не использует Next.js Server Actions.
2. Вход больше не использует Server Actions.
3. Выход больше не использует Server Actions.
4. Добавлен PKCE callback /auth/callback.
5. Добавлен suppressHydrationWarning для полей авторизации,
   чтобы менеджеры паролей браузера не вызывали dev-overlay.

Как применить:
1. Распаковать архив.
2. Скопировать содержимое поверх корня проекта my-day-app.
3. НЕ удалять .env.local и .git.
4. Старый app/auth/actions.ts можно оставить — он больше не используется.
5. Перезапустить:
   rm -rf .next
   npm run dev

Supabase:
Authentication -> URL Configuration
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/**
http://localhost:3000/auth/callback

Если Confirm email включён, после регистрации придёт письмо.
Стандартная ConfirmationURL Supabase перенаправит на emailRedirectTo,
который теперь указывает на /auth/callback.
