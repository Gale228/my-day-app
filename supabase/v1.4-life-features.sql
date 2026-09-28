-- MY DAY v1.4: goals, habits, notes

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  target_value numeric(14,2),
  current_value numeric(14,2) not null default 0 check (current_value >= 0),
  unit text not null default '',
  target_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  icon text not null default '✨',
  target_per_week integer not null default 5 check (target_per_week between 1 and 7),
  created_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, habit_id, completed_on)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Без названия' check (char_length(title) between 1 and 160),
  content text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_idx on public.goals(user_id);
create index if not exists habits_user_idx on public.habits(user_id);
create index if not exists habit_completions_user_idx on public.habit_completions(user_id);
create index if not exists habit_completions_habit_date_idx on public.habit_completions(habit_id, completed_on);
create index if not exists notes_user_updated_idx on public.notes(user_id, updated_at desc);

alter table public.goals enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.notes enable row level security;

do $$ begin
  create policy "Users manage own goals" on public.goals for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users manage own habits" on public.habits for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users manage own habit completions" on public.habit_completions for all to authenticated
    using ((select auth.uid()) = user_id and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid())))
    with check ((select auth.uid()) = user_id and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid())));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users manage own notes" on public.notes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
