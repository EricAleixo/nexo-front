"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { AddQuestionModal } from "../modals/AddQuestionModal";
import { Modal } from "../ui/Modal";
import { questionService, Option } from "../../services/question.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface Question {
  id: string;
  title: string;
  order: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface RoomState {
  players: Player[];
  currentPlayer: {
    id: string;
    name: string;
    isHost: boolean;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const MAX_NAME_LENGTH = 24;

// ─── Socket factory ───────────────────────────────────────────────────────────

function createSocket(): Socket {
  return io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-violet-500 to-indigo-600",
    "from-fuchsia-500 to-purple-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function generateToastId(): string {
  return Math.random().toString(36).slice(2);
}

// ─── Animation variants ───────────────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const numberVariants: Variants = {
  enter: { scale: 1.6, opacity: 0, filter: "blur(8px)" },
  center: {
    scale: 1, opacity: 1, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 18 },
  },
  exit: { scale: 0.6, opacity: 0, filter: "blur(6px)", transition: { duration: 0.2 } },
};

const goVariants: Variants = {
  enter: { scale: 0.4, opacity: 0, letterSpacing: "-0.1em" },
  center: {
    scale: 1, opacity: 1, letterSpacing: "0.06em",
    transition: { type: "spring", stiffness: 260, damping: 14 },
  },
  exit: { scale: 1.2, opacity: 0, transition: { duration: 0.25 } },
};

const labelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/**
 * O `ease` com bezier deve ser uma tupla de 4 números ([x1,y1,x2,y2]),
 * não um array genérico number[]. O `as const` garante que o TypeScript
 * infira o tipo `readonly [0.2, 0.8, 0.4, 1]` em vez de `number[]`,
 * satisfazendo o tipo `Easing` do Framer Motion.
 */
const shockwaveVariants: Variants = {
  animate: (delay: number) => ({
    scale: [0.8, 3.5],
    opacity: [0.7, 0],
    transition: {
      duration: 0.9,
      delay,
      ease: [0.2, 0.8, 0.4, 1] as [number, number, number, number],
    },
  }),
};

// ─── Quick Join Modal (inline) ────────────────────────────────────────────────

