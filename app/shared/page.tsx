"use client";

import {
  Check,
  Copy,
  KeyRound,
  ListTodo,
  PiggyBank,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { PageTransition } from "@/components/page-transition";
import { SharedProvider, useShared } from "@/components/shared-provider";
import { Button, EmptyState } from "@/components/ui";
import { formatMoney, formatShortDate, todayKey } from "@/lib/date";

type Tab = "overview" | "tasks" | "shopping" | "expenses";

const tabs: { id: Tab; label: string; icon: typeof UsersRound }[] = [
  { id: "overview", label: "Обзор", icon: UsersRound },
  { id: "tasks", label: "Дела", icon: ListTodo },
  { id: "shopping", label: "Покупки", icon: ShoppingCart },
  { id: "expenses", label: "Расходы", icon: WalletCards },
];

export default function SharedPage() {
  return (
    <SharedProvider>
      <SharedPageContent />
    </SharedProvider>
  );
}

function SharedPageContent() {
  const {
    hydrated,
    error,
    household,
    memberCount,
    tasks,
    shoppingItems,
    expenses,
  } = useShared();
  const [tab, setTab] = useState<Tab>("overview");

  if (!hydrated) {
    return (
      <PageTransition>
        <header className="page-header">
          <div><span className="eyebrow">Моё / Общее</span><h1>Общее пространство</h1><p>Загружаем совместные данные…</p></div>
        </header>
        <section className="panel shared-loading"><div className="shared-loader" /></section>
      </PageTransition>
    );
  }

  if (!household) {
    return <SharedOnboarding error={error} />;
  }

  const monthPrefix = todayKey().slice(0, 7);
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthPrefix));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const openTasks = tasks.filter((task) => !task.completed).length;
  const shoppingLeft = shoppingItems.filter((item) => !item.completed).length;

  return (
    <PageTransition>
      <header className="page-header shared-header">
        <div>
          <span className="eyebrow">Моё / Общее</span>
          <h1>{household.name}</h1>
          <p>{memberCount} {memberCount === 1 ? "участник" : "участника"} · совместные дела, покупки и бюджет.</p>
        </div>
        <InviteCode code={household.inviteCode} />
      </header>

      <section className="shared-summary-grid">
        <article className="panel shared-summary-card">
          <div className="shared-summary-icon lavender"><ListTodo size={20} /></div>
          <span>Общие дела</span>
          <strong>{openTasks}</strong>
          <small>ещё в работе</small>
        </article>
        <article className="panel shared-summary-card">
          <div className="shared-summary-icon green"><ShoppingCart size={20} /></div>
          <span>Список покупок</span>
          <strong>{shoppingLeft}</strong>
          <small>нужно купить</small>
        </article>
        <article className="panel shared-summary-card">
          <div className="shared-summary-icon neutral"><WalletCards size={20} /></div>
          <span>Общие расходы</span>
          <strong>{formatMoney(monthTotal)}</strong>
          <small>за текущий месяц</small>
        </article>
      </section>

      <div className="shared-tabs" role="tablist" aria-label="Раздел общего пространства">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {error && <div className="auth-message error shared-error">{error}</div>}

      {tab === "overview" && <SharedOverview />}
      {tab === "tasks" && <SharedTasks />}
      {tab === "shopping" && <SharedShopping />}
      {tab === "expenses" && <SharedExpenses />}
    </PageTransition>
  );
}

function SharedOnboarding({ error }: { error: string }) {
  const { createHousehold, joinHousehold } = useShared();
  const [name, setName] = useState("Наше пространство");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | "">("");

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setLoading("create");
    await createHousehold(name);
    setLoading("");
  };

  const join = async (event: FormEvent) => {
    event.preventDefault();
    setLoading("join");
    await joinHousehold(code);
    setLoading("");
  };

  return (
    <PageTransition>
      <header className="page-header">
        <div><span className="eyebrow">Новая глава</span><h1>Общее пространство</h1><p>Свяжи два аккаунта одним кодом — личные данные при этом останутся личными.</p></div>
      </header>

      {error && <div className="auth-message error shared-error">{error}</div>}

      <section className="shared-onboarding-grid">
        <form className="panel shared-onboarding-card" onSubmit={create}>
          <div className="shared-onboarding-icon"><UsersRound size={24} /></div>
          <span className="eyebrow">Создать</span>
          <h2>Создать пространство</h2>
          <p>Сделай общее пространство и передай девушке код приглашения.</p>
          <label className="field">
            <span>Название</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Например, Андрей & Дарья" />
          </label>
          <Button type="submit" disabled={loading !== "" || !name.trim()}><Plus size={17} /> {loading === "create" ? "Создаём…" : "Создать"}</Button>
        </form>

        <form className="panel shared-onboarding-card" onSubmit={join}>
          <div className="shared-onboarding-icon green"><KeyRound size={24} /></div>
          <span className="eyebrow">Присоединиться</span>
          <h2>Есть код приглашения?</h2>
          <p>Второй пользователь вводит код и сразу получает доступ к общим данным.</p>
          <label className="field">
            <span>Код</span>
            <input className="invite-input" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={8} placeholder="A1B2C3D4" />
          </label>
          <Button type="submit" variant="secondary" disabled={loading !== "" || code.trim().length < 4}>{loading === "join" ? "Подключаем…" : "Присоединиться"}</Button>
        </form>
      </section>

      <section className="panel shared-privacy-note">
        <strong>Личное остаётся личным</strong>
        <p>Твои личные задачи, расходы, цели, привычки и заметки не становятся общими. Совместными будут только данные, которые вы создаёте внутри раздела «Общее».</p>
      </section>
    </PageTransition>
  );
}

