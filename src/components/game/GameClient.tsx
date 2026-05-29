"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/src/lib/socket";
import { Player } from "@/src/services/players.service";
import { Trophy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    id: string;
    title: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    title: string;
    order: number;
    options: Option[];
}

type Phase = "answering" | "answered" | "result";

// Entrada na lista de jogadores que já responderam (recebida via socket)
interface AnsweredEntry {
    playerId: string;
    playerName: string;
    optionId: string;
    answeredAt: number;
}

interface Props {
    code: string;
    roomId: string;
    questions: Question[];
    players: Player[];
    timePerQuestion: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
    { base: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-200", label: "bg-indigo-500/30 text-indigo-300", bar: "bg-indigo-400", pulse: "bg-indigo-400" },
    { base: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-200", label: "bg-fuchsia-500/30 text-fuchsia-300", bar: "bg-fuchsia-400", pulse: "bg-fuchsia-400" },
    { base: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-200", label: "bg-sky-500/30 text-sky-300", bar: "bg-sky-400", pulse: "bg-sky-400" },
    { base: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-200", label: "bg-amber-500/30 text-amber-300", bar: "bg-amber-400", pulse: "bg-amber-400" },
];
const OPTION_COLORS_INTERACTIVE = [
    { base: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-200 hover:from-indigo-500/30 hover:border-indigo-400/60", label: "bg-indigo-500/30 text-indigo-300" },
    { base: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-200 hover:from-fuchsia-500/30 hover:border-fuchsia-400/60", label: "bg-fuchsia-500/30 text-fuchsia-300" },
    { base: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-200 hover:from-sky-500/30 hover:border-sky-400/60", label: "bg-sky-500/30 text-sky-300" },
    { base: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-200 hover:from-amber-500/30 hover:border-amber-400/60", label: "bg-amber-500/30 text-amber-300" },
];

const AVATAR_COLORS = [
    "bg-violet-500", "bg-fuchsia-500", "bg-sky-500",
    "bg-emerald-500", "bg-rose-500", "bg-amber-500",
    "bg-indigo-500", "bg-teal-500",
];

function getAvatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// Índice da opção dentro do array de opções
function getOptionIndex(options: Option[], optionId: string): number {
    return options.findIndex((o) => o.id === optionId);
}

// ─── Timer ring ───────────────────────────────────────────────────────────────

function TimerRing({ current, total }: { current: number; total: number }) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const progress = current / total;
    const offset = circumference * (1 - progress);
    const isUrgent = current <= 5;

    return (
        <div className="relative flex items-center justify-center size-20">
            <svg className="-rotate-90 size-20" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                    cx="36" cy="36" r={radius} fill="none"
                    stroke={isUrgent ? "#f87171" : "#818cf8"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
                />
            </svg>
            <span className={`absolute text-2xl font-black tabular-nums transition-colors duration-300 ${isUrgent ? "text-red-400" : "text-white"}`}>
                {current}
            </span>
        </div>
    );
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function Scoreboard({ players, correctOptionId, currentPlayerId }: {
    players: Player[];
    correctOptionId: string;
    currentPlayerId: string | null;
}) {
    const sorted = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
            {sorted.map((p, i) => (
                <div
                    key={p.id}
                    className={`
            flex items-center gap-3 rounded-xl px-4 py-3 border transition-all
            ${p.id === currentPlayerId ? "border-indigo-500/40 bg-indigo-500/10" : "border-zinc-800/60 bg-zinc-900/60"}
          `}
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    <span className="text-xs font-black text-zinc-600 w-4 shrink-0">#{i + 1}</span>
                    <span className={`size-7 rounded-full ${getAvatarColor(p.name)} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                        {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-white truncate">{p.name}</span>
                    {p.answeredCorrectly !== undefined && (
                        p.answeredCorrectly
                            ? <svg className="size-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            : <svg className="size-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    )}
                    <span className="text-sm font-black text-indigo-400 tabular-nums shrink-0">{p.score} pts</span>
                </div>
            ))}
        </div>
    );
}

// ─── Answered Players List (host only) ────────────────────────────────────────

function AnsweredPlayersList({
    answeredList,
    options,
    newEntryId,
}: {
    answeredList: AnsweredEntry[];
    options: Option[];
    newEntryId: string | null;
}) {
    if (answeredList.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {answeredList.map((entry) => {
                const optIdx = getOptionIndex(options, entry.optionId);
                const color = OPTION_COLORS[optIdx >= 0 ? optIdx % OPTION_COLORS.length : 0];
                const isNew = entry.playerId === newEntryId;

                return (
                    <div
                        key={entry.playerId}
                        title={`${entry.playerName} → ${OPTION_LABELS[optIdx] ?? "?"}`}
                        className={`
                            relative flex items-center gap-1.5 rounded-full border px-2 py-1
                            transition-all duration-300
                            ${color.label.replace("bg-", "border-").replace("/30", "/40")}
                            bg-zinc-900/80
                            ${isNew ? "scale-110 ring-2 ring-white/20" : "scale-100"}
                        `}
                        style={{
                            animation: isNew ? "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined,
                        }}
                    >
                        <span className={`size-5 rounded-full ${getAvatarColor(entry.playerName)} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                            {entry.playerName.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[11px] font-semibold text-white/80 max-w-[60px] truncate">
                            {entry.playerName}
                        </span>
                        <span className={`text-[10px] font-black rounded-md px-1 ${color.label}`}>
                            {OPTION_LABELS[optIdx] ?? "?"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Host Option Viewer ───────────────────────────────────────────────────────

function HostOptionViewer({
    options,
    voteCounts,
    totalPlayers,
    phase,
    correctOptionId,
    answeredList,
    newEntryId,
}: {
    options: Option[];
    voteCounts: Record<string, number>;
    totalPlayers: number;
    phase: Phase;
    correctOptionId: string | null;
    answeredList: AnsweredEntry[];
    newEntryId: string | null;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, i) => {
                const color = OPTION_COLORS[i % OPTION_COLORS.length];
                const votes = voteCounts[opt.id] ?? 0;
                const pct = totalPlayers > 0 ? Math.round((votes / totalPlayers) * 100) : 0;
                const isCorrect = phase === "result" && correctOptionId === opt.id;

                const optionVoters = answeredList.filter((e) => e.optionId === opt.id);
                const hasNewInThisOption = optionVoters.some((e) => e.playerId === newEntryId);

                return (
                    <div
                        key={opt.id}
                        className={`
              relative flex flex-col gap-2.5 rounded-2xl border px-5 py-4
              bg-gradient-to-br transition-all duration-300
              ${isCorrect
                                ? "border-emerald-500/60 from-emerald-500/20 to-emerald-600/10 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,.2)]"
                                : `${color.base}`
                            }
              ${hasNewInThisOption && phase === "answering" ? "shadow-[0_0_16px_rgba(255,255,255,.06)]" : ""}
            `}
                    >
                        <div className="flex items-center gap-4">
                            <span
                                className={`
                  flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black
                  ${isCorrect ? "bg-emerald-500/30 text-emerald-300" : color.label}
                `}
                            >
                                {OPTION_LABELS[i]}
                            </span>
                            <span className="flex-1 text-sm font-semibold leading-snug">{opt.title}</span>
                            {isCorrect && (
                                <svg className="size-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${isCorrect ? "bg-emerald-400" : color.bar}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-bold tabular-nums text-white/50 shrink-0 w-12 text-right">
                                {votes} {votes === 1 ? "voto" : "votos"}
                            </span>
                        </div>

                        {optionVoters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {optionVoters.map((entry) => {
                                    const isNew = entry.playerId === newEntryId;
                                    return (
                                        <div
                                            key={entry.playerId}
                                            title={entry.playerName}
                                            className="relative flex items-center justify-center"
                                            style={{
                                                animation: isNew
                                                    ? "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards"
                                                    : undefined,
                                            }}
                                        >
                                            <span
                                                className={`
                                                    size-6 rounded-full ${getAvatarColor(entry.playerName)}
                                                    flex items-center justify-center text-[10px] font-black text-white
                                                    ring-2 ${isNew ? "ring-white/40" : "ring-zinc-900"}
                                                    transition-all duration-200
                                                `}
                                            >
                                                {entry.playerName.charAt(0).toUpperCase()}
                                            </span>
                                            {isNew && (
                                                <span
                                                    className={`absolute inset-0 rounded-full ${color.pulse} opacity-60`}
                                                    style={{ animation: "ping 0.6s ease-out forwards" }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function GameClient({ code, roomId, questions, timePerQuestion, players: initialPlayers }: Props) {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("answering");
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [questionVisible, setQuestionVisible] = useState(false);
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
    const [answeredList, setAnsweredList] = useState<AnsweredEntry[]>([]);
    const [newEntryId, setNewEntryId] = useState<string | null>(null);
    const [countBump, setCountBump] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const newEntryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const bumpTimerRef = useRef<NodeJS.Timeout | null>(null);

    const currentPlayerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    const isHost = currentPlayer?.isHost;

    const guestPlayers = players.filter((p) => !p.isHost);

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    // ── Timer ─────────────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(timePerQuestion);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    setPhase("result");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer, timePerQuestion]);

    // ── Mount / questão muda ──────────────────────────────────────────────────

    useEffect(() => {
        setPhase("answering");
        setSelectedOptionId(null);
        setCorrectOptionId(null);
        setQuestionVisible(false);
        setVoteCounts({});
        setAnsweredList([]);
        setNewEntryId(null);
        setCountBump(false);
        startTimer();

        const t = setTimeout(() => setQuestionVisible(true), 80);
        return () => {
            clearTimeout(t);
            stopTimer();
        };
    }, [currentIndex]);

    // ── Socket setup ──────────────────────────────────────────────────────────

    useEffect(() => {
        function handleConnect() {
            const playerId = localStorage.getItem("playerId");
            if (!playerId) return;
            console.log("[socket] (re)conectado — emitindo join_room, socket id:", socket.id);
            socket.emit("join_room", {
                roomCode: code,
                playerId,
                isHost: currentPlayer?.isHost ?? false,
            });
        }

        if (!socket.connected) {
            socket.connect();
        } else {
            handleConnect();
        }

        socket.on("connect", handleConnect);

        function handleAnswerResult(data: {
            correctOptionId: string;
            players: Player[];
        }) {
            stopTimer();
            setCorrectOptionId(data.correctOptionId);
            setPlayers(data.players);
            setPhase("result");
        }

        function handleNextQuestion(data: { index: number }) {
            if (data.index < questions.length) {
                setCurrentIndex(data.index);
            } else {
                router.push(`/room/${code}/finish`);
            }
        }

        function handleTimeExpired(data: {
            correctOptionId: string;
            players: Player[];
        }) {
            setCorrectOptionId(data.correctOptionId);
            setPlayers(data.players);
            setPhase("result");
        }

        function handleVoteUpdate(data: {
            questionId: string;
            counts: Record<string, number>;
            answeredList: AnsweredEntry[];
            isChangingVote: boolean;
            latestVote: {
                playerId: string;
                playerName: string;
                optionId: string;
                isNew: boolean;
            };
        }) {
            setVoteCounts(data.counts);
            setAnsweredList(data.answeredList);

            setNewEntryId(data.latestVote.playerId);

            setCountBump(true);
            if (bumpTimerRef.current) clearTimeout(bumpTimerRef.current);
            bumpTimerRef.current = setTimeout(() => setCountBump(false), 400);

            if (newEntryTimerRef.current) clearTimeout(newEntryTimerRef.current);
            newEntryTimerRef.current = setTimeout(() => setNewEntryId(null), 800);
        }

        // ── NOVO: redireciona todos quando o host encerra o jogo ──────────────
        function handleGameFinished() {
            router.push(`/room/${code}/finish`);
        }

        socket.on("answer_result", handleAnswerResult);
        socket.on("next_question", handleNextQuestion);
        socket.on("time_expired_result", handleTimeExpired);
        socket.on("vote_update", handleVoteUpdate);
        socket.on("game_finished", handleGameFinished);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("answer_result", handleAnswerResult);
            socket.off("next_question", handleNextQuestion);
            socket.off("time_expired_result", handleTimeExpired);
            socket.off("vote_update", handleVoteUpdate);
            socket.off("game_finished", handleGameFinished);
            if (newEntryTimerRef.current) clearTimeout(newEntryTimerRef.current);
            if (bumpTimerRef.current) clearTimeout(bumpTimerRef.current);
        };
    }, [code, questions.length, router, stopTimer]);

    // ── Handlers (apenas guests) ──────────────────────────────────────────────

    function handleSelectOption(optionId: string) {
        if (isHost) return;
        if (phase !== "answering") return;
        if (selectedOptionId === optionId) return;

        setSelectedOptionId(optionId);

        const payload = {
            questionId: question.id,
            optionId,
            timeLeft,
            playerName: currentPlayer?.name ?? currentPlayerId,
        };
        console.log("[submit_answer] enviando →", payload);
        socket.emit("submit_answer", payload);
    }

    function handleNextQuestion() {
        const nextIndex = currentIndex + 1;
        socket.emit("next_question", { roomCode: code, index: nextIndex });
    }

    function handleFinishGame() {
        socket.emit("finish_game", { roomCode: code });
        router.push(`/room/${code}/finish`);
    }

    // ── Option appearance (apenas para guests) ────────────────────────────────

    function getOptionState(optId: string) {
        if (phase === "result" && correctOptionId) {
            if (optId === correctOptionId) return "correct";
            if (optId === selectedOptionId) return "wrong";
            return "dim";
        }
        if (optId === selectedOptionId) return "selected";
        return "idle";
    }

    const totalVotesReceived = Object.values(voteCounts).reduce((a, b) => a + b, 0);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <style>{`
                @keyframes popIn {
                    0%   { transform: scale(0.4); opacity: 0; }
                    70%  { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes ping {
                    0%   { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes bumpScale {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(1.35); }
                    100% { transform: scale(1); }
                }
                .bump { animation: bumpScale 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            `}</style>

            {/* BG */}
            <div className="fixed inset-0 bg-[#080810] -z-10" />
            <div
                aria-hidden
                className="fixed inset-0 -z-10 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }}
            />
            <div
                aria-hidden
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] -z-10 pointer-events-none opacity-10"
                style={{
                    background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="min-h-screen flex flex-col">

                {/* ── Header ── */}
                <header className="border-b border-zinc-800/60 bg-[#080810]/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-3 gap-4">

                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-bold text-zinc-500 shrink-0">
                                {currentIndex + 1}
                                <span className="text-zinc-700">/{questions.length}</span>
                            </span>
                            <div className="w-32 sm:w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <span
                            className="text-sm font-black tracking-widest text-zinc-600"
                            style={{ fontFamily: "var(--font-syne, monospace)" }}
                        >
                            {code}
                        </span>

                        {isHost ? (
                            <div className="flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 shrink-0">
                                <svg className="size-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v1H7v-1z" />
                                </svg>
                                <span className="text-xs font-black text-purple-300">Host</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 shrink-0">
                                <svg className="size-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span className="text-xs font-black text-indigo-300 tabular-nums">
                                    {currentPlayer?.score ?? 0} pts
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Body ── */}
                {phase !== "result" ? (
                    <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 flex flex-col gap-8">

                        <div className={`transition-all duration-500 ${questionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm px-6 sm:px-8 py-6 flex flex-col gap-4">
                                <div className="flex items-start gap-5">
                                    <TimerRing current={timeLeft} total={timePerQuestion} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                                            Pergunta {currentIndex + 1}
                                        </p>
                                        <h1 className="text-base sm:text-xl font-bold text-white leading-snug">
                                            {question.title}
                                        </h1>
                                    </div>
                                    {isHost && phase === "answering" && (
                                        <div className="shrink-0 flex flex-col items-center gap-0.5">
                                            <span
                                                key={totalVotesReceived}
                                                className={`text-2xl font-black text-white tabular-nums ${countBump ? "bump" : ""}`}
                                            >
                                                {totalVotesReceived}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                                /{guestPlayers.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isHost && phase === "answering" && answeredList.length > 0 && (
                                    <div className="border-t border-zinc-800/60 pt-3">
                                        <AnsweredPlayersList
                                            answeredList={answeredList}
                                            options={question.options}
                                            newEntryId={newEntryId}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {isHost ? (
                            <HostOptionViewer
                                options={question.options}
                                voteCounts={voteCounts}
                                totalPlayers={guestPlayers.length}
                                phase={phase}
                                correctOptionId={correctOptionId}
                                answeredList={answeredList}
                                newEntryId={newEntryId}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {question.options.map((opt, i) => {
                                    const state = getOptionState(opt.id);
                                    const color = OPTION_COLORS_INTERACTIVE[i % OPTION_COLORS_INTERACTIVE.length];
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectOption(opt.id)}
                                            disabled={phase !== "answering"}
                                            className={`
                                                relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left
                                                bg-gradient-to-br transition-all duration-300 disabled:cursor-default
                                                ${state === "correct" ? "border-emerald-500/60 from-emerald-500/20 to-emerald-600/10 text-emerald-200 scale-[1.02] shadow-[0_0_24px_rgba(52,211,153,.2)]"
                                                    : state === "wrong" ? "border-red-500/40 from-red-500/15 to-red-600/5 text-red-300 opacity-70"
                                                        : state === "selected" ? "border-indigo-400/60 from-indigo-500/25 to-indigo-600/10 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,.2)]"
                                                            : state === "dim" ? "border-zinc-800/40 from-zinc-900/40 to-zinc-900/20 text-zinc-600 opacity-40"
                                                                : `${color.base} bg-gradient-to-br active:scale-[.98]`}
                                            `}
                                            style={{ animationDelay: `${i * 80 + 200}ms` }}
                                        >
                                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors
                                                ${state === "correct" ? "bg-emerald-500/30 text-emerald-300"
                                                    : state === "wrong" ? "bg-red-500/20 text-red-400"
                                                        : state === "selected" ? "bg-indigo-500/30 text-indigo-300"
                                                            : state === "dim" ? "bg-zinc-800 text-zinc-600"
                                                                : color.label}`}
                                            >
                                                {OPTION_LABELS[i]}
                                            </span>
                                            <span className="flex-1 text-sm font-semibold leading-snug">{opt.title}</span>
                                            {state === "correct" && <svg className="size-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                                            {state === "wrong" && <svg className="size-5 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>}
                                            {state === "selected" && <svg className="size-5 shrink-0 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!isHost && selectedOptionId && phase === "answering" && (
                            <div className="flex items-center justify-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/8 px-6 py-4">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} className="size-1.5 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                </div>
                                <p className="text-sm text-indigo-300 font-medium">Resposta enviada — você ainda pode trocar!</p>
                            </div>
                        )}
                    </main>
                ) : (
                    <main className="flex-1 w-full animate-in fade-in duration-500">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6 h-full">

                            {/* ── Coluna esquerda: alternativas ── */}
                            <div className="flex flex-col gap-4 lg:w-[44%] shrink-0">

                                <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 px-5 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                                        Pergunta {currentIndex + 1}
                                    </p>
                                    <p className="text-base font-bold text-white leading-snug">
                                        {question.title}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    {question.options.map((opt, i) => {
                                        const isCorrect = opt.id === correctOptionId;
                                        const wasSelected = opt.id === selectedOptionId;
                                        const color = OPTION_COLORS[i % OPTION_COLORS.length];

                                        return (
                                            <div
                                                key={opt.id}
                                                className={`
                                                    flex items-center gap-4 rounded-2xl border px-5 py-4
                                                    bg-linear-to-br transition-all duration-500
                                                    ${isCorrect
                                                        ? "border-emerald-500/60 from-emerald-500/20 to-emerald-600/10 text-emerald-200 shadow-[0_0_28px_rgba(52,211,153,.18)]"
                                                        : wasSelected && !isCorrect
                                                            ? "border-red-500/30 from-red-500/10 to-red-600/5 text-red-300 opacity-60"
                                                            : `${color.base} opacity-50`
                                                    }
                                                `}
                                                style={{ animationDelay: `${i * 80}ms` }}
                                            >
                                                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black
                                                    ${isCorrect ? "bg-emerald-500/30 text-emerald-300"
                                                        : wasSelected ? "bg-red-500/20 text-red-400"
                                                            : color.label}`}
                                                >
                                                    {OPTION_LABELS[i]}
                                                </span>
                                                <span className="flex-1 text-sm font-semibold leading-snug">{opt.title}</span>
                                                {isCorrect && (
                                                    <svg className="size-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                )}
                                                {wasSelected && !isCorrect && (
                                                    <svg className="size-5 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {!isHost && (
                                    <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5
                                        ${!selectedOptionId ? "border-zinc-700/40 bg-zinc-900/50"
                                            : selectedOptionId === correctOptionId ? "border-emerald-500/30 bg-emerald-500/10"
                                                : "border-red-500/25 bg-red-500/8"}`}
                                    >
                                        <div className={`flex size-9 items-center justify-center rounded-xl shrink-0
                                            ${!selectedOptionId ? "bg-zinc-800"
                                                : selectedOptionId === correctOptionId ? "bg-emerald-500/20"
                                                    : "bg-red-500/15"}`}
                                        >
                                            {!selectedOptionId
                                                ? <svg className="size-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                : selectedOptionId === correctOptionId
                                                    ? <svg className="size-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                                    : <svg className="size-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                            }
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold
                                                ${!selectedOptionId ? "text-zinc-300"
                                                    : selectedOptionId === correctOptionId ? "text-emerald-300"
                                                        : "text-red-300"}`}
                                            >
                                                {!selectedOptionId ? "Tempo esgotado"
                                                    : selectedOptionId === correctOptionId ? "Resposta correta! 🎉"
                                                        : "Resposta errada"}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {!selectedOptionId ? "Você não respondeu a tempo"
                                                    : selectedOptionId === correctOptionId ? `+Colocar pontos aqui`
                                                        : "Não foi dessa vez"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Coluna direita: placar + ações ── */}
                            <div className="flex flex-col gap-4 flex-1 min-h-0">

                                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 text-center">
                                    Placar
                                </p>

                                <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                                    {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                                        <div
                                            key={p.id}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all
                                                ${p.id === currentPlayerId
                                                    ? "border-indigo-500/40 bg-indigo-500/10"
                                                    : "border-zinc-800/60 bg-zinc-900/60"}`}
                                            style={{ animationDelay: `${i * 60}ms` }}
                                        >
                                            <span className={`text-sm font-black w-6 shrink-0 tabular-nums
                                                ${i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-zinc-600"}`}>
                                                #{i + 1}
                                            </span>
                                            <span className={`size-8 rounded-full ${getAvatarColor(p.name)} flex items-center justify-center text-sm font-black text-white shrink-0`}>
                                                {p.name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="flex-1 text-sm font-semibold text-white truncate">{p.name}</span>
                                            {p.answeredCorrectly !== undefined && (
                                                p.answeredCorrectly
                                                    ? <svg className="size-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                                    : <svg className="size-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                            )}
                                            <span className="text-sm font-black text-indigo-400 tabular-nums shrink-0">{p.score} pts</span>
                                        </div>
                                    ))}
                                </div>

                                {isHost ? (
                                    <button
                                        onClick={isLastQuestion ? handleFinishGame : handleNextQuestion}
                                        className="
                                            group relative flex items-center justify-center gap-3 overflow-hidden
                                            rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600
                                            px-8 py-4 text-sm font-black text-white w-full
                                            shadow-[0_0_32px_rgba(99,102,241,.35)]
                                            hover:shadow-[0_0_48px_rgba(99,102,241,.55)]
                                            hover:from-indigo-400 hover:to-purple-500
                                            active:scale-[.97] transition-all duration-300
                                        "
                                    >
                                        {isLastQuestion ? (
                                            <>
                                                <Trophy />
                                                Ver resultado final
                                            </>
                                        ) : (
                                            <>
                                                Próxima pergunta
                                                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                            </>
                                        )}
                                        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-6 py-4">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <span key={i} className="size-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium">Aguardando o host avançar...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                )}
            </div>
        </>
    );
}