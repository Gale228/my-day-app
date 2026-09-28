export type Task = {
  id: string;
  title: string;
  important: boolean;
  completed: boolean;
  dueDate: string;
  createdAt: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  categoryId: string | null;
  date: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  targetValue: number | null;
  currentValue: number;
  unit: string;
  targetDate: string | null;
  completed: boolean;
  createdAt: string;
};

export type Habit = {
  id: string;
  title: string;
  icon: string;
  targetPerWeek: number;
  createdAt: string;
};

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};
