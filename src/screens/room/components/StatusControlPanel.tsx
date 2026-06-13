"use client";

import { RoomStatus, STATUS_CONFIG } from "@/src/types/types";


interface Props {
  currentStatus: RoomStatus;
  loading: boolean;
  onRequestChange: (status: RoomStatus) => void;
}

const STATUS_ACTIONS: { status: RoomStatus; label: string; icon: React.ReactNode }[] = [
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

export function StatusControlPanel({ currentStatus, loading, onRequestChange }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
          <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900">Controle de status</h3>
      </div>

      <div className="flex flex-col gap-2">
        {STATUS_ACTIONS.map(({ status, label, icon }) => {
          const isActive = currentStatus === status;
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => !isActive && onRequestChange(status)}
              disabled={isActive || loading}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? `${cfg.borderColor} ${cfg.bgColor} ${cfg.textColor} cursor-default`
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40",
              ].join(" ")}
            >
              <span className={isActive ? cfg.textColor : "text-gray-400"}>{icon}</span>
              {label}
              <span className="ml-auto">
                {isActive && (
                  <svg className={`size-4 ${cfg.textColor}`} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
                {loading && !isActive && (
                  <svg className="size-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}