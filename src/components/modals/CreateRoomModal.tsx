"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";
import { useAuth } from "../AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateRoomResponse {
  room: { id: string; code: string };
  player: { name: string; isHost: boolean };
}

type Status = "idle" | "loading" | "error";

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const MAX_NAME_LENGTH = 24;
const MAX_ROOM_NAME_LENGTH = 32;

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const playerNameRef = useRef<HTMLInputElement>(null);

  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => playerNameRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setPlayerName("");
    setRoomName("");
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
        body: JSON.stringify({ playerName: name, roomName: room, userId: user?.id }),
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar Sala"
      subtitle="Preencha os campos para começar."
    >
      <div className="flex flex-col gap-6">
        {/* ── Campos ── */}
        <div className="flex flex-col gap-4">
          {/* Nome do jogador */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="player-name"
              className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
            >
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
                onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
                placeholder="Ex: Eric"
                maxLength={MAX_NAME_LENGTH}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={status === "error"}
                className={[
                  "w-full rounded-xl border bg-zinc-900 px-4 py-3.5 pr-14",
                  "text-base font-medium text-white placeholder-zinc-600",
                  "outline-none transition-all duration-200",
                  status === "error"
                    ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                ].join(" ")}
              />
              <span
                aria-hidden="true"
                className={[
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums transition-colors",
                  playerName.length >= MAX_NAME_LENGTH ? "text-amber-400" : "text-zinc-600",
                ].join(" ")}
              >
                {playerName.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* Nome da sala */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="room-name"
              className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
            >
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
                onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
                placeholder="Ex: Quiz de Geografia"
                maxLength={MAX_ROOM_NAME_LENGTH}
                autoComplete="off"
                spellCheck={false}
                className={[
                  "w-full rounded-xl border bg-zinc-900 px-4 py-3.5 pr-14",
                  "text-base font-medium text-white placeholder-zinc-600",
                  "outline-none transition-all duration-200",
                  status === "error"
                    ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                ].join(" ")}
              />
              <span
                aria-hidden="true"
                className={[
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums transition-colors",
                  roomName.length >= MAX_ROOM_NAME_LENGTH ? "text-amber-400" : "text-zinc-600",
                ].join(" ")}
              >
                {roomName.length}/{MAX_ROOM_NAME_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {/* ── Erro ── */}
        {status === "error" && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-400"
          >
            <svg
              aria-hidden="true"
              className="size-3.5 shrink-0"
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

        {/* ── Botão ── */}
        <button
          onClick={() => void handleCreate()}
          disabled={isDisabled}
          aria-busy={status === "loading"}
          className={[
            "relative flex w-full items-center justify-center gap-2.5",
            "overflow-hidden rounded-xl py-4 text-sm font-bold text-white",
            "transition-all duration-200 active:scale-[.97]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            status !== "loading"
              ? "bg-indigo-500 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,.45)]"
              : "bg-indigo-600 cursor-wait",
          ].join(" ")}
        >
          {status === "loading" ? (
            <>
              <svg aria-hidden="true" className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Criando sala...
            </>
          ) : (
            <>
              <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Criar Sala
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-zinc-600">
          Pressione{" "}
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            Enter
          </kbd>{" "}
          para criar rapidamente
        </p>
      </div>
    </Modal>
  );
}