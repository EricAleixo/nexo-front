"use client";

import { useState } from "react";
import { questionService } from "@/src/services/question.service";
import { Question, Option } from "@/src/types/types";

const OPTION_LABELS = ["A", "B", "C", "D"];

interface QuestionsSectionProps {
  questions: Question[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (question: Question) => void;
}

export function QuestionsSection({ questions, onAdd, onDelete, onEdit }: QuestionsSectionProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Perguntas</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {questions.length === 0
              ? "Nenhuma adicionada"
              : `${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"} cadastradas`}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-95"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar pergunta
        </button>
      </div>

      {questions.length === 0 ? (
        <EmptyQuestions onAdd={onAdd} />
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <QuestionItem key={q.id} question={q} index={i} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyQuestions({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50">
        <svg className="size-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">Nenhuma pergunta ainda</p>
        <p className="mt-1 max-w-52 text-xs leading-relaxed text-gray-400">
          Adicione perguntas para montar o quiz desta sala
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar primeira pergunta
      </button>
    </div>
  );
}

const QUESTION_TYPES = ["Única escolha", "Múltipla escolha", "Verdadeiro ou Falso"];

function QuestionItem({
  question,
  index,
  onDelete,
  onEdit,
}: {
  question: Question;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (q: Question) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [questionType] = useState(QUESTION_TYPES[0]);

  async function loadOptions() {
    if (options.length > 0) return;
    setLoadingOptions(true);
    try {
      const data = await questionService.findOptionsByQuestionId(question.id);
      setOptions(data);
    } catch { /* silencia */ }
    finally { setLoadingOptions(false); }
  }

  function handleToggle() {
    if (!expanded) void loadOptions();
    setExpanded(v => !v);
  }

  async function handleDelete() {
    setDeleting(true);
    setMenuOpen(false);
    await onDelete(question.id);
    setDeleting(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-gray-800">{question.title}</p>

        {/* Type selector */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex">
          <span className="text-xs font-medium text-gray-500">{questionType}</span>
          <svg className="size-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expand */}
        <button
          onClick={handleToggle}
          className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => { onEdit(question); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  {deleting ? (
                    <svg className="size-4 animate-spin text-red-400" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  )}
                  Remover
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded alternatives */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Alternativas</p>
          {loadingOptions ? (
            <div className="flex items-center gap-2 py-2">
              <svg className="size-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              <span className="text-xs text-gray-400">Carregando alternativas...</span>
            </div>
          ) : options.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhuma alternativa cadastrada.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div
                  key={opt.id}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                    opt.isCorrect
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-gray-100 bg-gray-50",
                  ].join(" ")}
                >
                  <span className={[
                    "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    opt.isCorrect ? "bg-emerald-500 text-white" : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-200",
                  ].join(" ")}>
                    {OPTION_LABELS[i] ?? i + 1}
                  </span>
                  <span className={["flex-1", opt.isCorrect ? "font-medium text-emerald-800" : "text-gray-700"].join(" ")}>
                    {opt.title}
                  </span>
                  <div className={[
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white",
                  ].join(" ")}>
                    {opt.isCorrect && (
                      <svg className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}