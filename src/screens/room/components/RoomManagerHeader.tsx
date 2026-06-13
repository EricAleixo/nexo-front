"use client";

import { Room, STATUS_CONFIG } from "@/src/types/types";
import { useRouter } from "next/navigation";

interface Props {
  room: Room;
  onCopyCode: () => void;
}

export function RoomManagerHeader({ room, onCopyCode }: Props) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[room.status];

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-6 py-3.5">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Início
          </button>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
              <svg className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900">StudyHub</span>
          </div>
        </div>

        {/* Center: code */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-400">Código da sala</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black tracking-widest text-blue-600">
              {room.code}
            </span>
            <button
              onClick={onCopyCode}
              title="Copiar código"
              className="flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
            >
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: status badge */}
        <div className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${cfg.borderColor} ${cfg.bgColor}`}>
          <span className={`size-1.5 rounded-full ${cfg.dotColor}`} />
          <span className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</span>
        </div>
      </div>
    </header>
  );
}