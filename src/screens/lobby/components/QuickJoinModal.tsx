"use client";

import { Modal } from "@/src/components/ui/Modal";
import { useState, useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const MAX_NAME_LENGTH = 24;

interface QuickJoinModalProps {
  open: boolean;
  roomCode: string;
  roomName: string;
  onJoined: () => void;
}

export function QuickJoinModal({ open, roomCode, roomName, onJoined }: QuickJoinModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [playerName, setPlayerName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setPlayerName("");
    setStatus("idle");
    setErrorMsg("");
  }, [open]);

  const isDisabled = status === "loading" || playerName.trim().length === 0;

  async function handleJoin() {
    const name = playerName.trim();
    if (!name || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/players`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roomCode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string })?.message ?? `Erro ${res.status}`);
      }

      onJoined();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Não foi possível entrar na sala.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {}}
      variant="dark"
      title="Entrar na Sala"
      subtitle={
        <>
          <span className="font-bold text-white">{roomName}</span>
          {" — "}insira seu nome para participar.
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
          <svg className="size-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
          </svg>
          <span className="text-xs text-zinc-400">
            Código:{" "}
            <span className="font-black tracking-widest text-white">{roomCode}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="quick-join-name" className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Seu nome
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="quick-join-name"
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value.slice(0, MAX_NAME_LENGTH));
                if (status === "error") setStatus("idle");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") void handleJoin(); }}
              placeholder="Ex: João"
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              spellCheck={false}
              className={[
                "w-full rounded-xl border bg-zinc-900 px-4 py-3.5 pr-14",
                "text-base font-medium text-white placeholder-zinc-600",
                "outline-none transition-all duration-200",
                status === "error"
                  ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              ].join(" ")}
            />
            <span className={["absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums transition-colors", playerName.length >= MAX_NAME_LENGTH ? "text-amber-400" : "text-zinc-600"].join(" ")}>
              {playerName.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
          {status === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-400">
              <svg aria-hidden className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              {errorMsg}
            </p>
          )}
        </div>

        <button
          onClick={() => void handleJoin()}
          disabled={isDisabled}
          aria-busy={status === "loading"}
          className={[
            "relative flex w-full items-center justify-center gap-2.5",
            "overflow-hidden rounded-xl py-4 text-sm font-bold text-white",
            "transition-all duration-200 active:scale-[.97]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            status !== "loading"
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-wait bg-blue-700",
          ].join(" ")}
        >
          {status === "loading" ? (
            <>
              <svg aria-hidden className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Entrando...
            </>
          ) : (
            <>
              <svg aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              Entrar na Sala
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-zinc-600">
          Pressione{" "}
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">Enter</kbd>
          {" "}para entrar rapidamente
        </p>
      </div>
    </Modal>
  );
}