"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Expense, ExpenseCategory, Task } from "@/lib/types";
import { todayKey } from "@/lib/date";

const TASKS_KEY = "my-day.tasks.v1";
const EXPENSES_KEY = "my-day.expenses.v1";
const CATEGORIES_KEY = "my-day.categories.v1";

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: "food", name: "Еда", icon: "🍜" },
  { id: "transport", name: "Транспорт", icon: "🚕" },
  { id: "shopping", name: "Покупки", icon: "🛍️" },
  { id: "home", name: "Дом", icon: "🏠" },
  { id: "entertainment", name: "Развлечения", icon: "🎮" },
];

type NewTask = Pick<Task, "title" | "important" | "dueDate">;
type NewExpense = Pick<Expense, "title" | "amount" | "categoryId" | "date">;

type AppContextValue = {
  hydrated: boolean;
  tasks: Task[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  addTask: (task: NewTask) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addExpense: (expense: NewExpense) => void;
  deleteExpense: (id: string) => void;
  addCategory: (name: string, icon?: string) => string;
  deleteCategory: (id: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    setTasks(readStorage<Task[]>(TASKS_KEY, []));
    setExpenses(readStorage<Expense[]>(EXPENSES_KEY, []));
    setCategories(readStorage<ExpenseCategory[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, hydrated]);

  const addTask = useCallback((task: NewTask) => {
    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...task,
      },
      ...current,
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const addExpense = useCallback((expense: NewExpense) => {
    setExpenses((current) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...expense,
      },
      ...current,
    ]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }, []);

  const addCategory = useCallback((name: string, icon = "✨") => {
    const id = crypto.randomUUID();
    setCategories((current) => [...current, { id, name: name.trim(), icon }]);
    return id;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((current) => current.filter((category) => category.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      tasks,
      expenses,
      categories,
      addTask,
      toggleTask,
      deleteTask,
      addExpense,
      deleteExpense,
      addCategory,
      deleteCategory,
    }),
    [
      hydrated,
      tasks,
      expenses,
      categories,
      addTask,
      toggleTask,
      deleteTask,
      addExpense,
      deleteExpense,
      addCategory,
      deleteCategory,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export function useTodayKey() {
  const [value, setValue] = useState(todayKey());

  useEffect(() => {
    const timer = window.setInterval(() => setValue(todayKey()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return value;
}
