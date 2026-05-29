"use client";

import { useState } from "react";
import { CreateRoomModal } from "./modals/CreateRoomModal";
import { JoinRoomModal } from "./modals/JoinRoomModal";

export function HomeActions() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs sm:max-w-none sm:justify-center">
        {/* Create Room */}
        <button
          onClick={() => setShowCreate(true)}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-indigo-500 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,.5)] active:scale-95"
        >
          <svg
            className="size-5 transition-transform duration-300 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Criar Sala
          {/* Shine effect */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>

        {/* Divider */}
        <span className="text-zinc-600 text-xs font-medium hidden sm:block">ou</span>
        <span className="text-zinc-600 text-xs font-medium sm:hidden">— ou —</span>

        {/* Join Room */}
        <button
          onClick={() => setShowJoin(true)}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-8 py-4 text-sm font-semibold text-zinc-300 backdrop-blur transition-all duration-300 hover:border-indigo-500/60 hover:text-white hover:scale-105 hover:bg-zinc-800 active:scale-95"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Entrar com Código
        </button>
      </div>

      {/* Modals */}
      <CreateRoomModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinRoomModal open={showJoin} onClose={() => setShowJoin(false)} />
    </>
  );
}