function QuickJoinModal({
  open,
  roomCode,
  roomName,
  onJoined,
}: {
  open: boolean;
  roomCode: string;
  roomName: string;
  onJoined: () => void;
}) {
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
      onClose={() => { }}
      title="Entrar na Sala"
      subtitle={
        <>
          <span className="font-bold text-white">{roomName}</span>
          {" — "}insira seu nome para participar.
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-4 py-3">
          <svg className="size-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
          </svg>
          <span className="text-xs text-zinc-400">
            Código:{" "}
            <span className="font-black tracking-widest text-white" style={{ fontFamily: "var(--font-syne)" }}>
              {roomCode}
            </span>
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
                  : "border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
              ].join(" ")}
            />
            <span className={[
              "absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums transition-colors",
              playerName.length >= MAX_NAME_LENGTH ? "text-amber-400" : "text-zinc-600",
            ].join(" ")}>
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
              ? "bg-indigo-500 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,.45)]"
              : "cursor-wait bg-indigo-600",
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={[
            "flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3",
            "text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-300",
            "animate-in fade-in slide-in-from-bottom-2",
            t.type === "success" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : t.type === "error" ? "border-red-500/30 bg-red-500/15 text-red-300"
                : "border-indigo-500/30 bg-indigo-500/15 text-indigo-300",
          ].join(" ")}
        >
          {t.type === "success" && (
            <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function PlayerCard({ player, index }: { player: Player; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className={[
      "group flex items-center gap-4 rounded-2xl border border-zinc-800/60",
      "bg-zinc-900/60 px-5 py-4 backdrop-blur-sm transition-all duration-500",
      "hover:border-indigo-500/40 hover:bg-zinc-900/90",
      visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
    ].join(" ")}>
      <div className={[
        "flex size-11 shrink-0 items-center justify-center rounded-full",
        `bg-linear-to-br ${getAvatarColor(player.name)}`,
        "text-base font-black text-white shadow-lg",
      ].join(" ")}>
        {getInitial(player.name)}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="truncate text-sm font-semibold text-white">{player.name}</span>
        {player.isHost && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <svg className="size-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Host
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="size-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.8)]" />
        <span className="text-[11px] text-zinc-500">online</span>
      </div>
    </div>
  );
}

function EmptyQuestions({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
        <svg className="size-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Nenhuma pergunta ainda</p>
        <p className="mt-1 max-w-50 text-xs leading-relaxed text-zinc-500">Adicione perguntas para começar a partida</p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/25 hover:text-indigo-200"
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar primeira pergunta
      </button>
    </div>
  );
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function QuestionItem({ question, index, onDelete, setCurrect }: { question: Question; index: number; onDelete: (id: string) => void, setCurrect: (id: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const loadOptions = useCallback(async () => {
    if (options.length > 0) return;
    setLoadingOptions(true);
    try {
      const data = await questionService.findOptionsByQuestionId(question.id);
      setOptions(data);
    } catch { /* silencia */ } finally {
      setLoadingOptions(false);
    }
  }, [question.id, options.length]);

  function handleToggle() {
    if (!expanded) void loadOptions();
    setExpanded((v) => !v);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/50 transition-colors hover:border-zinc-700/80">
      <div className="group flex items-center gap-3 px-4 py-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-bold text-indigo-400">{index + 1}</span>
        <p className="flex-1 truncate text-sm text-zinc-300">{question.title}</p>
        <button onClick={handleToggle} title={expanded ? "Ocultar" : "Ver alternativas"} className="shrink-0 text-zinc-600 transition-colors hover:text-indigo-400">
          <svg className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button onClick={() => onDelete(question.id)} title="Remover" className="shrink-0 text-zinc-600 opacity-0 transition-colors hover:text-red-400 group-hover:opacity-100">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="flex flex-col gap-1.5 border-t border-zinc-800/60 px-4 pb-3 pt-2.5">
          {loadingOptions ? (
            <div className="flex items-center gap-2 py-2">
              <svg className="size-3.5 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] text-zinc-500">Carregando...</span>
            </div>
          ) : options.length === 0 ? (
            <p className="py-1 text-[11px] text-zinc-600">Nenhuma alternativa cadastrada.</p>
          ) : (
            options.map((opt, i) => (
              <div key={opt.id}
                onClick={async () => {
                  await setCurrect(opt.id);
                  setOptions(prev =>
                    prev.map(o => ({ ...o, isCorrect: o.id === opt.id }))
                  );
                }}
                className={["flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors", opt.isCorrect ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-zinc-800/60 bg-zinc-900/60 text-zinc-400"].join(" ")}>
                <span className={["flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold", opt.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"].join(" ")}>{OPTION_LABELS[i] ?? i + 1}</span>
                <span className="flex-1 leading-snug">{opt.title}</span>
                {
                  opt.isCorrect &&
                  <svg className="size-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                }
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function ProgressRing({ count }: { count: number }) {
  const CIRCUMFERENCE = 2 * Math.PI * 45;
  const progress = useMotionValue(CIRCUMFERENCE);
  const strokeDashoffset = useTransform(progress, (v) => v);

  useEffect(() => {
    progress.set(CIRCUMFERENCE);
    const controls = animate(progress, 0, { duration: 1, ease: "linear" });
    return controls.stop;
  }, [count, CIRCUMFERENCE, progress]);

  return (
    <svg aria-hidden width="200" height="200" viewBox="0 0 96 96" className="absolute">
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="45" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="3" />
      <motion.circle cx="48" cy="48" r="45" fill="none" stroke="url(#arcGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} style={{ strokeDashoffset, rotate: -90, originX: "48px", originY: "48px" }} />
    </svg>
  );
}

function CountdownOverlay({ count }: { count: number }) {
  const isGo = count === 0;
  return (
    <AnimatePresence>
      <motion.div key="overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{ background: "rgba(8, 8, 16, 0.97)" }}>
        <motion.div aria-hidden variants={gridVariants} initial="hidden" animate="visible" className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.08) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <motion.div aria-hidden className="absolute inset-0" animate={{ background: isGo ? "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99,102,241,.22) 0%, transparent 70%)" : "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(99,102,241,.12) 0%, transparent 70%)" }} transition={{ duration: 0.5 }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(8,8,16,.9) 100%)" }} />
        {[0, 1].map((i) => (
          <motion.div key={`sw-${count}-${i}`} aria-hidden className="absolute rounded-full border border-indigo-500/50" style={{ width: 200, height: 200 }} custom={i * 0.18} variants={shockwaveVariants} animate="animate" />
        ))}
        <AnimatePresence>
          {!isGo && (
            <motion.div key="ring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressRing count={count} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative flex select-none flex-col items-center gap-6">
          <AnimatePresence mode="popLayout">
            {isGo ? (
              <motion.span key="go" variants={goVariants} initial="enter" animate="center" exit="exit" className="font-black leading-none" style={{ fontSize: "clamp(5rem, 20vw, 9rem)", letterSpacing: "0.06em", background: "linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>GO!</motion.span>
            ) : (
              <motion.span key={count} variants={numberVariants} initial="enter" animate="center" exit="exit" className="font-black tabular-nums leading-none" style={{ fontSize: "clamp(5rem, 20vw, 9rem)", background: "linear-gradient(160deg, #ffffff 30%, rgba(99,102,241,.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{count}</motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p key={isGo ? "go-label" : "cd-label"} variants={labelVariants} initial="hidden" animate="visible" exit="hidden" className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: isGo ? "rgba(167,139,250,0.9)" : "rgba(161,161,170,0.7)" }}>
              {isGo ? "Boa sorte a todos!" : "A partida vai começar"}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence>
            {!isGo && (
              <motion.div key="pips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 flex items-center gap-2">
                {[5, 4, 3, 2, 1].map((n) => (
                  <motion.span key={n} className="h-1.5 rounded-full" animate={{ width: n === count ? 20 : 6, background: n === count ? "linear-gradient(90deg, #6366f1, #a855f7)" : n < count ? "rgba(99,102,241,0.5)" : "rgba(63,63,70,0.6)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  code: string;
  roomId: string;
  roomName: string;
  playersData: Player[];
  questionsData: Question[];
}

export function LobbyClient({ code, roomId, roomName, playersData, questionsData }: Props) {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>(playersData);
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  const [currentPlayer, setCurrentPlayer] = useState<RoomState["currentPlayer"] | null>(null);
  const isHost = currentPlayer?.isHost ?? false;

  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [socketStatus, setSocketStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
  const [quickJoinOpen, setQuickJoinOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const joinedRef = useRef(false);

  const hostPlayer = useMemo(() => players.find((p) => p.isHost), [players]);
  const guestPlayers = useMemo(() => players.filter((p) => !p.isHost), [players]);
  const canStart = questions.length > 0 && !starting;

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startCountdown = useCallback((onComplete: () => void) => {
    setCountdown(5);
    let current = 5;
    countdownRef.current = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setTimeout(onComplete, 900);
      }
    }, 1000);
  }, []);

  // ── Socket ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    function onConnect() {
      setSocketStatus("connected");
      setQuickJoinOpen(false);
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("join_room", { roomCode: code });
    }

    function onDisconnect(reason: string) {
      setSocketStatus("disconnected");
      if (reason === "io server disconnect") {
        setQuickJoinOpen(true);
        return;
      }
      joinedRef.current = false;
    }

    function onConnectError() {
      setSocketStatus("error");
    }

    function onRoomState(state: RoomState) {
      setPlayers(state.players);
      setCurrentPlayer(state.currentPlayer);
    }

    function onPlayerJoined(player: Player) {
      setPlayers((prev) => prev.some((p) => p.id === player.id) ? prev : [...prev, player]);
      addToast(`${player.name} entrou na sala!`, "info");
    }

    function onPlayerLeft(playerId: string) {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }

    function onRoomClosed() {
      addToast("O host encerrou a sala.", "error");
      setTimeout(() => router.push("/"), 1500);
    }

    function onGameStarted() {
      startCountdown(() => router.push(`/room/${code}/game`));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("room:state", onRoomState);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_left", onPlayerLeft);
    socket.on("room_closed", onRoomClosed);
    socket.on("game_started", onGameStarted);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("room:state", onRoomState);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_left", onPlayerLeft);
      socket.off("room_closed", onRoomClosed);
      socket.off("game_started", onGameStarted);
      socket.disconnect();
      socketRef.current = null;
      joinedRef.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleQuickJoined = useCallback(() => {
    setQuickJoinOpen(false);
    joinedRef.current = false;
    socketRef.current?.connect();
  }, []);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      addToast("Código copiado!", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  }, [code, addToast]);

  const handleAddQuestion = useCallback(() => setModalOpen(true), []);

  const handleQuestionAdded = useCallback((question: Question) => {
    setQuestions((prev) => [...prev, question]);
    addToast("Pergunta adicionada!", "success");
  }, [addToast]);

  const handleDeleteQuestion = useCallback(async (id: string) => {
    try {
      await questionService.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      addToast("Pergunta removida.", "info");
    } catch {
      addToast("Erro ao remover pergunta.", "error");
    }
  }, [addToast]);

  const handleUpdateToCurrectQuestion = async (id: string) => {
    try {
      await questionService.updateCurrect(id);
      addToast("Alternativa correta atualizada!", "success");
    } catch {
      addToast("Erro ao atualizar alternativa.", "error");
    }
  }

  const handleStartGame = useCallback(() => {
    if (questions.length === 0) {
      addToast("Adicione pelo menos uma pergunta antes de iniciar.", "error");
      return;
    }
    setStarting(true);
    socketRef.current?.emit("start_game");
  }, [questions.length, addToast]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {countdown !== null && <CountdownOverlay count={countdown} />}

      <QuickJoinModal
        open={quickJoinOpen}
        roomCode={code}
        roomName={roomName}
        onJoined={handleQuickJoined}
      />

      {/* BG */}
      <div className="fixed inset-0 -z-10 bg-[#080810]" />
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div aria-hidden className="fixed top-0 left-1/2 -z-10 h-75 w-200 -translate-x-1/2 pointer-events-none opacity-15" style={{ background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)", filter: "blur(70px)" }} />

      <div className="flex min-h-screen flex-col">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-[#080810]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => router.push("/")} className="flex shrink-0 items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200">
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                <span className="hidden sm:inline">Início</span>
              </button>
              <span className="hidden text-zinc-700 sm:block">·</span>
              <span className="hidden text-sm font-black tracking-tight text-white sm:block" style={{ fontFamily: "var(--font-syne)" }}>QUIZZY</span>
            </div>

            {/* Nome + código da sala */}
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <h1 className="max-w-48 truncate text-sm font-bold text-white sm:max-w-64">
                {roomName}
              </h1>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-widest text-zinc-500">{code}</span>
                <button onClick={handleCopyCode} title="Copiar código" className="flex size-6 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/80 text-zinc-500 transition-all hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-90">
                  <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                </button>
              </div>
            </div>

            <div className={["flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-500", socketStatus === "connected" ? "border-emerald-500/25 bg-emerald-500/10" : socketStatus === "error" ? "border-red-500/25 bg-red-500/10" : "border-zinc-700/25 bg-zinc-800/30"].join(" ")}>
              <span className={["size-1.5 rounded-full", socketStatus === "connected" ? "animate-pulse bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.9)]" : socketStatus === "error" ? "bg-red-400" : "animate-pulse bg-zinc-500"].join(" ")} />
              <span className={["hidden text-xs font-semibold sm:block", socketStatus === "connected" ? "text-emerald-400" : socketStatus === "error" ? "text-red-400" : "text-zinc-500"].join(" ")}>
                {socketStatus === "connected" ? "Aguardando" : socketStatus === "error" ? "Erro" : "Conectando"}
              </span>
              <span className={["text-xs font-bold tabular-nums", socketStatus === "connected" ? "text-emerald-400" : "text-zinc-500"].join(" ")}>{players.length}</span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start">
          {/* Players panel */}
          <section className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Jogadores online</h2>
              <span className="text-xs font-bold tabular-nums text-indigo-400">{players.length} {players.length === 1 ? "jogador" : "jogadores"}</span>
            </div>

            {hostPlayer && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600">Host</p>
                <PlayerCard player={hostPlayer} index={0} />
              </div>
            )}

            {guestPlayers.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600">Jogadores</p>
                <div className="flex flex-col gap-2">
                  {guestPlayers.map((p, i) => <PlayerCard key={p.id} player={p} index={i + 1} />)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-800 px-5 py-4">
              <div className="flex items-center gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-zinc-600 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-zinc-600 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-zinc-600 [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-zinc-600">
                Aguardando mais jogadores entrarem com o código{" "}
                <button onClick={handleCopyCode} className="font-bold text-zinc-400 underline decoration-dotted transition-colors hover:text-indigo-300">{code}</button>
              </p>
            </div>
          </section>

          {/* Sidebar */}
          {isHost ? (
            <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Perguntas</h3>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{questions.length === 0 ? "Nenhuma adicionada" : `${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"}`}</p>
                  </div>
                  <button onClick={handleAddQuestion} className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/8 hover:text-indigo-300">
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Adicionar
                  </button>
                </div>
                {questions.length === 0 ? <EmptyQuestions onAdd={handleAddQuestion} /> : (
                  <div className="flex flex-col gap-2">
                    {questions.map((q, i) => <QuestionItem key={q.id} question={q} index={i} onDelete={handleDeleteQuestion} setCurrect={handleUpdateToCurrectQuestion} />)}
                  </div>
                )}
              </div>

              <button onClick={handleStartGame} disabled={!canStart} aria-busy={starting} className={["group relative flex w-full items-center justify-center gap-3 overflow-hidden", "rounded-2xl py-5 text-base font-black text-white transition-all duration-300", "active:scale-[.97] disabled:cursor-not-allowed", canStart ? "bg-linear-to-r from-indigo-500 to-purple-600 shadow-[0_0_32px_rgba(99,102,241,.35)] hover:from-indigo-400 hover:to-purple-500 hover:shadow-[0_0_48px_rgba(99,102,241,.55)]" : "bg-zinc-800 opacity-50"].join(" ")}>
                {starting ? (
                  <><svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg>Iniciando...</>
                ) : (
                  <><svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>Iniciar Partida<span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" /></>
                )}
              </button>

              {questions.length === 0 && <p className="-mt-2 text-center text-[11px] text-zinc-600">Adicione perguntas para habilitar o início</p>}

              <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Dicas</p>
                {["Compartilhe o código com os jogadores", "Aguarde todos entrarem antes de iniciar", "Adicione perguntas antes de começar"].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[9px] font-bold text-indigo-400">{i + 1}</span>
                    <p className="text-xs leading-relaxed text-zinc-500">{tip}</p>
                  </div>
                ))}
              </div>
            </aside>
          ) : (
            <aside className="w-full shrink-0 lg:w-72">
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-10 text-center backdrop-blur-sm">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                  <svg className="size-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Aguardando o host</p>
                  <p className="mt-1.5 max-w-45 text-xs leading-relaxed text-zinc-500">
                    O quiz vai começar assim que{" "}
                    <span className="font-semibold text-zinc-300">{hostPlayer?.name ?? "o host"}</span>{" "}
                    iniciar a partida
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-indigo-500/50" style={{ animationDelay: `${i * 150}ms` }} />)}
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {isHost && roomId && (
        <AddQuestionModal
          open={modalOpen}
          roomId={roomId}
          nextOrder={questions.length + 1}
          onClose={() => setModalOpen(false)}
          onQuestionAdded={handleQuestionAdded}
        />
      )}
    </>
  );
}