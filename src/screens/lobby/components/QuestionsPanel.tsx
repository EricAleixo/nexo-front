"use client";

import { useState, useCallback } from "react";
import { questionService, Option } from "../../../services/question.service";

interface Question {
  id: string;
  title: string;
  order: number;
}

interface QuestionsPanelProps {
  questions: Question[];
  isHost: boolean;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: string) => void;
  onSetCorrect: (optionId: string) => Promise<void>;
}

export function QuestionsPanel({
  questions,
  isHost,
  onAddQuestion,
  onDeleteQuestion,
  onSetCorrect,
}: QuestionsPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-gray-900">Perguntas</h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white">
            {questions.length}
          </span>
        </div>
        {isHost && (
          <button
            onClick={onAddQuestion}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar pergunta
          </button>
        )}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <EmptyQuestions onAdd={onAddQuestion} isHost={isHost} />
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <QuestionItem
              key={q.id}
              question={q}
              index={i}
              isHost={isHost}
              onDelete={onDeleteQuestion}
              onSetCorrect={onSetCorrect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyQuestions({ onAdd, isHost }: { onAdd: () => void; isHost: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50">
        <svg className="size-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">Nenhuma pergunta ainda</p>
        <p className="mt-1 text-xs text-gray-400">
          {isHost ? "Adicione perguntas para começar a partida" : "O host ainda não adicionou perguntas"}
        </p>
      </div>
      {isHost && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar primeira pergunta
        </button>
      )}
    </div>
  );
}

// ─── Question item ────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const QUESTION_TYPES = ["Única escolha", "Múltipla escolha", "Verdadeiro ou Falso"] as const;

function QuestionItem({
  question,
  index,
  isHost,
  onDelete,
  onSetCorrect,
}: {
  question: Question;
  index: number;
  isHost: boolean;
  onDelete: (id: string) => void;
  onSetCorrect: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [questionType] = useState<string>(QUESTION_TYPES[0]);

  const loadOptions = useCallback(async () => {
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
  }, [question.id, options.length]);

  function handleToggle() {
    if (!expanded) void loadOptions();
    setExpanded((v) => !v);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm">
      {/* Question row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Index badge */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          {index + 1}
        </span>

        {/* Title */}
        <p className="flex-1 truncate text-sm font-medium text-gray-800">{question.title}</p>

        {/* Type badge */}
        <span className="hidden shrink-0 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 sm:block">
          {questionType}
        </span>

        {/* Points */}
        <span className="shrink-0 text-sm text-gray-400">1 ponto</span>

        {/* Expand */}
        <button
          onClick={handleToggle}
          title={expanded ? "Ocultar alternativas" : "Ver alternativas"}
          className="shrink-0 text-gray-400 transition-colors hover:text-blue-600"
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

        {/* Delete */}
        {isHost && (
          <button
            onClick={() => onDelete(question.id)}
            title="Remover pergunta"
            className="shrink-0 text-gray-300 transition-colors hover:text-red-500"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded: alternatives */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <div className="flex gap-4">
            {/* Alternatives */}
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Alternativas</p>
              {loadingOptions ? (
                <div className="flex items-center gap-2 py-2">
                  <svg className="size-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs text-gray-400">Carregando...</span>
                </div>
              ) : options.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma alternativa cadastrada.</p>
              ) : (
                options.map((opt, i) => (
                  <OptionRow
                    key={opt.id}
                    option={opt}
                    label={OPTION_LABELS[i] ?? String(i + 1)}
                    isHost={isHost}
                    onSetCorrect={async () => {
                      await onSetCorrect(opt.id);
                      setOptions((prev) =>
                        prev.map((o) => ({ ...o, isCorrect: o.id === opt.id }))
                      );
                    }}
                  />
                ))
              )}

              {isHost && (
                <button className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
                  <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar alternativa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────

function OptionRow({
  option,
  label,
  isHost,
  onSetCorrect,
}: {
  option: Option;
  label: string;
  isHost: boolean;
  onSetCorrect: () => Promise<void>;
}) {
  return (
    <div
      onClick={isHost ? onSetCorrect : undefined}
      className={[
        "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-all",
        option.isCorrect
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100",
        isHost ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      {/* Label badge */}
      <span
        className={[
          "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
          option.isCorrect
            ? "bg-emerald-500 text-white"
            : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-200",
        ].join(" ")}
      >
        {label}
      </span>
      <span className="flex-1">{option.title}</span>
      {/* Correct indicator */}
      <div className={["size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", option.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"].join(" ")}>
        {option.isCorrect && (
          <svg className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        )}
      </div>
    </div>
  );
}