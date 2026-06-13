"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "../ui/Modal";
import {
  modalCharCountClass,
  modalErrorClass,
  modalHintClass,
  modalInputClass,
  modalKbdClass,
  modalLabelClass,
  modalPrimaryButtonClass,
} from "../ui/modalStyles";
import { useAuth } from "../AuthContext";
import {
  AddSubjectModal,
  ICON_OPTIONS,
} from "./AddSubjectModal";
import { Subject } from "@/src/types/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateRoomResponse {
  room: { id: string; code: string };
  player: { name: string; isHost: boolean };
}

type Status = "idle" | "loading" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const MAX_NAME_LENGTH = 24;
const MAX_ROOM_NAME_LENGTH = 32;

// ─── Mock inicial de disciplinas ──────────────────────────────────────────────

// ─── SubjectDropdown ──────────────────────────────────────────────────────────

interface SubjectDropdownProps {
  subjects: Subject[];
  value: Subject | null;
  onChange: (s: Subject | null) => void;
  onAddNew: () => void;
  hasError: boolean;
}

function SubjectDropdown({
  subjects,
  value,
  onChange,
  onAddNew,
  hasError,
}: SubjectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const SelectedIcon = value ? ICON_OPTIONS[value.icon] : null;

  const triggerCls = [
    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
    hasError
      ? "border-red-300 bg-red-50 text-red-500"
      : open
        ? "border-indigo-400 bg-white text-zinc-800 ring-2 ring-indigo-500/20"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={triggerCls}
      >
        {/* Ícone da selecionada ou placeholder */}
        {SelectedIcon && value ? (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
            style={{ background: value.color + "22", color: value.color }}
          >
            <SelectedIcon size={13} strokeWidth={2} />
          </span>
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
            <ChevronDown size={13} />
          </span>
        )}

        <span className={["flex-1 text-left", !value ? "text-zinc-400" : "text-zinc-700"].join(" ")}>
          {value ? value.name : "Selecionar disciplina"}
        </span>

        {open ? (
          <ChevronUp size={14} className="shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-zinc-400" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60">
          <ul role="listbox" className="max-h-52 overflow-y-auto p-1">
            {subjects.map((s) => {
              const Icon = ICON_OPTIONS[s.icon];
              const isSelected = value?.id === s.id;
              return (
                <li key={s.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(isSelected ? null : s);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: s.color + "18", color: s.color }}
                    >
                      <Icon size={14} strokeWidth={2} />
                    </span>
                    <span className="flex-1 text-left">{s.name}</span>
                    {isSelected && (
                      <svg className="size-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Separador + botão adicionar */}
          <div className="border-t border-zinc-100 p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-zinc-400">
                <Plus size={13} strokeWidth={2.5} />
              </span>
              Adicionar disciplina
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CreateRoomModal ──────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  subjectsInitialData: Subject[]
}

export function CreateRoomModal({ open, onClose, subjectsInitialData }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const playerNameRef = useRef<HTMLInputElement>(null);

  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>(subjectsInitialData);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => playerNameRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
    setPlayerName("");
    setRoomName("");
    setSelectedSubject(null);
    setStatus("idle");
    setErrorMsg("");
  }, [open]);

  const isDisabled =
    status === "loading" ||
    playerName.trim().length === 0 ||
    roomName.trim().length === 0;

  async function handleCreate() {
    const name = playerName.trim();
    const room = roomName.trim();
    if (!name || !room || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: name,
          roomName: room,
          userId: user?.id,
          subjectId: selectedSubject?.id ?? null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string })?.message ?? `Erro ${res.status}`
        );
      }

      const data: CreateRoomResponse = await res.json();
      router.push(`/room/${data.room.code}/lobby`);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível criar a sala."
      );
    }
  }

  function handleSubjectCreated(subject: Subject) {
    setSubjects((prev) => [...prev, subject]);
    setSelectedSubject(subject);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Criar Sala"
        subtitle="Preencha os campos para começar."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">

            {/* Seu nome */}
            <div className="flex flex-col gap-2">
              <label htmlFor="player-name" className={modalLabelClass}>
                Seu nome
              </label>
              <div className="relative">
                <input
                  ref={playerNameRef}
                  id="player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value.slice(0, MAX_NAME_LENGTH));
                    if (status === "error") setStatus("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreate();
                  }}
                  placeholder="Ex: Eric"
                  maxLength={MAX_NAME_LENGTH}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={status === "error"}
                  className={[modalInputClass(status === "error"), "pr-14"].join(" ")}
                />
                <span
                  aria-hidden="true"
                  className={modalCharCountClass(playerName.length >= MAX_NAME_LENGTH)}
                >
                  {playerName.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Nome da sala */}
            <div className="flex flex-col gap-2">
              <label htmlFor="room-name" className={modalLabelClass}>
                Nome da sala
              </label>
              <div className="relative">
                <input
                  id="room-name"
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value.slice(0, MAX_ROOM_NAME_LENGTH));
                    if (status === "error") setStatus("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreate();
                  }}
                  placeholder="Ex: Quiz de Geografia"
                  maxLength={MAX_ROOM_NAME_LENGTH}
                  autoComplete="off"
                  spellCheck={false}
                  className={[modalInputClass(status === "error"), "pr-14"].join(" ")}
                />
                <span
                  aria-hidden="true"
                  className={modalCharCountClass(roomName.length >= MAX_ROOM_NAME_LENGTH)}
                >
                  {roomName.length}/{MAX_ROOM_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Disciplina */}
            <div className="flex flex-col gap-2">
              <label className={modalLabelClass}>
                Disciplina
                <span className="ml-1 text-[10px] font-normal text-zinc-500">(opcional)</span>
              </label>
              <SubjectDropdown
                subjects={subjects}
                value={selectedSubject}
                onChange={setSelectedSubject}
                onAddNew={() => setAddSubjectOpen(true)}
                hasError={status === "error"}
              />
            </div>

          </div>

          {/* Erro */}
          {status === "error" && (
            <p role="alert" className={modalErrorClass}>
              <svg
                aria-hidden="true"
                className="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              {errorMsg}
            </p>
          )}

          {/* Criar */}
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isDisabled}
            aria-busy={status === "loading"}
            className={modalPrimaryButtonClass(status === "loading")}
          >
            {status === "loading" ? (
              <>
                <svg
                  aria-hidden="true"
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="31.4"
                    strokeDashoffset="10"
                    strokeLinecap="round"
                  />
                </svg>
                Criando sala...
              </>
            ) : (
              <>
                <Plus className="size-4" strokeWidth={2.5} />
                Criar Sala
              </>
            )}
          </button>

          <p className={modalHintClass}>
            Pressione <kbd className={modalKbdClass}>Enter</kbd> para criar rapidamente
          </p>
        </div>
      </Modal>

      {/* Modal aninhado: adicionar disciplina */}
      <AddSubjectModal
        open={addSubjectOpen}
        onClose={() => setAddSubjectOpen(false)}
        onCreated={handleSubjectCreated}
      />
    </>
  );
}