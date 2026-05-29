"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function Modal({ open, onClose, children, title, subtitle }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-1111111111111111111 w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111118] p-8 shadow-2xl"
        style={{
          boxShadow: "0 0 60px rgba(99,102,241,.15), 0 30px 60px rgba(0,0,0,.6)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Fechar"
        >
          <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-7">
          <h2
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}