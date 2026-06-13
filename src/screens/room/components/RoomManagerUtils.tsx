"use client";

import { ToastItem } from "@/src/types/types";


// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({
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
          className={[
            "flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3",
            "animate-in fade-in slide-in-from-bottom-2 text-sm font-semibold",
            "shadow-2xl backdrop-blur-md transition-all duration-300",
            t.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : t.type === "error"
              ? "border-red-500/30 bg-red-500/15 text-red-300"
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

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
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