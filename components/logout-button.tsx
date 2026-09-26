import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="logout-button">
        <LogOut size={17} />
        <span>Выйти</span>
      </button>
    </form>
  );
}
