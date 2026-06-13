"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

import { questionService } from "@/src/services/question.service";

import { RoomManagerHeader } from "./components/RoomManagerHeader";
import { QuestionsSection } from "./components/QuestionsSection";
import { RoomInfoPanel } from "./components/RoomInfoPanel";
import { StatusControlPanel } from "./components/StatusControlPanel";
import { Toast, ConfirmDialog } from "./components/RoomManagerUtils";
import { Question, Room, RoomStatus, ToastItem } from "@/src/types/types";
import { AddQuestionModal } from "@/src/components/modals/AddQuestionModal";
import { EditQuestionModal } from "@/src/components/modals/EditQuestionModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";

const DIALOG_CONFIG: Record<RoomStatus, { title: string; description: string; confirmLabel: string; confirmClass: string }> = {
  waiting: {
    title: "Voltar para Aguardando?",
    description: "A sala voltará ao estado de espera. Jogadores poderão entrar novamente.",
    confirmLabel: "Confirmar",
    confirmClass: "bg-amber-500 hover:bg-amber-600",
  },
  started: {
    title: "Iniciar a partida?",
    description: "A partida será marcada como em andamento. Os jogadores no lobby serão redirecionados.",
    confirmLabel: "Iniciar",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
  },
  finished: {
    title: "Finalizar a sala?",
    description: "A sala será encerrada. Essa ação não pode ser desfeita facilmente.",
    confirmLabel: "Finalizar",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
};

const TIPS = [
  "Adicione perguntas antes de iniciar a partida",
  "Mude o status para 'Em andamento' para iniciar o jogo",
  "Use o lobby para ver jogadores conectados",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  room: Room;
  initialQuestions: Question[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoomManagerClient({ room: initialRoom, initialQuestions }: Props) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; status: RoomStatus | null }>({
    open: false,
    status: null,
  });

  // ── Toast ──────────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Status ─────────────────────────────────────────────────────────────────

  function handleRequestStatusChange(status: RoomStatus) {
    setConfirmDialog({ open: true, status });
  }

  async function handleConfirmStatusChange() {
    if (!confirmDialog.status) return;
    const nextStatus = confirmDialog.status;
    setConfirmDialog({ open: false, status: null });
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_URL}/rooms/${room.code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Room = await res.json();
      setRoom(updated);
      addToast("Status atualizado com sucesso!", "success");
    } catch {
      addToast("Erro ao atualizar status.", "error");
    } finally {
      setStatusLoading(false);
    }
  }

  // ── Questions ──────────────────────────────────────────────────────────────

  function handleQuestionAdded(question: Question) {
    setQuestions(prev => [...prev, question]);
    addToast("Pergunta adicionada!", "success");
  }

  async function handleDeleteQuestion(id: string) {
    try {
      await questionService.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      addToast("Pergunta removida.", "info");
    } catch {
      addToast("Erro ao remover pergunta.", "error");
    }
  }

  function handleQuestionUpdated(updated: Question) {
    setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
    addToast("Pergunta atualizada!", "success");
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      addToast("Código copiado!", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeDialog = confirmDialog.status ? DIALOG_CONFIG[confirmDialog.status] : null;

  return (
    <>
      {/* Page background */}
      <div className="min-h-screen bg-[#F0F4FF]">
        <RoomManagerHeader room={room} onCopyCode={handleCopyCode} />

        <main className="mx-auto max-w-screen-xl px-6 py-8">
          <div className="flex gap-6 lg:items-start">

            {/* Left: questions */}
            <div className="flex min-w-0 flex-1 flex-col gap-0">
              <QuestionsSection
                questions={questions}
                onAdd={() => setModalOpen(true)}
                onDelete={handleDeleteQuestion}
                onEdit={setEditingQuestion}
              />
            </div>

            {/* Right: sidebar */}
            <aside className="flex w-80 shrink-0 flex-col gap-4">
              <RoomInfoPanel room={room} questionCount={questions.length} />

              <StatusControlPanel
                currentStatus={room.status}
                loading={statusLoading}
                onRequestChange={handleRequestStatusChange}
              />

              {/* Go to Lobby */}
              <Link
                href={`/room/${room.code}/lobby`}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-blue-200 hover:shadow-md active:scale-[.98]"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Ir para o Lobby
              </Link>

              {/* Tips */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-500">Dicas</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {TIPS.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-gray-500">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
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

      <EditQuestionModal
        open={editingQuestion !== null}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onQuestionUpdated={handleQuestionUpdated}
      />

      {activeDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          title={activeDialog.title}
          description={activeDialog.description}
          confirmLabel={activeDialog.confirmLabel}
          confirmClass={activeDialog.confirmClass}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setConfirmDialog({ open: false, status: null })}
        />
      )}
    </>
  );
}