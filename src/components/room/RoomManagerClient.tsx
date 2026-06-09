"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { questionService } from "@/src/services/question.service";
import { AddQuestionModal } from "../modals/AddQuestionModal";
import Link from "next/link";


// ─── Types ─────────────────────────────────────────────────────────────────

type RoomStatus = "waiting" | "started" | "finished";

interface Room {
    id: string;
    code: string;
    status: RoomStatus;
    currentQuestion: number;
    createdAt: string;
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

interface Option {
    id: string;
    title: string;
    isCorrect: boolean;
}

interface Props {
    room: Room;
    initialQuestions: Question[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"];

const STATUS_CONFIG: Record<
    RoomStatus,
    { label: string; color: string; bg: string; border: string; dot: string; glow: string }
> = {
    waiting: {
        label: "Aguardando",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/25",
        dot: "bg-amber-400",
        glow: "shadow-[0_0_6px_rgba(251,191,36,.8)]",
    },
    started: {
        label: "Em andamento",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/25",
        dot: "bg-emerald-400",
        glow: "shadow-[0_0_6px_rgba(52,211,153,.8)]",
    },
    finished: {
        label: "Finalizada",
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/25",
        dot: "bg-zinc-500",
        glow: "",
    },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Toast({
    toasts,
    onDismiss,
}: {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}) {
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
                        <svg
                            className="size-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                            />
                        </svg>
                    )}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

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
    const [deleting, setDeleting] = useState(false);

    async function loadOptions() {
        if (options.length > 0) return;
        setLoadingOptions(true);
        try {
            const data = await questionService.findOptionsByQuestionId(question.id);
            setOptions(data);
        } catch {
            /* silencia */
        } finally {
            setLoadingOptions(false);
        }
    }

    function handleToggle() {
        if (!expanded) loadOptions();
        setExpanded((v) => !v);
    }

    async function handleDelete() {
        setDeleting(true);
        await onDelete(question.id);
        setDeleting(false);
    }

    return (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden transition-colors hover:border-zinc-700/80">
            <div className="flex items-center gap-3 px-4 py-3.5 group">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-bold text-indigo-400">
                    {index + 1}
                </span>

                <p className="flex-1 text-sm text-zinc-300 leading-snug">{question.title}</p>

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

                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    title="Remover questão"
                    className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                >
                    {deleting ? (
                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle
                                cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="3"
                                strokeDasharray="31.4" strokeDashoffset="10"
                                strokeLinecap="round"
                            />
                        </svg>
                    ) : (
                        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
            </div>

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
                                <span
                                    className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold
                    ${opt.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}
                                >
                                    {OPTION_LABELS[i] ?? i + 1}
                                </span>
                                <span className="flex-1 leading-snug">{opt.title}</span>
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

function StatusBadge({ status }: { status: RoomStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <div className={`flex items-center gap-2 rounded-full border ${cfg.border} ${cfg.bg} px-3 py-1.5`}>
            <span className={`size-1.5 rounded-full ${cfg.dot} ${cfg.glow} ${status !== "finished" ? "animate-pulse" : ""}`} />
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
    );
}

function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    confirmClass,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmClass: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{description}</p>
                <div className="mt-5 flex gap-2.5">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Client ────────────────────────────────────────────────────────────

export function RoomManagerClient({ room: initialRoom, initialQuestions }: Props) {
    const router = useRouter();

    const [room, setRoom] = useState<Room>(initialRoom);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [modalOpen, setModalOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [statusLoading, setStatusLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        status: RoomStatus | null;
    }>({ open: false, status: null });

    // ── Toast ────────────────────────────────────────────────────────────────

    const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Status ───────────────────────────────────────────────────────────────

    function requestStatusChange(status: RoomStatus) {
        setConfirmDialog({ open: true, status });
    }

    async function confirmStatusChange() {
        if (!confirmDialog.status) return;
        const nextStatus = confirmDialog.status;
        setConfirmDialog({ open: false, status: null });
        setStatusLoading(true);

        try {
            const res = await fetch(
                `http://192.168.0.5:3000/rooms/${room.code}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: nextStatus }),
                }
            );
            console.log(res)
            if (!res.ok) throw new Error();
            const updated: Room = await res.json();
            setRoom(updated);
            addToast("Status atualizado com sucesso!", "success");
        } catch (e) {
            addToast("Erro ao atualizar status.", "error");
        } finally {
            setStatusLoading(false);
        }
    }

    // ── Questions ────────────────────────────────────────────────────────────

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

    // ── Copy code ────────────────────────────────────────────────────────────

    async function handleCopyCode() {
        try {
            await navigator.clipboard.writeText(room.code);
            addToast("Código copiado!", "success");
        } catch {
            addToast("Não foi possível copiar.", "error");
        }
    }

    // ── Dialog config ────────────────────────────────────────────────────────

    const dialogConfig: Record<
        RoomStatus,
        { title: string; description: string; confirmLabel: string; confirmClass: string }
    > = {
        waiting: {
            title: "Voltar para Aguardando?",
            description: "A sala voltará ao estado de espera. Jogadores poderão entrar novamente.",
            confirmLabel: "Confirmar",
            confirmClass: "bg-amber-500 hover:bg-amber-400",
        },
        started: {
            title: "Iniciar a partida?",
            description: "A partida será marcada como em andamento. Os jogadores no lobby serão redirecionados.",
            confirmLabel: "Iniciar",
            confirmClass: "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500",
        },
        finished: {
            title: "Finalizar a sala?",
            description: "A sala será encerrada. Essa ação não pode ser desfeita facilmente.",
            confirmLabel: "Finalizar",
            confirmClass: "bg-red-600 hover:bg-red-500",
        },
    };

    const activeDialog =
        confirmDialog.status ? dialogConfig[confirmDialog.status] : null;

    const statusActions: { status: RoomStatus; label: string; icon: React.ReactNode }[] = [
        {
            status: "waiting",
            label: "Aguardando",
            icon: (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            status: "started",
            label: "Em andamento",
            icon: (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                </svg>
            ),
        },
        {
            status: "finished",
            label: "Finalizada",
            icon: (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                </svg>
            ),
        },
    ];

    // ─── Render ──────────────────────────────────────────────────────────────

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

                        {/* Code */}
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                                Código da sala
                            </span>
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="text-2xl sm:text-3xl font-black tracking-widest text-white"
                                    style={{ fontFamily: "var(--font-syne)" }}
                                >
                                    {room.code}
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

                        <StatusBadge status={room.status} />
                    </div>
                </header>

                {/* ── Body ── */}
                <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 sm:px-6 py-8 lg:flex-row lg:items-start">

                    {/* ── Left: Questions ── */}
                    <section className="flex-1 flex flex-col gap-4 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-white">Perguntas</h2>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                    {questions.length === 0
                                        ? "Nenhuma adicionada"
                                        : `${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"} cadastradas`}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/8"
                            >
                                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Adicionar
                            </button>
                        </div>

                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-6 py-12 text-center">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <svg className="size-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Nenhuma pergunta ainda</p>
                                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-52">
                                        Adicione perguntas para montar o quiz desta sala
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/25 hover:text-indigo-200"
                                >
                                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Adicionar primeira pergunta
                                </button>
                            </div>
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
                    </section>

                    {/* ── Right: Control panel ── */}
                    <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">

                        {/* Room info */}
                        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 backdrop-blur-sm flex flex-col gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                Informações
                            </h3>
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">ID da sala</span>
                                    <span className="text-xs font-mono text-zinc-400 truncate max-w-40" title={room.id}>
                                        {room.id.slice(0, 8)}…
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">Criada em</span>
                                    <span className="text-xs text-zinc-400">{formatDate(room.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">Questão atual</span>
                                    <span className="text-xs font-semibold text-indigo-400">
                                        {room.currentQuestion ?? 0} / {questions.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">Status</span>
                                    <StatusBadge status={room.status} />
                                </div>
                            </div>
                        </div>

                        {/* Status control */}
                        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 backdrop-blur-sm flex flex-col gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                Controle de status
                            </h3>
                            <div className="flex flex-col gap-2">
                                {statusActions.map(({ status, label, icon }) => {
                                    const isActive = room.status === status;
                                    const cfg = STATUS_CONFIG[status];
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => !isActive && requestStatusChange(status)}
                                            disabled={isActive || statusLoading}
                                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all
                        ${isActive
                                                    ? `${cfg.border} ${cfg.bg} ${cfg.color} cursor-default`
                                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-40 disabled:cursor-not-allowed"
                                                }`}
                                        >
                                            <span className={isActive ? cfg.color : "text-zinc-600"}>{icon}</span>
                                            {label}
                                            {isActive && (
                                                <span className="ml-auto">
                                                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                            )}
                                            {statusLoading && !isActive && (
                                                <svg className="ml-auto size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Go to Lobby */}
                        <Link
                            href={`/room/${room.code}/lobby`}
                            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-500/10 py-4 text-sm font-bold text-indigo-300 transition-all duration-300 hover:border-indigo-500/60 hover:bg-indigo-500/20 hover:text-indigo-200 active:scale-[.97]"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Ir para o Lobby
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                            />
                        </Link>

                        {/* Quick tips */}
                        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-4 flex flex-col gap-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Dicas</p>
                            {[
                                "Adicione perguntas antes de iniciar a partida",
                                "Mude o status para 'Em andamento' para iniciar o jogo",
                                "Use o lobby para ver jogadores conectados",
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
                </main>
            </div>

            <Toast toasts={toasts} onDismiss={dismissToast} />

            <AddQuestionModal
                open={modalOpen}
                roomId={room.id}
                nextOrder={questions.length + 1}
                onClose={() => setModalOpen(false)}
                onQuestionAdded={handleQuestionAdded}
            />

            {activeDialog && (
                <ConfirmDialog
                    open={confirmDialog.open}
                    title={activeDialog.title}
                    description={activeDialog.description}
                    confirmLabel={activeDialog.confirmLabel}
                    confirmClass={activeDialog.confirmClass}
                    onConfirm={confirmStatusChange}
                    onCancel={() => setConfirmDialog({ open: false, status: null })}
                />
            )}
        </>
    );
}