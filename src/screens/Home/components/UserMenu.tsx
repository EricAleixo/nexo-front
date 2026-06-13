"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { User } from "@/src/lib/mock";
import { LogoutButton } from "@/src/components/LogoutButton";

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          Entrar
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
        <div className="size-9 overflow-hidden rounded-full bg-blue-100">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-bold text-blue-600">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-slate-800">
            Olá, {user.username}!
          </p>
          <p className="text-xs text-slate-500">1.250 pontos</p>
        </div>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
      </div>
      <LogoutButton />
    </div>
  );
}
