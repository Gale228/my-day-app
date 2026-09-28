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
import { createClient } from "@/lib/supabase/client";
import type {
  Household,
  SharedCategory,
  SharedExpense,
  SharedTask,
  ShoppingItem,
} from "@/lib/types";

type NewSharedTask = {
  title: string;
  important: boolean;
  dueDate: string;
};

type NewShoppingItem = {
  title: string;
  quantity: string;
};

type NewSharedExpense = {
  title: string;
  amount: number;
  categoryId: string | null;
  date: string;
};

type SharedContextValue = {
  hydrated: boolean;
  error: string;
  household: Household | null;
  memberCount: number;
  categories: SharedCategory[];
  tasks: SharedTask[];
  shoppingItems: ShoppingItem[];
  expenses: SharedExpense[];
  createHousehold: (name: string) => Promise<boolean>;
  joinHousehold: (code: string) => Promise<boolean>;
  updateBudget: (value: number) => Promise<void>;
  addCategory: (name: string, icon?: string) => Promise<string | null>;
  addTask: (task: NewSharedTask) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addShoppingItem: (item: NewShoppingItem) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  addExpense: (expense: NewSharedExpense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};

const SharedContext = createContext<SharedContextValue | null>(null);

export function SharedProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("Пользователь");
  const [household, setHousehold] = useState<Household | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [categories, setCategories] = useState<SharedCategory[]>([]);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);

  const refreshSharedData = useCallback(async (householdId: string) => {
    const [
      householdResult,
      membersResult,
      categoriesResult,
      tasksResult,
      shoppingResult,
      expensesResult,
    ] = await Promise.all([
      supabase.from("households").select("*").eq("id", householdId).single(),
      supabase.from("household_members").select("user_id", { count: "exact", head: true }).eq("household_id", householdId),
      supabase.from("shared_categories").select("*").eq("household_id", householdId).order("created_at", { ascending: true }),
      supabase.from("shared_tasks").select("*").eq("household_id", householdId).order("created_at", { ascending: false }),
      supabase.from("shopping_items").select("*").eq("household_id", householdId).order("created_at", { ascending: false }),
      supabase.from("shared_expenses").select("*").eq("household_id", householdId).order("created_at", { ascending: false }),
    ]);

    if (householdResult.error || !householdResult.data) {
      setError("Не удалось загрузить общее пространство.");
      return;
    }

    const row = householdResult.data;
    setHousehold({
      id: row.id,
      name: row.name,
      inviteCode: row.invite_code,
      createdBy: row.created_by,
      monthlyBudget: Number(row.monthly_budget ?? 0),
      createdAt: row.created_at,
    });
    setMemberCount(membersResult.count ?? 0);
    setCategories((categoriesResult.data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
    })));
    setTasks((tasksResult.data ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      important: task.important,
      completed: task.completed,
      dueDate: task.due_date,
      createdByName: task.created_by_name,
      createdAt: task.created_at,
    })));
    setShoppingItems((shoppingResult.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity ?? "",
      completed: item.completed,
      createdByName: item.created_by_name,
      createdAt: item.created_at,
    })));
    setExpenses((expensesResult.data ?? []).map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      categoryId: expense.category_id,
      date: expense.expense_date,
      paidByName: expense.paid_by_name,
      createdAt: expense.created_at,
    })));
    setError("");
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        if (!cancelled) setHydrated(true);
        return;
      }

      if (cancelled) return;
      setUserId(user.id);
      setUserName(String(user.user_metadata?.display_name ?? "").trim() || user.email?.split("@")[0] || "Пользователь");

      const { data: membership, error: membershipError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (membershipError) {
        setError("Не удалось проверить общее пространство. Убедись, что SQL v1.6 выполнен в Supabase.");
        setHydrated(true);
        return;
      }

      if (membership?.household_id) {
        await refreshSharedData(membership.household_id);
      }
      if (!cancelled) setHydrated(true);
    }

    load();
    return () => { cancelled = true; };
  }, [refreshSharedData, supabase]);

  const createHousehold = useCallback(async (name: string) => {
    if (!userId || !name.trim()) return false;
    setError("");
    const { data, error: createError } = await supabase
      .from("households")
      .insert({ name: name.trim(), created_by: userId })
      .select("id")
      .single();

    if (createError || !data) {
      setError(createError?.message || "Не удалось создать общее пространство.");
      return false;
    }
    await refreshSharedData(data.id);
    return true;
  }, [refreshSharedData, supabase, userId]);

  const joinHousehold = useCallback(async (code: string) => {
    if (!code.trim()) return false;
    setError("");
    const { data, error: joinError } = await supabase.rpc("join_household_by_code", {
      invite_code_input: code.trim(),
    });
    if (joinError || !data) {
      setError(joinError?.message.includes("already belongs")
        ? "Этот аккаунт уже состоит в общем пространстве."
        : "Код приглашения не найден или уже недоступен.");
      return false;
    }
    await refreshSharedData(String(data));
    return true;
  }, [refreshSharedData, supabase]);

  const updateBudget = useCallback(async (value: number) => {
    if (!household) return;
    const nextValue = Math.max(0, value || 0);
    const previous = household.monthlyBudget;
    setHousehold({ ...household, monthlyBudget: nextValue });
    const { error: updateError } = await supabase.from("households").update({ monthly_budget: nextValue }).eq("id", household.id);
    if (updateError) setHousehold({ ...household, monthlyBudget: previous });
  }, [household, supabase]);

  const addCategory = useCallback(async (name: string, icon = "✨") => {
    if (!household || !name.trim()) return null;
    const { data, error: createError } = await supabase.from("shared_categories").insert({
      household_id: household.id,
      name: name.trim(),
      icon,
    }).select().single();
    if (createError || !data) return null;
    setCategories((current) => [...current, { id: data.id, name: data.name, icon: data.icon }]);
    return data.id as string;
  }, [household, supabase]);

  const addTask = useCallback(async (task: NewSharedTask) => {
    if (!household || !userId || !task.title.trim()) return;
    const { data, error: createError } = await supabase.from("shared_tasks").insert({
      household_id: household.id,
      created_by: userId,
      created_by_name: userName,
      title: task.title.trim(),
      important: task.important,
      due_date: task.dueDate,
    }).select().single();
    if (createError || !data) return;
    setTasks((current) => [{
      id: data.id,
      title: data.title,
      important: data.important,
      completed: data.completed,
      dueDate: data.due_date,
      createdByName: data.created_by_name,
      createdAt: data.created_at,
    }, ...current]);
  }, [household, supabase, userId, userName]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: nextCompleted } : item));
    const { error: updateError } = await supabase.from("shared_tasks").update({ completed: nextCompleted }).eq("id", id);
    if (updateError) setTasks((current) => current.map((item) => item.id === id ? task : item));
  }, [supabase, tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const previous = tasks;
    setTasks((current) => current.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("shared_tasks").delete().eq("id", id);
    if (deleteError) setTasks(previous);
  }, [supabase, tasks]);

  const addShoppingItem = useCallback(async (item: NewShoppingItem) => {
    if (!household || !userId || !item.title.trim()) return;
    const { data, error: createError } = await supabase.from("shopping_items").insert({
      household_id: household.id,
      created_by: userId,
      created_by_name: userName,
      title: item.title.trim(),
      quantity: item.quantity.trim(),
    }).select().single();
    if (createError || !data) return;
    setShoppingItems((current) => [{
      id: data.id,
      title: data.title,
      quantity: data.quantity ?? "",
      completed: data.completed,
      createdByName: data.created_by_name,
      createdAt: data.created_at,
    }, ...current]);
  }, [household, supabase, userId, userName]);

  const toggleShoppingItem = useCallback(async (id: string) => {
    const item = shoppingItems.find((entry) => entry.id === id);
    if (!item) return;
    const nextCompleted = !item.completed;
    setShoppingItems((current) => current.map((entry) => entry.id === id ? { ...entry, completed: nextCompleted } : entry));
    const { error: updateError } = await supabase.from("shopping_items").update({ completed: nextCompleted }).eq("id", id);
    if (updateError) setShoppingItems((current) => current.map((entry) => entry.id === id ? item : entry));
  }, [shoppingItems, supabase]);

  const deleteShoppingItem = useCallback(async (id: string) => {
    const previous = shoppingItems;
    setShoppingItems((current) => current.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("shopping_items").delete().eq("id", id);
    if (deleteError) setShoppingItems(previous);
  }, [shoppingItems, supabase]);

  const addExpense = useCallback(async (expense: NewSharedExpense) => {
    if (!household || !userId || !expense.title.trim() || expense.amount <= 0) return;
    const { data, error: createError } = await supabase.from("shared_expenses").insert({
      household_id: household.id,
      created_by: userId,
      paid_by_name: userName,
      title: expense.title.trim(),
      amount: expense.amount,
      category_id: expense.categoryId,
      expense_date: expense.date,
    }).select().single();
    if (createError || !data) return;
    setExpenses((current) => [{
      id: data.id,
      title: data.title,
      amount: Number(data.amount),
      categoryId: data.category_id,
      date: data.expense_date,
      paidByName: data.paid_by_name,
      createdAt: data.created_at,
    }, ...current]);
  }, [household, supabase, userId, userName]);

  const deleteExpense = useCallback(async (id: string) => {
    const previous = expenses;
    setExpenses((current) => current.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("shared_expenses").delete().eq("id", id);
    if (deleteError) setExpenses(previous);
  }, [expenses, supabase]);

  const value = useMemo<SharedContextValue>(() => ({
    hydrated,
    error,
    household,
    memberCount,
    categories,
    tasks,
    shoppingItems,
    expenses,
    createHousehold,
    joinHousehold,
    updateBudget,
    addCategory,
    addTask,
    toggleTask,
    deleteTask,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    addExpense,
    deleteExpense,
  }), [
    hydrated, error, household, memberCount, categories, tasks, shoppingItems, expenses,
    createHousehold, joinHousehold, updateBudget, addCategory, addTask, toggleTask, deleteTask,
    addShoppingItem, toggleShoppingItem, deleteShoppingItem, addExpense, deleteExpense,
  ]);

  return <SharedContext.Provider value={value}>{children}</SharedContext.Provider>;
}

export function useShared() {
  const context = useContext(SharedContext);
  if (!context) throw new Error("useShared must be used inside SharedProvider");
  return context;
}
