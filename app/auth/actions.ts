"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function authError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) authError("/login", "Заполни email и пароль.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) authError("/login", "Не удалось войти. Проверь email и пароль.");

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (name.length < 2) authError("/register", "Укажи имя.");
  if (!email) authError("/register", "Укажи email.");
  if (password.length < 8) authError("/register", "Пароль должен быть не короче 8 символов.");
  if (password !== passwordConfirm) authError("/register", "Пароли не совпадают.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (error) authError("/register", "Не удалось создать аккаунт. Проверь введённые данные.");

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/login?message=Проверь почту и подтверди регистрацию, затем войди.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
