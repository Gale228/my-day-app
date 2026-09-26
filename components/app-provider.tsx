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
import { createClient } from "@/lib/supabase/client";

type NewTask = Pick<Task, "title" | "important" | "dueDate">;
type NewExpense = Pick<Expense, "title" | "amount" | "categoryId" | "date">;

type AppContextValue = {
  hydrated: boolean;
  userName: string;
  userEmail: string;
  tasks: Task[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  addTask: (task: NewTask) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addExpense: (expense: NewExpense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (name: string, icon?: string) => Promise<string | null>;
  deleteCategory: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        if (!cancelled) setHydrated(true);
        return;
      }

      const [tasksResult, expensesResult, categoriesResult] = await Promise.all([
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;

      setUserId(user.id);
      setUserEmail(user.email ?? "");
      setUserName(
        String(user.user_metadata?.display_name ?? "").trim() ||
          user.email?.split("@")[0] ||
          "Пользователь",
      );

      setTasks(
        (tasksResult.data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          important: row.important,
          completed: row.completed,
          dueDate: row.due_date,
          createdAt: row.created_at,
        })),
      );

      setExpenses(
        (expensesResult.data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          amount: Number(row.amount),
          categoryId: row.category_id,
          date: row.expense_date,
          createdAt: row.created_at,
        })),
      );

      setCategories(
        (categoriesResult.data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          icon: row.icon,
        })),
      );

      setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const addTask = useCallback(
    async (task: NewTask) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: task.title,
          important: task.important,
          due_date: task.dueDate,
        })
        .select()
        .single();

      if (error || !data) return;

      setTasks((current) => [
        {
          id: data.id,
          title: data.title,
          important: data.important,
          completed: data.completed,
          dueDate: data.due_date,
          createdAt: data.created_at,
        },
        ...current,
      ]);
    },
    [supabase, userId],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      const nextCompleted = !task.completed;

      setTasks((current) =>
        current.map((item) =>
          item.id === id ? { ...item, completed: nextCompleted } : item,
        ),
      );

      const { error } = await supabase
        .from("tasks")
        .update({ completed: nextCompleted })
        .eq("id", id);

      if (error) {
        setTasks((current) =>
          current.map((item) =>
            item.id === id ? { ...item, completed: task.completed } : item,
          ),
        );
      }
    },
    [supabase, tasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const previous = tasks;
      setTasks((current) => current.filter((task) => task.id !== id));
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) setTasks(previous);
    },
    [supabase, tasks],
  );

  const addExpense = useCallback(
    async (expense: NewExpense) => {
      if (!userId || !expense.categoryId) return;
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: userId,
          title: expense.title,
          amount: expense.amount,
          category_id: expense.categoryId,
          expense_date: expense.date,
        })
        .select()
        .single();

      if (error || !data) return;

      setExpenses((current) => [
        {
          id: data.id,
          title: data.title,
          amount: Number(data.amount),
          categoryId: data.category_id,
          date: data.expense_date,
          createdAt: data.created_at,
        },
        ...current,
      ]);
    },
    [supabase, userId],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const previous = expenses;
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) setExpenses(previous);
    },
    [expenses, supabase],
  );

  const addCategory = useCallback(
    async (name: string, icon = "✨") => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("categories")
        .insert({ user_id: userId, name: name.trim(), icon })
        .select()
        .single();

      if (error || !data) return null;
      setCategories((current) => [
        ...current,
        { id: data.id, name: data.name, icon: data.icon },
      ]);
      return data.id as string;
    },
    [supabase, userId],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const previousCategories = categories;
      const previousExpenses = expenses;
      setCategories((current) => current.filter((category) => category.id !== id));
      setExpenses((current) =>
        current.map((expense) =>
          expense.categoryId === id ? { ...expense, categoryId: null } : expense,
        ),
      );

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        setCategories(previousCategories);
        setExpenses(previousExpenses);
      }
    },
    [categories, expenses, supabase],
  );

  const value = useMemo(
    () => ({
      hydrated,
      userName,
      userEmail,
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
      userName,
      userEmail,
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
