"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { User } from "@/src/lib/mock";
import { HeaderActions } from "./HeaderActions";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const scrollToRooms = () => {
    document.getElementById("salas-publicas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex items-center gap-4 px-11 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            Q
          </div>
          <span className="text-lg font-bold text-slate-800">StudyHub</span>
        </Link>

        <HeaderActions onExplore={scrollToRooms} />

        <div className="relative mx-auto hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar salas ou temas"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-300 focus:bg-white"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notificações"
            className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="size-5" />
          </button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