function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className="invite-code" type="button" onClick={copy} title="Скопировать код приглашения">
      <span>Код приглашения</span>
      <strong>{code}</strong>
      {copied ? <Check size={17} /> : <Copy size={17} />}
    </button>
  );
}

function SharedOverview() {
  const { household, memberCount, expenses, tasks, shoppingItems, updateBudget } = useShared();
  const [budget, setBudget] = useState(String(household?.monthlyBudget ?? 0));
  if (!household) return null;

  const monthPrefix = todayKey().slice(0, 7);
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthPrefix));
  const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = Math.max(0, household.monthlyBudget - total);
  const budgetPercent = household.monthlyBudget > 0 ? Math.min(100, Math.round((total / household.monthlyBudget) * 100)) : 0;
  const recent = expenses.slice(0, 4);

  const saveBudget = async (event: FormEvent) => {
    event.preventDefault();
    await updateBudget(Number(budget.replace(",", ".")) || 0);
  };

  return (
    <div className="shared-overview-grid">
      <section className="panel shared-budget-card">
        <div className="panel-heading"><div><span className="eyebrow">Общий бюджет</span><h2>{formatMoney(household.monthlyBudget)}</h2></div><PiggyBank size={24} /></div>
        <div className="shared-budget-numbers"><span>Потрачено <strong>{formatMoney(total)}</strong></span><span>Осталось <strong>{formatMoney(remaining)}</strong></span></div>
        <div className="goal-progress-track"><span style={{ width: `${budgetPercent}%` }} /></div>
        <small>{household.monthlyBudget ? `${budgetPercent}% месячного бюджета` : "Задайте ориентир на месяц"}</small>
        <form className="shared-budget-form" onSubmit={saveBudget}>
          <input inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Например, 60000" />
          <Button type="submit" variant="secondary">Сохранить лимит</Button>
        </form>
      </section>

      <section className="panel shared-pulse-card">
        <div className="panel-heading"><div><span className="eyebrow">Сейчас</span><h2>Общий пульс</h2></div><UsersRound size={22} /></div>
        <div className="shared-pulse-list">
          <div><span>Участников</span><strong>{memberCount}</strong></div>
          <div><span>Дел в работе</span><strong>{tasks.filter((task) => !task.completed).length}</strong></div>
          <div><span>Покупок осталось</span><strong>{shoppingItems.filter((item) => !item.completed).length}</strong></div>
          <div><span>Расходов за месяц</span><strong>{monthExpenses.length}</strong></div>
        </div>
      </section>

      <section className="panel shared-recent-card">
        <div className="panel-heading"><div><span className="eyebrow">Последнее</span><h2>Общие расходы</h2></div></div>
        {recent.length ? <div className="shared-simple-list">{recent.map((expense) => <div key={expense.id}><div><strong>{expense.title}</strong><span>{expense.paidByName} · {formatShortDate(expense.date)}</span></div><b>{formatMoney(expense.amount)}</b></div>)}</div> : <EmptyState icon={<WalletCards size={20} />} title="Пока пусто" text="Первый совместный расход появится здесь." />}
      </section>
    </div>
  );
}

function SharedTasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useShared();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayKey());
  const [important, setImportant] = useState(false);
  const sorted = useMemo(() => [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || Number(b.important) - Number(a.important) || a.dueDate.localeCompare(b.dueDate)), [tasks]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await addTask({ title, dueDate: date, important });
    setTitle("");
    setDate(todayKey());
    setImportant(false);
  };

  return (
    <div className="shared-section-grid">
      <form className="panel shared-create-card" onSubmit={submit}>
        <span className="eyebrow">Добавить</span><h2>Общее дело</h2>
        <label className="field"><span>Что сделать?</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, оплатить интернет" maxLength={120} /></label>
        <label className="field"><span>Дата</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <button type="button" className={`priority-toggle ${important ? "active" : ""}`} onClick={() => setImportant((value) => !value)}><Star size={18} fill={important ? "currentColor" : "none"} /><div><strong>Важное</strong><span>{important ? "Выделим в общем списке" : "Обычный приоритет"}</span></div></button>
        <Button type="submit" disabled={!title.trim()}><Plus size={17} /> Добавить дело</Button>
      </form>

      <section className="panel shared-list-card">
        <div className="panel-heading"><div><span className="eyebrow">Для вас двоих</span><h2>Общие дела</h2></div><span className="shared-count">{tasks.length}</span></div>
        {sorted.length ? <div className="shared-item-list">{sorted.map((task) => <div className={`shared-item ${task.completed ? "completed" : ""}`} key={task.id}><button className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label="Изменить статус">{task.completed && <Check size={14} />}</button><div className="shared-item-main"><div className="task-title-line"><strong>{task.title}</strong>{task.important && <span className="important-badge"><Star size={9} fill="currentColor" />Важно</span>}</div><span>{formatShortDate(task.dueDate)} · добавил(а) {task.createdByName}</span></div><button className="row-action danger-hover" onClick={() => deleteTask(task.id)} aria-label="Удалить"><Trash2 size={16} /></button></div>)}</div> : <EmptyState icon={<ListTodo size={20} />} title="Общих дел пока нет" text="Добавьте первое дело, которое важно вам обоим." />}
      </section>
    </div>
  );
}

