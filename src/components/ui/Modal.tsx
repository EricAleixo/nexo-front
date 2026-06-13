"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  variant?: "light" | "dark";
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  variant = "light",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isLight = variant === "light";

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

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.button
            type="button"
            aria-label="Fechar"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className={[
              "absolute inset-0 backdrop-blur-sm",
              isLight ? "bg-slate-900/40" : "bg-black/70",
            ].join(" ")}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={[
              "relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl sm:p-8",
              isLight
                ? "border-slate-200 bg-white"
                : "border-zinc-800 bg-[#111118]",
            ].join(" ")}
            style={
              isLight
                ? undefined
                : {
                    boxShadow:
                      "0 0 60px rgba(99,102,241,.15), 0 30px 60px rgba(0,0,0,.6)",
                  }
            }
          >
            <button
              type="button"
              onClick={onClose}
              className={[
                "absolute right-4 top-4 flex size-8 items-center justify-center rounded-xl transition-colors sm:right-5 sm:top-5",
                isLight
                  ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-white",
              ].join(" ")}
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>

            <div className="mb-6 pr-8">
              <h2
                id="modal-title"
                className={[
                  "text-2xl font-bold tracking-tight",
                  isLight ? "text-slate-800" : "text-white",
                ].join(" ")}
                style={isLight ? undefined : { fontFamily: "var(--font-syne)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <div
                  className={[
                    "mt-1 text-sm",
                    isLight ? "text-slate-500" : "text-zinc-500",
                  ].join(" ")}
                >
                  {subtitle}
                </div>
              )}
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
