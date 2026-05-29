"use client";
import { useAuth } from "./AuthContext";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
    >
      Sair
    </button>
  );
}