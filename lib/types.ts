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