function SharedShopping() {
  const { shoppingItems, addShoppingItem, toggleShoppingItem, deleteShoppingItem } = useShared();
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const sorted = useMemo(() => [...shoppingItems].sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt.localeCompare(a.createdAt)), [shoppingItems]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await addShoppingItem({ title, quantity });
    setTitle("");
    setQuantity("");
  };

  return (
    <div className="shared-section-grid">
      <form className="panel shared-create-card" onSubmit={submit}>
        <span className="eyebrow">В магазин</span><h2>Добавить покупку</h2>
        <label className="field"><span>Что купить?</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, молоко" maxLength={120} /></label>
        <label className="field"><span>Количество / комментарий</span><input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="2 шт. / 1 кг / без сахара" maxLength={60} /></label>
        <Button type="submit" disabled={!title.trim()}><Plus size={17} /> В список</Button>
      </form>

      <section className="panel shared-list-card">
        <div className="panel-heading"><div><span className="eyebrow">Общий список</span><h2>Покупки</h2></div><span className="shared-count">{shoppingItems.filter((item) => !item.completed).length} осталось</span></div>
        {sorted.length ? <div className="shared-item-list">{sorted.map((item) => <div className={`shared-item ${item.completed ? "completed" : ""}`} key={item.id}><button className={`task-check ${item.completed ? "checked" : ""}`} onClick={() => toggleShoppingItem(item.id)} aria-label="Куплено">{item.completed && <Check size={14} />}</button><div className="shared-item-main"><strong>{item.title}</strong><span>{item.quantity || "без количества"} · добавил(а) {item.createdByName}</span></div><button className="row-action danger-hover" onClick={() => deleteShoppingItem(item.id)} aria-label="Удалить"><Trash2 size={16} /></button></div>)}</div> : <EmptyState icon={<ShoppingCart size={20} />} title="Список пуст" text="Добавляйте покупки с любого устройства и отмечайте прямо в магазине." />}
      </section>
    </div>
  );
}

function SharedExpenses() {
  const { categories, expenses, addExpense, deleteExpense, addCategory } = useShared();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayKey());
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const selectedCategory = categoryId || categories[0]?.id || "";
  const monthPrefix = todayKey().slice(0, 7);
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthPrefix));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const numeric = Number(amount.replace(",", "."));
    if (!title.trim() || !numeric || numeric <= 0) return;
    await addExpense({ title, amount: numeric, categoryId: selectedCategory || null, date });
    setTitle("");
    setAmount("");
    setDate(todayKey());
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    const id = await addCategory(newCategory.trim());
    if (id) setCategoryId(id);
    setNewCategory("");
  };

  return (
    <div className="shared-section-grid">
      <form className="panel shared-create-card" onSubmit={submit}>
        <span className="eyebrow">Общие финансы</span><h2>Записать расход</h2>
        <div className="two-fields"><label className="field"><span>Сумма</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0 ₽" /></label><label className="field"><span>Дата</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div>
        <label className="field"><span>На что?</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, продукты" maxLength={120} /></label>
        <label className="field"><span>Категория</span><select value={selectedCategory} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label>
        <div className="inline-category-form"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Своя категория" /><Button type="button" variant="secondary" onClick={createCategory}><Plus size={16} />Добавить</Button></div>
        <Button type="submit" disabled={!title.trim() || !amount}><Plus size={17} /> Записать расход</Button>
      </form>

      <section className="panel shared-list-card">
        <div className="panel-heading"><div><span className="eyebrow">Этот месяц</span><h2>{formatMoney(monthTotal)}</h2></div><span className="shared-count">{monthExpenses.length} операций</span></div>
        {expenses.length ? <div className="shared-expense-list">{expenses.map((expense) => { const category = categories.find((item) => item.id === expense.categoryId); return <div className="shared-expense-row" key={expense.id}><div className="expense-icon">{category?.icon ?? "✨"}</div><div className="shared-item-main"><strong>{expense.title}</strong><span>{expense.paidByName} · {category?.name ?? "Без категории"} · {formatShortDate(expense.date)}</span></div><b>{formatMoney(expense.amount)}</b><button className="row-action danger-hover" onClick={() => deleteExpense(expense.id)} aria-label="Удалить"><Trash2 size={16} /></button></div>; })}</div> : <EmptyState icon={<WalletCards size={20} />} title="Общих расходов пока нет" text="Сюда удобно записывать продукты, дом, совместные поездки и развлечения." />}
      </section>
    </div>
  );
}
