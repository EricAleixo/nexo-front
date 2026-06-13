"use client";

import { useState, useRef, useEffect } from "react";
import { Room, Subject, STATUS_CONFIG } from "@/src/types/types";
import Link from "next/link";
import {
  type LucideIcon,
  Info,
  MoreVertical,
  HelpCircle,
  Clock,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { ICON_OPTIONS } from "@/src/components/modals/AddSubjectModal";
import { EditRoomModal, EditRoomPayload } from "@/src/components/modals/EditRoomModal";

// ─── Fallback subject quando room.subject === null ────────────────────────────

const FALLBACK_SUBJECT = {
  name: "Geral",
  color: "#5F6368",
  icon: null as string | null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "agora mesmo";
  if (diff === 1) return "~1 min";
  if (diff < 60) return `~${diff} min`;
  const h = Math.floor(diff / 60);
  return `há ${h}h`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RoomCardProps {
  room: Room;
  subjects: Subject[];
  totalQuestions?: number;
  durationMin?: number;
  onEdit?: (payload: EditRoomPayload) => void | Promise<void>;
  onDelete?: (room: Room) => void | Promise<void>;
}

export function RoomCard({ room, subjects, totalQuestions = 0, durationMin, onEdit, onDelete }: RoomCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[room.status];

  const subjectName = room.subject?.name ?? FALLBACK_SUBJECT.name;
  const accentColor = room.subject?.color ?? FALLBACK_SUBJECT.color;
  const subjectIcon = room.subject?.icon ?? null;

  const SubjectIcon: LucideIcon = (subjectIcon ? ICON_OPTIONS[subjectIcon] : null) ?? Info;

  const progress =
    totalQuestions > 0
      ? Math.round((room.currentQuestion / totalQuestions) * 100)
      : 0;

  // Fecha o menu ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-zinc-300">

        {/* Header: ícone + matéria + kebab */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
              aria-hidden="true"
            >
              <SubjectIcon size={20} />
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
              {subjectName}
            </span>
          </div>

          {/* Kebab + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Mais opções"
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 min-w-35 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                <button
                  onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Pencil size={14} className="text-zinc-400" />
                  Editar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete?.(room); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nome da sala + host */}
        <div>
          <h3 className="text-sm font-bold leading-snug text-zinc-800">{room.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{room.host.name}</p>
        </div>

        {/* Metadados */}
        <div className="flex flex-col gap-1.5 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <HelpCircle size={13} aria-hidden="true" />
            {totalQuestions > 0
              ? `${room.currentQuestion} / ${totalQuestions} perguntas`
              : "Perguntas não informadas"}
          </span>

          {durationMin != null && (
            <span className="flex items-center gap-1">
              <Clock size={13} aria-hidden="true" />
              ~{durationMin} min
            </span>
          )}
        </div>

        {/* Status + tempo */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}
          >
            <span
              className={`size-1.5 rounded-full ${cfg.dotColor} ${room.status === "started" ? "animate-pulse" : ""
                }`}
            />
            {cfg.label}
          </span>
          <span className="text-[11px] text-zinc-400">{formatTimeAgo(room.createdAt)}</span>
        </div>

        {/* Barra de progresso */}
        {room.status === "started" && totalQuestions > 0 && (
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-zinc-400">
              <span>Questão {room.currentQuestion} de {totalQuestions}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}

        {/* Botão entrar */}
        <Link
          href={`/room/${room.code}`}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:border-zinc-300"
        >
          Entrar na Sala
          <ArrowRight size={14} aria-hidden="true" />
        </Link>

      </article>

      <EditRoomModal
        open={editOpen}
        room={room}
        subjects={subjects}
        onClose={() => setEditOpen(false)}
        onSave={async (payload) => {
          await onEdit?.(payload);
          setEditOpen(false);
        }}
      />
    </>
  );
}