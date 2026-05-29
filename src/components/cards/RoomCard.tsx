"use client";

import { Room, User, formatTimeAgo } from "@/src/lib/mock";
import Link from "next/link";

const STATUS_CONFIG = {
  waiting: {
    label: "Aguardando",
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  },
  started: {
    label: "Ao vivo",
    dot: "bg-emerald-400 animate-pulse",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  },
  finished: {
    label: "Encerrada",
    dot: "bg-zinc-600",
    badge: "bg-zinc-800 text-zinc-500 border-zinc-700",
  },
} satisfies Record<Room["status"], { label: string; dot: string; badge: string }>;

interface RoomCardProps {
  room: Room;
  user?: User | null;
}

export function RoomCard({ room, user }: RoomCardProps) {
  const isOwner = user?.id === room.userId;
  const cfg = STATUS_CONFIG[room.status];
  const progress = Math.round((room.currentQuestion / room.totalQuestions) * 100);

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-indigo-500/10 bg-white/3 p-5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/5 hover:shadow-lg hover:shadow-indigo-500/5">

      {/* Header — três colunas: código | título+usuário | badge */}
      <div className="flex items-start gap-3">

        {/* Code pill */}
        <div className="flex flex-col items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 min-w-14.5 shrink-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            Código
          </span>
          <span className="font-mono text-base font-black text-indigo-200">
            {room.code}
          </span>
        </div>

        {/* Título + usuário — flex-1 com min-w-0 para truncar corretamente */}
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-bold leading-snug text-zinc-100 group-hover:text-white transition-colors">
            {room.topic}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            por{" "}
            <span className="font-medium text-zinc-400">@{user?.username}</span>
          </p>
        </div>

        {/* Badge "Sua sala" — flex-shrink-0 para não colapsar, sem position absolute */}
        {isOwner && (
          <span className="shrink-0 self-start rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
            Sua sala
          </span>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badge}`}
        >
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        <span className="text-[11px] text-zinc-600">
          {formatTimeAgo(room.createdAt)}
        </span>
      </div>

      {/* Progress bar (only if active) */}
      {room.status === "started" && (
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-zinc-600">
            <span>Questão {room.currentQuestion} de {room.totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <span className="flex items-center gap-1 text-[11px] text-zinc-600">
          <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {room.participantCount} participante{room.participantCount !== 1 ? "s" : ""}
        </span>

        <Link href={`room/${room.code}`} className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:text-indigo-200">
          Entrar
        </Link>
      </div>
    </article>
  );
}