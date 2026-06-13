"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "../ui/Modal";
import {
  modalCharCountClass,
  modalErrorClass,
  modalHintClass,
  modalInputClass,
  modalLabelClass,
  modalPrimaryButtonClass,
} from "../ui/modalStyles";
import {
  BookOpen,
  FlaskConical,
  Globe,
  Calculator,
  Palette,
  Music,
  Dumbbell,
  Cpu,
  Landmark,
  Languages,
  Leaf,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { Subject } from "@/src/types/types";
import { subjectService } from "@/src/services/subject.service";


type Status = "idle" | "loading" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_NAME_LENGTH = 28;

export const ICON_OPTIONS: Record<string, LucideIcon> = {
  BookOpen,
  FlaskConical,
  Globe,
  Calculator,
  Palette,
  Music,
  Dumbbell,
  Cpu,
  Landmark,
  Languages,
  Leaf,
  HeartPulse,
};

export const COLOR_OPTIONS = [
  { label: "Azul", value: "#3B82F6" },
  { label: "Roxo", value: "#8B5CF6" },
  { label: "Verde", value: "#10B981" },
  { label: "Âmbar", value: "#F59E0B" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Laranja", value: "#F97316" },
  { label: "Ciano", value: "#06B6D4" },
  { label: "Vermelho", value: "#EF4444" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (subject: Subject) => void;
}

export function AddSubjectModal({ open, onClose, onCreated }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("BookOpen");
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0].value);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
    setName("");
    setIcon("BookOpen");
    setColor(COLOR_OPTIONS[0].value);
    setStatus("idle");
    setErrorMsg("");
  }, [open]);

  const isDisabled = status === "loading" || name.trim().length === 0;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const subject = await subjectService.create({
        name: trimmed,
        icon: icon,
        color: color
      })

      onCreated(subject);
      onClose();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível criar a disciplina."
      );
    }
  }

  const SelectedIcon = ICON_OPTIONS[icon];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Disciplina"
      subtitle="Escolha um ícone, cor e nome para a disciplina."
    >
      <div className="flex flex-col gap-6">

        {/* Preview */}
        <div className="flex items-center justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-200"
            style={{ background: color + "22", color }}
          >
            <SelectedIcon size={28} strokeWidth={1.8} />
          </div>
        </div>

        {/* Nome */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subject-name" className={modalLabelClass}>
            Nome da disciplina
          </label>
          <div className="relative">
            <input
              ref={nameRef}
              id="subject-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, MAX_NAME_LENGTH));
                if (status === "error") setStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
              placeholder="Ex: Matemática"
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={status === "error"}
              className={[modalInputClass(status === "error"), "pr-14"].join(" ")}
            />
            <span
              aria-hidden="true"
              className={modalCharCountClass(name.length >= MAX_NAME_LENGTH)}
            >
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Cor */}
        <div className="flex flex-col gap-2">
          <span className={modalLabelClass}>Cor</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                aria-label={c.label}
                onClick={() => setColor(c.value)}
                className={[
                  "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  color === c.value
                    ? "border-white scale-110 shadow-md"
                    : "border-transparent",
                ].join(" ")}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div className="flex flex-col gap-2">
          <span className={modalLabelClass}>Ícone</span>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(ICON_OPTIONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
                className={[
                  "flex h-10 w-full items-center justify-center rounded-xl border transition-all focus:outline-none focus-visible:ring-2",
                  icon === key
                    ? "shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:border-zinc-300",
                ].join(" ")}
                style={
                  icon === key
                    ? { background: color + "18", color, borderColor: color + "44" }
                    : undefined
                }
              >
                <Icon size={16} strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>

        {/* Erro */}
        {status === "error" && (
          <p role="alert" className={modalErrorClass}>
            <svg
              aria-hidden="true"
              className="size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            {errorMsg}
          </p>
        )}

        {/* Botão */}
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isDisabled}
          aria-busy={status === "loading"}
          className={modalPrimaryButtonClass(status === "loading")}
        >
          {status === "loading" ? (
            <>
              <svg
                aria-hidden="true"
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                  strokeLinecap="round"
                />
              </svg>
              Criando...
            </>
          ) : (
            <>
              <SelectedIcon size={16} strokeWidth={2.5} />
              Criar Disciplina
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}