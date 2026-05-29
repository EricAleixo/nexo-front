"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface JoinRoomResponse {
  room: { id: string; code: string };
  player: { id: string; name: string; isHost: boolean };
}

type Status = "idle" | "loading" | "error";

interface FormState {
  name: string;
  digits: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const CODE_LENGTH = 6;
const MAX_NAME_LENGTH = 24;
const EMPTY_DIGITS = () => Array<string>(CODE_LENGTH).fill("");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeCodeChar(char: string): string {
  return char.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ open, onClose }: Props) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState<FormState>({
    name: "",
    digits: EMPTY_DIGITS(),
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const roomCode = form.digits.join("");
  const isCodeComplete = roomCode.length === CODE_LENGTH;
  const isNameFilled = form.name.trim().length > 0;
  const isDisabled = !isCodeComplete || !isNameFilled || status === "loading";

  // Reset & auto-focus on open/close
  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 80);
    } else {
      setForm({ name: "", digits: EMPTY_DIGITS() });
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  // ── Name handlers ──────────────────────────────────────────────────────────

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({
      ...f,
      name: e.target.value.slice(0, MAX_NAME_LENGTH),
    }));
    if (status === "error") setStatus("idle");
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") digitRefs.current[0]?.focus();
  }

  // ── Digit handlers ─────────────────────────────────────────────────────────

  function handleDigitChange(index: number, value: string) {
    const char = sanitizeCodeChar(value).slice(-1);
    const next = [...form.digits];
    next[index] = char;
    setForm((f) => ({ ...f, digits: next }));
    if (status === "error") setStatus("idle");
    if (char && index < CODE_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!form.digits[index] && index > 0) {
        const next = [...form.digits];
        next[index - 1] = "";
        setForm((f) => ({ ...f, digits: next }));
        digitRefs.current[index - 1]?.focus();
      } else {
        const next = [...form.digits];
        next[index] = "";
        setForm((f) => ({ ...f, digits: next }));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && !isDisabled) {
      handleJoin();
    }
  }

  function handleDigitPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .split("")
      .map(sanitizeCodeChar)
      .filter(Boolean)
      .slice(0, CODE_LENGTH);

    const next = [...EMPTY_DIGITS()];
    pasted.forEach((char, i) => { next[i] = char; });
    setForm((f) => ({ ...f, digits: next }));
    if (status === "error") setStatus("idle");

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    digitRefs.current[focusIndex]?.focus();
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleJoin = useCallback(async () => {
    const name = form.name.trim();
    const code = form.digits.join("");

    if (!name || code.length !== CODE_LENGTH || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, roomCode: code }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${res.status}`);
      }

      const data: JoinRoomResponse = await res.json();

      localStorage.setItem("playerId", data.player.id);
      localStorage.setItem("roomCode", data.room.code);

      router.push(`/room/${data.room.code}/lobby`);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível entrar na sala."
      );
      // Shake focus back to first empty digit or name
      const firstEmpty = form.digits.findIndex((d) => !d);
      if (firstEmpty !== -1) {
        digitRefs.current[firstEmpty]?.focus();
      } else if (!form.name.trim()) {
        nameRef.current?.focus();
      }
    }
  }, [form, status, router]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Entrar na Sala"
      subtitle="Nome e código para entrar no quiz."
    >
      <div className="flex flex-col gap-6">

        {/* ── Player name ── */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="join-player-name"
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500"
          >
            Seu nome
          </label>
          <input
            ref={nameRef}
            id="join-player-name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            placeholder="Ex: João"
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={status === "error" && !isNameFilled}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base font-medium text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* ── Room code ── */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Código da sala
          </label>

          {/* Digit inputs */}
          <div
            role="group"
            aria-label="Código da sala, 6 caracteres"
            className="flex justify-between gap-1.5 sm:gap-2"
            onPaste={handleDigitPaste}
          >
            {form.digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { digitRefs.current[i] = el; }}
                id={`digit-${i}`}
                type="text"
                inputMode="text"
                value={digit}
                maxLength={2} // 2 allows catching the extra char for replace logic
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                aria-label={`Caractere ${i + 1} de ${CODE_LENGTH}`}
                className={[
                  "h-14 flex-1 min-w-0 rounded-xl border text-center text-xl font-black",
                  "bg-zinc-900 text-white outline-none transition-all duration-200",
                  "focus:ring-2 focus:ring-indigo-500/25",
                  digit
                    ? "border-indigo-500 text-indigo-300 shadow-[0_0_14px_rgba(99,102,241,.28)]"
                    : "border-zinc-700 focus:border-indigo-500/70",
                ].join(" ")}
                style={{ fontFamily: "var(--font-syne)" }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(roomCode.length / CODE_LENGTH) * 100}%` }}
              role="progressbar"
              aria-valuenow={roomCode.length}
              aria-valuemin={0}
              aria-valuemax={CODE_LENGTH}
              aria-label="Progresso do código"
            />
          </div>

          <p className="text-center text-[11px] text-zinc-600">
            Cole o código — os campos preenchem automaticamente
          </p>
        </div>

        {/* ── Error ── */}
        {status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3"
          >
            <svg
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-red-400"
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
            <p className="text-xs font-medium leading-relaxed text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          onClick={handleJoin}
          disabled={isDisabled}
          aria-busy={status === "loading"}
          className={[
            "relative flex w-full items-center justify-center gap-2.5",
            "overflow-hidden rounded-xl py-4 text-sm font-bold text-white",
            "transition-all duration-200 active:scale-[.97]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            status !== "loading"
              ? "bg-indigo-500 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,.45)]"
              : "cursor-wait bg-indigo-600",
          ].join(" ")}
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
                  stroke="currentColor" strokeWidth="3"
                  strokeDasharray="31.4" strokeDashoffset="10"
                  strokeLinecap="round"
                />
              </svg>
              Entrando...
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
              </svg>
              Entrar na Sala
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}