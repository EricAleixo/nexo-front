"use client";

interface RoomInfoBarProps {
  roomName: string;
  code: string;
  isPublic?: boolean;
  playerCount: number;
  maxPlayers?: number;
  timePerQuestion?: number;
  questionCount: number;
  onCopyCode: () => void;
}

export function RoomInfoBar({
  roomName,
  code,
  isPublic = true,
  playerCount,
  maxPlayers = 30,
  timePerQuestion = 10,
  questionCount,
  onCopyCode,
}: RoomInfoBarProps) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Thumbnail */}
      <div className="flex size-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
        <svg className="size-14 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">{roomName}</h1>
          {isPublic && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Pública
            </span>
          )}
        </div>

        {/* Code */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Código da sala</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-lg font-black tracking-widest text-blue-600">{code}</span>
            <button
              onClick={onCopyCode}
              title="Copiar código"
              className="flex size-6 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
            >
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          <StatItem
            icon={
              <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
            value={`${playerCount} / ${maxPlayers}`}
            label="jogadores"
          />
          <div className="h-7 w-px bg-gray-200" />
          <StatItem
            icon={
              <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            value={`${timePerQuestion} min`}
            label="por pergunta"
          />
          <div className="h-7 w-px bg-gray-200" />
          <StatItem
            icon={
              <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            }
            value={String(questionCount)}
            label="perguntas"
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );
}