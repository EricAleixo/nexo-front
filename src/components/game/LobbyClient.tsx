"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../lib/socket";
import { AddQuestionModal } from "../modals/AddQuestionModal";
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
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`
            flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold
            shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
            ${t.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : t.type === "error"
                ? "border-red-500/30 bg-red-500/15 text-red-300"
                : "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
            }
          `}
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
    <div
      className={`
        group flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/60
        px-5 py-4 backdrop-blur-sm transition-all duration-500
        hover:border-indigo-500/40 hover:bg-zinc-900/90
        ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
      `}
    >
      <div
        className={`
          flex size-11 shrink-0 items-center justify-center rounded-full
          bg-linear-to-br ${getAvatarColor(player.name)}
          text-base font-black text-white shadow-lg
        `}
      >
        {getInitial(player.name)}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="truncate text-sm font-semibold text-white">{player.name}</span>
        {player.isHost && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/25">
            <svg className="size-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Host
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.8)] animate-pulse" />
        <span className="text-[11px] text-zinc-500">online</span>
      </div>
    </div>
  );
}

function EmptyQuestions({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <svg className="size-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Nenhuma pergunta ainda</p>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-50">
          Adicione perguntas para começar a partida
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/25 hover:text-indigo-200"
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar primeira pergunta
      </button>
    </div>
  );
}

// Letras das alternativas: A, B, C, D
const OPTION_LABELS = ["A", "B", "C", "D"];

