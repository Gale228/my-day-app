-- MY DAY v1.6 — shared space for a couple/family
-- Run once in Supabase -> SQL Editor.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null references auth.users(id) on delete cascade,
  monthly_budget numeric(12,2) not null default 0 check (monthly_budget >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id),
  unique (user_id)
);

create table if not exists public.shared_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  icon text not null default '✨',
  created_at timestamptz not null default now()
);
create unique index if not exists shared_categories_household_name_unique
  on public.shared_categories (household_id, lower(name));

create table if not exists public.shared_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_by_name text not null default 'Пользователь',
  title text not null check (char_length(title) between 1 and 120),
  important boolean not null default false,
  completed boolean not null default false,
  due_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_by_name text not null default 'Пользователь',
  title text not null check (char_length(title) between 1 and 120),
  quantity text not null default '',
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.shared_expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  paid_by_name text not null default 'Пользователь',
  title text not null check (char_length(title) between 1 and 120),
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references public.shared_categories(id) on delete set null,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists household_members_user_idx on public.household_members(user_id);
create index if not exists shared_tasks_household_idx on public.shared_tasks(household_id, due_date);
create index if not exists shopping_items_household_idx on public.shopping_items(household_id, completed);
create index if not exists shared_expenses_household_idx on public.shared_expenses(household_id, expense_date);
create index if not exists shared_categories_household_idx on public.shared_categories(household_id);

-- Membership check intentionally runs as SECURITY DEFINER to avoid recursive RLS checks.
create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_household_member(uuid) from public;
grant execute on function public.is_household_member(uuid) to authenticated;

-- Owner membership and default shared categories are created automatically.
create or replace function public.bootstrap_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_members (household_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (household_id, user_id) do nothing;

  insert into public.shared_categories (household_id, name, icon)
  values
    (new.id, 'Еда', '🍜'),
    (new.id, 'Транспорт', '🚕'),
    (new.id, 'Дом', '🏠'),
    (new.id, 'Покупки', '🛍️'),
    (new.id, 'Развлечения', '🎮');

  return new;
end;
$$;

drop trigger if exists bootstrap_household_after_insert on public.households;
create trigger bootstrap_household_after_insert
after insert on public.households
for each row execute function public.bootstrap_household();

-- Join by an invite code without exposing other households through RLS.
create or replace function public.join_household_by_code(invite_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'User already belongs to a shared space';
  end if;

  select h.id into target_id
  from public.households h
  where h.invite_code = upper(trim(invite_code_input))
  limit 1;

  if target_id is null then
    raise exception 'Invite code not found';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (target_id, auth.uid(), 'member')
  on conflict (household_id, user_id) do nothing;

  return target_id;
end;
$$;

revoke all on function public.join_household_by_code(text) from public;
grant execute on function public.join_household_by_code(text) to authenticated;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.shared_categories enable row level security;
alter table public.shared_tasks enable row level security;
alter table public.shopping_items enable row level security;
alter table public.shared_expenses enable row level security;

-- HOUSEHOLDS
create policy "Members can view household"
on public.households for select to authenticated
using (public.is_household_member(id));

create policy "Authenticated users can create household"
on public.households for insert to authenticated
with check (created_by = auth.uid());

create policy "Members can update household"
on public.households for update to authenticated
using (public.is_household_member(id))
with check (public.is_household_member(id));

create policy "Owner can delete household"
on public.households for delete to authenticated
using (created_by = auth.uid());

-- MEMBERS
create policy "Members can view household members"
on public.household_members for select to authenticated
using (public.is_household_member(household_id));

-- SHARED CATEGORIES
create policy "Members can view shared categories"
on public.shared_categories for select to authenticated
using (public.is_household_member(household_id));
create policy "Members can create shared categories"
on public.shared_categories for insert to authenticated
with check (public.is_household_member(household_id));
create policy "Members can update shared categories"
on public.shared_categories for update to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));
create policy "Members can delete shared categories"
on public.shared_categories for delete to authenticated
using (public.is_household_member(household_id));

-- SHARED TASKS
create policy "Members can view shared tasks"
on public.shared_tasks for select to authenticated
using (public.is_household_member(household_id));
create policy "Members can create shared tasks"
on public.shared_tasks for insert to authenticated
with check (public.is_household_member(household_id) and created_by = auth.uid());
create policy "Members can update shared tasks"
on public.shared_tasks for update to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));
create policy "Members can delete shared tasks"
on public.shared_tasks for delete to authenticated
using (public.is_household_member(household_id));

-- SHOPPING
create policy "Members can view shopping items"
on public.shopping_items for select to authenticated
using (public.is_household_member(household_id));
create policy "Members can create shopping items"
on public.shopping_items for insert to authenticated
with check (public.is_household_member(household_id) and created_by = auth.uid());
create policy "Members can update shopping items"
on public.shopping_items for update to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));
create policy "Members can delete shopping items"
on public.shopping_items for delete to authenticated
using (public.is_household_member(household_id));

-- SHARED EXPENSES
create policy "Members can view shared expenses"
on public.shared_expenses for select to authenticated
using (public.is_household_member(household_id));
create policy "Members can create shared expenses"
on public.shared_expenses for insert to authenticated
with check (public.is_household_member(household_id) and created_by = auth.uid());
create policy "Members can update shared expenses"
on public.shared_expenses for update to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));
create policy "Members can delete shared expenses"
on public.shared_expenses for delete to authenticated
using (public.is_household_member(household_id));
