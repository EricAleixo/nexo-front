export type RoomStatus = "waiting" | "started" | "finished";

export interface RoomHost {
  id: string;
  name: string;
}

export interface RoomSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  currentQuestion: number;
  createdAt: string;

  host: RoomHost;

  subject: RoomSubject | null;
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // key of ICON_OPTIONS
  color: string; // hex
}

export interface Question {
  id: string;
  title: string;
  order: number;
  roomId: string;
  score: number;
}

export interface Option {
  id: string;
  title: string;
  isCorrect: boolean;
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export const STATUS_CONFIG: Record<
  RoomStatus,
  {
    label: string;
    // nomes completos (usados pelos componentes novos)
    textColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    // aliases curtos (compatibilidade com versões anteriores)
    color: string;
    bg: string;
    border: string;
    dot: string;
    glow: string;
  }
> = {
  waiting: {
    label: "Aguardando",
    textColor: "text-amber-600",  color: "text-amber-600",
    bgColor:   "bg-amber-50",     bg:    "bg-amber-50",
    borderColor: "border-amber-200", border: "border-amber-200",
    dotColor:  "bg-amber-500",    dot:   "bg-amber-500",
    glow: "",
  },
  started: {
    label: "Em andamento",
    textColor: "text-emerald-600",  color: "text-emerald-600",
    bgColor:   "bg-emerald-50",     bg:    "bg-emerald-50",
    borderColor: "border-emerald-200", border: "border-emerald-200",
    dotColor:  "bg-emerald-500",    dot:   "bg-emerald-500",
    glow: "",
  },
  finished: {
    label: "Finalizada",
    textColor: "text-blue-600",  color: "text-blue-600",
    bgColor:   "bg-blue-50",     bg:    "bg-blue-50",
    borderColor: "border-blue-200", border: "border-blue-200",
    dotColor:  "bg-blue-500",    dot:   "bg-blue-500",
    glow: "",
  },
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}