function QuestionItem({
  question,
  index,
  onDelete,
}: {
  question: Question;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  async function loadOptions() {
    if (options.length > 0) return; // já carregou
    setLoadingOptions(true);
    try {
      const data = await questionService.findOptionsByQuestionId(question.id);
      setOptions(data);
    } catch {
      // silencia erro — será exibido pelo estado vazio
    } finally {
      setLoadingOptions(false);
    }
  }

  function handleToggle() {
    if (!expanded) loadOptions();
    setExpanded((v) => !v);
  }

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden transition-colors hover:border-zinc-700/80">
      {/* Cabeçalho da questão */}
      <div className="flex items-center gap-3 px-4 py-3 group">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-bold text-indigo-400">
          {index + 1}
        </span>

        <p className="flex-1 truncate text-sm text-zinc-300">{question.title}</p>

        {/* Expandir alternativas */}
        <button
          onClick={handleToggle}
          title={expanded ? "Ocultar alternativas" : "Ver alternativas"}
          className="shrink-0 text-zinc-600 hover:text-indigo-400 transition-colors"
        >
          <svg
            className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Deletar questão */}
        <button
          onClick={() => onDelete(question.id)}
          title="Remover questão"
          className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Alternativas */}
      {expanded && (
        <div className="border-t border-zinc-800/60 px-4 pb-3 pt-2.5 flex flex-col gap-1.5">
          {loadingOptions ? (
            <div className="flex items-center gap-2 py-2">
              <svg className="size-3.5 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] text-zinc-500">Carregando alternativas...</span>
            </div>
          ) : options.length === 0 ? (
            <p className="text-[11px] text-zinc-600 py-1">Nenhuma alternativa cadastrada.</p>
          ) : (
            options.map((opt, i) => (
              <div
                key={opt.id}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border text-xs transition-colors
                  ${opt.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800/60 bg-zinc-900/60 text-zinc-400"
                  }`}
              >
                {/* Letra */}
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold
                    ${opt.isCorrect
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-800 text-zinc-500"
                    }`}
                >
                  {OPTION_LABELS[i] ?? i + 1}
                </span>

                <span className="flex-1 leading-snug">{opt.title}</span>

                {/* Ícone de correta */}
                {opt.isCorrect && (
                  <svg className="size-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  code: string;
  playersData: Player[];
  roomId: string;
  questionsData: Question[];
}

export function LobbyClient({ code, playersData, roomId, questionsData }: Props) {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>(playersData);
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  const [modalOpen, setModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [starting, setStarting] = useState(false);

  const [currentPlayerId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("playerId") : null
  );

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  // ── Toast helpers ────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code);
      addToast("Código copiado!", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  }

  function handleAddQuestion() {
    setModalOpen(true);
  }

  function handleQuestionAdded(question: Question) {
    setQuestions((prev) => [...prev, question]);
    addToast("Pergunta adicionada!", "success");
  }

  async function handleDeleteQuestion(id: string) {
    try {
      await questionService.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      addToast("Pergunta removida.", "info");
    } catch {
      addToast("Erro ao remover pergunta.", "error");
    }
  }

  async function handleStartGame() {
    if (questions.length === 0) {
      addToast("Adicione pelo menos uma pergunta antes de iniciar.", "error");
      return;
    }
    setStarting(true);
    socket.emit("start_game");
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const hostPlayer = players.find((p) => p.isHost);
  const guestPlayers = players.filter((p) => !p.isHost);
  const canStart = questions.length > 0 && !starting;

  // ── Socket effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    socket.connect();

    function onConnect() {
      socket.emit("join_room", { roomCode: code, playerId: currentPlayerId, isHost });
    }

    socket.on("connect", onConnect);

    // se já estava conectado, emite direto
    if (socket.connected) {
      socket.emit("join_room", { roomCode: code, playerId: currentPlayerId, isHost });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, [code]);

  useEffect(() => {
    function handlePlayerJoined(player: Player) {
      setPlayers((prev) => prev.some((p) => p.id === player.id) ? prev : [...prev, player]);
    }
    socket.on("player_joined", handlePlayerJoined);
    return () => { socket.off("player_joined", handlePlayerJoined); };
  }, []);

  useEffect(() => {
    function handlePlayerLeft(playerId: string) {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }
    socket.on("player_left", handlePlayerLeft);
    return () => { socket.off("player_left", handlePlayerLeft); };
  }, []);

  useEffect(() => {
    function handleRoomClosed() {
      addToast("O host encerrou a sala.", "error");
      setTimeout(() => router.push("/"), 1500);
    }
    socket.on("room_closed", handleRoomClosed);
    return () => { socket.off("room_closed", handleRoomClosed); };
  }, [router]);

  useEffect(() => {                              // ← adiciona aqui
    function handleGameStarted() {
      router.push(`/room/${code}/game`);
    }
    socket.on("game_started", handleGameStarted);
    return () => { socket.off("game_started", handleGameStarted); };
  }, [router, code]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* BG */}
      <div className="fixed inset-0 bg-[#080810] -z-10" />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="fixed top-0 left-1/2 -translate-x-1/2 w-200 h-75 -z-10 pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)",
          filter: "blur(70px)",
        }}
      />

      <div className="min-h-screen flex flex-col">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-[#080810]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm shrink-0"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="hidden sm:inline">Início</span>
              </button>
              <span className="text-zinc-700 hidden sm:block">·</span>
              <span
                className="text-sm font-black tracking-tight text-white hidden sm:block"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                QUIZZY
              </span>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Código da sala
              </span>
              <div className="flex items-center gap-2.5">
                <span
                  className="text-2xl sm:text-3xl font-black tracking-widest text-white"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {code}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copiar código"
                  className="flex size-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-zinc-400 transition-all hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-90"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,.9)]" />
              <span className="text-xs font-semibold text-emerald-400 hidden sm:block">Aguardando</span>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">{players.length}</span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 sm:px-6 py-8 lg:flex-row lg:items-start">

          {/* ── Players panel ── */}
          <section className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Jogadores online
              </h2>
              <span className="tabular-nums text-xs font-bold text-indigo-400">
                {players.length} {players.length === 1 ? "jogador" : "jogadores"}
              </span>
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
                  {guestPlayers.map((p, i) => (
                    <PlayerCard key={p.id} player={p} index={i + 1} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-800 px-5 py-4">
              <div className="flex gap-1 items-center">
                <span className="size-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-zinc-600">
                Aguardando mais jogadores entrarem com o código{" "}
                <button
                  onClick={handleCopyCode}
                  className="font-bold text-zinc-400 underline decoration-dotted hover:text-indigo-300 transition-colors"
                >
                  {code}
                </button>
              </p>
            </div>
          </section>

          {/* ── Host sidebar ── */}
          {isHost ? (
            <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
              {/* Questions panel */}
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 backdrop-blur-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Perguntas</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {questions.length === 0
                        ? "Nenhuma adicionada"
                        : `${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"}`}
                    </p>
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/8"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar
                  </button>
                </div>

                {questions.length === 0 ? (
                  <EmptyQuestions onAdd={handleAddQuestion} />
                ) : (
                  <div className="flex flex-col gap-2">
                    {questions.map((q, i) => (
                      <QuestionItem
                        key={q.id}
                        question={q}
                        index={i}
                        onDelete={handleDeleteQuestion}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Start game CTA */}
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                aria-busy={starting}
                className={[
                  "group relative flex w-full items-center justify-center gap-3 overflow-hidden",
                  "rounded-2xl py-5 text-base font-black text-white transition-all duration-300",
                  "active:scale-[.97] disabled:cursor-not-allowed",
                  canStart
                    ? "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_32px_rgba(99,102,241,.35)] hover:shadow-[0_0_48px_rgba(99,102,241,.55)]"
                    : "bg-zinc-800 opacity-50",
                ].join(" ")}
              >
                {starting ? (
                  <>
                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                    </svg>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                    </svg>
                    Iniciar Partida
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />
                  </>
                )}
              </button>

              {questions.length === 0 && (
                <p className="text-center text-[11px] text-zinc-600 -mt-2">
                  Adicione perguntas para habilitar o início
                </p>
              )}

              {/* Quick tips */}
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-4 flex flex-col gap-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Dicas</p>
                {[
                  "Compartilhe o código com os jogadores",
                  "Aguarde todos entrarem antes de iniciar",
                  "Adicione perguntas antes de começar",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[9px] font-bold text-indigo-400">
                      {i + 1}
                    </span>
                    <p className="text-xs text-zinc-500 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </aside>
          ) : (
            <aside className="w-full lg:w-72 shrink-0">
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-10 text-center backdrop-blur-sm">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <svg className="size-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Aguardando o host</p>
                  <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed max-w-45">
                    O quiz vai começar assim que{" "}
                    <span className="font-semibold text-zinc-300">{hostPlayer?.name ?? "o host"}</span>{" "}
                    iniciar a partida
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full bg-indigo-500/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
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