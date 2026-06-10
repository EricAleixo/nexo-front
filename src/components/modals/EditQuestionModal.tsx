"use client";

import { questionService } from "@/src/services/question.service";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionState {
  id?: string; // undefined = nova opção ainda não salva
  title: string;
  isCorrect: boolean;
  _deleted?: boolean; // marcada para remoção
}

interface Question {
  id: string;
  title: string;
  order: number;
  roomId: string;
  score: number;
}

interface Props {
  open: boolean;
  question: Question | null; // null = modal fechado
  onClose: () => void;
  onQuestionUpdated: (question: Question) => void;
}

// ─── Option row ───────────────────────────────────────────────────────────────

function OptionRow({
  option,
  index,
  total,
  onChange,
  onRemove,
  onToggleCorrect,
}: {
  option: OptionState;
  index: number;
  total: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  onToggleCorrect: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 group/row">
      {/* Correct toggle */}
      <button
        type="button"
        onClick={onToggleCorrect}
        title={option.isCorrect ? "Resposta correta" : "Marcar como correta"}
        className={`
          flex shrink-0 size-7 items-center justify-center rounded-lg border transition-all duration-200
          ${option.isCorrect
            ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.2)]"
            : "border-zinc-700 bg-zinc-800/50 text-zinc-600 hover:border-emerald-500/40 hover:text-emerald-500/60"
          }
        `}
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </button>

      {/* Input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={option.title}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Opção ${index + 1}`}
          maxLength={120}
          className={`
            w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder-zinc-600
            bg-zinc-900/60 outline-none transition-all duration-200 focus:ring-1
            ${option.isCorrect
              ? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/20"
              : "border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/15"
            }
          `}
        />
      </div>

      {/* Remove */}
      {total > 2 ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex shrink-0 size-7 items-center justify-center rounded-lg border border-transparent text-zinc-700 opacity-0 group-hover/row:opacity-100 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <div className="size-7 shrink-0" />
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function EditQuestionModal({ open, question, onClose, onQuestionUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [score, setScore] = useState(10);
  const [options, setOptions] = useState<OptionState[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Carregar dados da questão quando abrir
  useEffect(() => {
    if (!open || !question) return;

    setTitle(question.title);
    setError(null);
    setLoadingOptions(true);

    questionService
      .findOptionsByQuestionId(question.id)
      .then((data) => {
        setOptions(
          data.map((o) => ({
            id: o.id,
            title: o.title,
            isCorrect: o.isCorrect,
          }))
        );
        // inferir score se disponível (fallback 10)
        setScore(10);
      })
      .catch(() => setError("Não foi possível carregar as alternativas."))
      .finally(() => setLoadingOptions(false));
  }, [open, question]);

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ── Option helpers ────────────────────────────────────────────────────────

  const updateOption = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, title: value } : o)));
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => {
      const opt = prev[index];
      // Se já existe no backend, marca como deletada; senão remove direto
      if (opt.id) {
        return prev.map((o, i) => (i === index ? { ...o, _deleted: true } : o));
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const toggleCorrect = useCallback((index: number) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
  }, []);

  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, { title: "", isCorrect: false }]);
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (!title.trim()) return "Digite o enunciado da pergunta.";
    if (!score || score < 1 || score > 1000) return "A pontuação deve ser entre 1 e 1000.";
    const active = options.filter((o) => !o._deleted);
    const filled = active.filter((o) => o.title.trim());
    if (filled.length < 2) return "Preencha pelo menos 2 opções.";
    if (!active.some((o) => o.isCorrect && o.title.trim()))
      return "Marque uma opção correta preenchida.";
    return null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!question) return;
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSaving(true);

    try {
      // 1. Atualizar título da questão via PATCH
      const updatedQuestion = await questionService.update(
        question.id,
        {
          title: title.trim(),
          order: question.order,
          roomId: question.roomId,
          score,
        }
      );

      // 2. Deletar opções marcadas
      const toDelete = options.filter((o) => o._deleted && o.id);
      await Promise.all(toDelete.map((o) => questionService.deleteOption(o.id!)));

      // 3. Atualizar opções existentes que não foram deletadas
      const toUpdate = options.filter((o) => o.id && !o._deleted);
      await Promise.all(
        toUpdate.map((o) =>
          questionService.updateOption(o.id!, { title: o.title.trim(), isCorrect: o.isCorrect, questionId: question.id })
        )
      );

      // 4. Criar novas opções
      const toCreate = options.filter((o) => !o.id && !o._deleted && o.title.trim());
      await Promise.all(
        toCreate.map((o) =>
          questionService.createOption({
            title: o.title.trim(),
            isCorrect: o.isCorrect,
            questionId: question.id,
          })
        )
      );

      onQuestionUpdated(updatedQuestion);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const activeOptions = options.filter((o) => !o._deleted);
  const hasCorrect = activeOptions.some((o) => o.isCorrect && o.title.trim());
  const filledCount = activeOptions.filter((o) => o.title.trim()).length;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4
        transition-all duration-300
        ${open && visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`
          relative z-10 w-full sm:max-w-lg
          rounded-t-3xl sm:rounded-3xl
          border border-zinc-800/80 bg-[#0d0d18]/95 backdrop-blur-xl
          shadow-[0_0_80px_rgba(0,0,0,.8)]
          transition-all duration-300
          ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-[.97]"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/60">
          <div>
            <h2 className="text-base font-bold text-white">Editar pergunta</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {filledCount >= 2 && hasCorrect ? (
                <span className="text-emerald-400">Pronta para salvar</span>
              ) : (
                "Preencha o enunciado e as opções"
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-all"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          {/* Loading skeleton */}
          {loadingOptions ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-zinc-800/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Question title */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Enunciado
                </label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Qual é a capital do Brasil?"
                  maxLength={280}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/15"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-zinc-700 tabular-nums">{title.length}/280</span>
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Pontuação
                </label>
                <div className="relative flex items-center">
                  <svg
                    className="pointer-events-none absolute left-3.5 size-3.5 text-zinc-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-12 text-sm font-bold text-indigo-300 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/15"
                  />
                  <span className="pointer-events-none absolute right-3.5 text-xs text-zinc-500">pts</span>
                </div>
                <div className="flex gap-1.5">
                  {[5, 10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScore(preset)}
                      className={`
                        flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all
                        ${score === preset
                          ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        }
                      `}
                    >
                      {preset} pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                    Opções
                  </label>
                  <span className="text-[10px] text-zinc-600">
                    Clique em <span className="text-emerald-500">✓</span> para marcar a correta
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {activeOptions.map((option, i) => {
                    const realIndex = options.indexOf(option);
                    return (
                      <OptionRow
                        key={option.id ?? `new-${i}`}
                        option={option}
                        index={i}
                        total={activeOptions.length}
                        onChange={(v) => updateOption(realIndex, v)}
                        onRemove={() => removeOption(realIndex)}
                        onToggleCorrect={() => toggleCorrect(realIndex)}
                      />
                    );
                  })}
                </div>

                {activeOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-1 flex items-center gap-2 self-start rounded-lg border border-dashed border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 transition-all hover:border-indigo-500/40 hover:text-indigo-400"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar opção
                  </button>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                  <svg className="size-4 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-4 border-t border-zinc-800/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loadingOptions}
            className={`
              flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white
              transition-all duration-200 active:scale-[.97]
              ${saving || loadingOptions
                ? "bg-indigo-500/40 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,.35)] hover:shadow-[0_0_30px_rgba(99,102,241,.5)]"
              }
            `}
          >
            {saving ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}