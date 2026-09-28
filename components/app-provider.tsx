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
import type {
  Expense,
  ExpenseCategory,
  Goal,
  Habit,
  HabitCompletion,
  Note,
  Task,
} from "@/lib/types";
import { todayKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";

type NewTask = Pick<Task, "title" | "important" | "dueDate">;
type NewExpense = Pick<Expense, "title" | "amount" | "categoryId" | "date">;
type NewGoal = Pick<Goal, "title" | "description" | "targetValue" | "unit" | "targetDate">;
type NewHabit = Pick<Habit, "title" | "icon" | "targetPerWeek">;
type NewNote = Pick<Note, "title" | "content" | "pinned">;

type AppContextValue = {
  hydrated: boolean;
  userName: string;
  userEmail: string;
  tasks: Task[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  notes: Note[];
  addTask: (task: NewTask) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addExpense: (expense: NewExpense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (name: string, icon?: string) => Promise<string | null>;
  deleteCategory: (id: string) => Promise<void>;
  addGoal: (goal: NewGoal) => Promise<string | null>;
  setGoalProgress: (id: string, value: number) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addHabit: (habit: NewHabit) => Promise<string | null>;
  toggleHabitForDate: (habitId: string, date?: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addNote: (note: NewNote) => Promise<string | null>;
  updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content" | "pinned">>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        if (!cancelled) setHydrated(true);
        return;
      }

      const [tasksResult, expensesResult, categoriesResult, goalsResult, habitsResult, completionsResult, notesResult] = await Promise.all([
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("created_at", { ascending: true }),
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
        supabase.from("habits").select("*").order("created_at", { ascending: true }),
        supabase.from("habit_completions").select("*").order("completed_on", { ascending: false }),
        supabase.from("notes").select("*").order("updated_at", { ascending: false }),
      ]);

      if (cancelled) return;

      setUserId(user.id);
      setUserEmail(user.email ?? "");
      setUserName(String(user.user_metadata?.display_name ?? "").trim() || user.email?.split("@")[0] || "Пользователь");

      setTasks((tasksResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        important: row.important,
        completed: row.completed,
        dueDate: row.due_date,
        createdAt: row.created_at,
      })));

      setExpenses((expensesResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        categoryId: row.category_id,
        date: row.expense_date,
        createdAt: row.created_at,
      })));

      setCategories((categoriesResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
      })));

      setGoals((goalsResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        targetValue: row.target_value == null ? null : Number(row.target_value),
        currentValue: Number(row.current_value ?? 0),
        unit: row.unit ?? "",
        targetDate: row.target_date,
        completed: row.completed,
        createdAt: row.created_at,
      })));

      setHabits((habitsResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        icon: row.icon,
        targetPerWeek: row.target_per_week,
        createdAt: row.created_at,
      })));

      setHabitCompletions((completionsResult.data ?? []).map((row) => ({
        id: row.id,
        habitId: row.habit_id,
        date: row.completed_on,
      })));

      setNotes((notesResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content ?? "",
        pinned: row.pinned,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));

      setHydrated(true);
    }

    load();
    return () => { cancelled = true; };
  }, [supabase]);

  const addTask = useCallback(async (task: NewTask) => {
    if (!userId) return;
    const { data, error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: task.title,
      important: task.important,
      due_date: task.dueDate,
    }).select().single();
    if (error || !data) return;
    setTasks((current) => [{ id: data.id, title: data.title, important: data.important, completed: data.completed, dueDate: data.due_date, createdAt: data.created_at }, ...current]);
  }, [supabase, userId]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: nextCompleted } : item));
    const { error } = await supabase.from("tasks").update({ completed: nextCompleted }).eq("id", id);
    if (error) setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: task.completed } : item));
  }, [supabase, tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const previous = tasks;
    setTasks((current) => current.filter((task) => task.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) setTasks(previous);
  }, [supabase, tasks]);

  const addExpense = useCallback(async (expense: NewExpense) => {
    if (!userId || !expense.categoryId) return;
    const { data, error } = await supabase.from("expenses").insert({
      user_id: userId,
      title: expense.title,
      amount: expense.amount,
      category_id: expense.categoryId,
      expense_date: expense.date,
    }).select().single();
    if (error || !data) return;
    setExpenses((current) => [{ id: data.id, title: data.title, amount: Number(data.amount), categoryId: data.category_id, date: data.expense_date, createdAt: data.created_at }, ...current]);
  }, [supabase, userId]);

  const deleteExpense = useCallback(async (id: string) => {
    const previous = expenses;
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) setExpenses(previous);
  }, [expenses, supabase]);

  const addCategory = useCallback(async (name: string, icon = "✨") => {
    if (!userId) return null;
    const { data, error } = await supabase.from("categories").insert({ user_id: userId, name: name.trim(), icon }).select().single();
    if (error || !data) return null;
    setCategories((current) => [...current, { id: data.id, name: data.name, icon: data.icon }]);
    return data.id as string;
  }, [supabase, userId]);

  const deleteCategory = useCallback(async (id: string) => {
    const previousCategories = categories;
    const previousExpenses = expenses;
    setCategories((current) => current.filter((category) => category.id !== id));
    setExpenses((current) => current.map((expense) => expense.categoryId === id ? { ...expense, categoryId: null } : expense));
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { setCategories(previousCategories); setExpenses(previousExpenses); }
  }, [categories, expenses, supabase]);

  const addGoal = useCallback(async (goal: NewGoal) => {
    if (!userId) return null;
    const { data, error } = await supabase.from("goals").insert({
      user_id: userId,
      title: goal.title.trim(),
      description: goal.description.trim(),
      target_value: goal.targetValue,
      current_value: 0,
      unit: goal.unit.trim(),
      target_date: goal.targetDate || null,
    }).select().single();
    if (error || !data) return null;
    setGoals((current) => [{
      id: data.id, title: data.title, description: data.description ?? "",
      targetValue: data.target_value == null ? null : Number(data.target_value),
      currentValue: Number(data.current_value ?? 0), unit: data.unit ?? "", targetDate: data.target_date,
      completed: data.completed, createdAt: data.created_at,
    }, ...current]);
    return data.id as string;
  }, [supabase, userId]);

  const setGoalProgress = useCallback(async (id: string, value: number) => {
    const goal = goals.find((item) => item.id === id);
    if (!goal) return;
    const next = Math.max(0, goal.targetValue == null ? value : Math.min(value, goal.targetValue));
    const autoCompleted = goal.targetValue != null ? next >= goal.targetValue : goal.completed;
    const previous = goals;
    setGoals((current) => current.map((item) => item.id === id ? { ...item, currentValue: next, completed: autoCompleted } : item));
    const { error } = await supabase.from("goals").update({ current_value: next, completed: autoCompleted }).eq("id", id);
    if (error) setGoals(previous);
  }, [goals, supabase]);

  const toggleGoal = useCallback(async (id: string) => {
    const goal = goals.find((item) => item.id === id);
    if (!goal) return;
    const previous = goals;
    const completed = !goal.completed;
    setGoals((current) => current.map((item) => item.id === id ? { ...item, completed } : item));
    const { error } = await supabase.from("goals").update({ completed }).eq("id", id);
    if (error) setGoals(previous);
  }, [goals, supabase]);

  const deleteGoal = useCallback(async (id: string) => {
    const previous = goals;
    setGoals((current) => current.filter((goal) => goal.id !== id));
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) setGoals(previous);
  }, [goals, supabase]);

  const addHabit = useCallback(async (habit: NewHabit) => {
    if (!userId) return null;
    const { data, error } = await supabase.from("habits").insert({
      user_id: userId,
      title: habit.title.trim(),
      icon: habit.icon,
      target_per_week: habit.targetPerWeek,
    }).select().single();
    if (error || !data) return null;
    setHabits((current) => [...current, { id: data.id, title: data.title, icon: data.icon, targetPerWeek: data.target_per_week, createdAt: data.created_at }]);
    return data.id as string;
  }, [supabase, userId]);

  const toggleHabitForDate = useCallback(async (habitId: string, date = todayKey()) => {
    if (!userId) return;
    const existing = habitCompletions.find((item) => item.habitId === habitId && item.date === date);
    if (existing) {
      setHabitCompletions((current) => current.filter((item) => item.id !== existing.id));
      const { error } = await supabase.from("habit_completions").delete().eq("id", existing.id);
      if (error) setHabitCompletions((current) => [existing, ...current]);
      return;
    }
    const tempId = `temp-${habitId}-${date}`;
    const optimistic = { id: tempId, habitId, date };
    setHabitCompletions((current) => [optimistic, ...current]);
    const { data, error } = await supabase.from("habit_completions").insert({ user_id: userId, habit_id: habitId, completed_on: date }).select().single();
    if (error || !data) {
      setHabitCompletions((current) => current.filter((item) => item.id !== tempId));
      return;
    }
    setHabitCompletions((current) => current.map((item) => item.id === tempId ? { id: data.id, habitId: data.habit_id, date: data.completed_on } : item));
  }, [habitCompletions, supabase, userId]);

  const deleteHabit = useCallback(async (id: string) => {
    const prevHabits = habits;
    const prevCompletions = habitCompletions;
    setHabits((current) => current.filter((habit) => habit.id !== id));
    setHabitCompletions((current) => current.filter((item) => item.habitId !== id));
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) { setHabits(prevHabits); setHabitCompletions(prevCompletions); }
  }, [habitCompletions, habits, supabase]);

  const addNote = useCallback(async (note: NewNote) => {
    if (!userId) return null;
    const { data, error } = await supabase.from("notes").insert({ user_id: userId, title: note.title.trim() || "Без названия", content: note.content, pinned: note.pinned }).select().single();
    if (error || !data) return null;
    setNotes((current) => [{ id: data.id, title: data.title, content: data.content ?? "", pinned: data.pinned, createdAt: data.created_at, updatedAt: data.updated_at }, ...current]);
    return data.id as string;
  }, [supabase, userId]);

  const updateNote = useCallback(async (id: string, patch: Partial<Pick<Note, "title" | "content" | "pinned">>) => {
    const previous = notes;
    const updatedAt = new Date().toISOString();
    setNotes((current) => current.map((note) => note.id === id ? { ...note, ...patch, updatedAt } : note));
    const dbPatch: Record<string, unknown> = { updated_at: updatedAt };
    if (patch.title !== undefined) dbPatch.title = patch.title.trim() || "Без названия";
    if (patch.content !== undefined) dbPatch.content = patch.content;
    if (patch.pinned !== undefined) dbPatch.pinned = patch.pinned;
    const { error } = await supabase.from("notes").update(dbPatch).eq("id", id);
    if (error) setNotes(previous);
  }, [notes, supabase]);

  const deleteNote = useCallback(async (id: string) => {
    const previous = notes;
    setNotes((current) => current.filter((note) => note.id !== id));
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) setNotes(previous);
  }, [notes, supabase]);

  const value = useMemo(() => ({
    hydrated, userName, userEmail,
    tasks, expenses, categories, goals, habits, habitCompletions, notes,
    addTask, toggleTask, deleteTask, addExpense, deleteExpense, addCategory, deleteCategory,
    addGoal, setGoalProgress, toggleGoal, deleteGoal,
    addHabit, toggleHabitForDate, deleteHabit,
    addNote, updateNote, deleteNote,
  }), [
    hydrated, userName, userEmail, tasks, expenses, categories, goals, habits, habitCompletions, notes,
    addTask, toggleTask, deleteTask, addExpense, deleteExpense, addCategory, deleteCategory,
    addGoal, setGoalProgress, toggleGoal, deleteGoal, addHabit, toggleHabitForDate, deleteHabit,
    addNote, updateNote, deleteNote,
  ]);

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
