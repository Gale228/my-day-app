"use client";

import { LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="logout-button"
      onClick={logout}
      disabled={loading}
    >
      <LogOut size={17} />
      <span>{loading ? "Выходим..." : "Выйти"}</span>
    </button>
  );
}
