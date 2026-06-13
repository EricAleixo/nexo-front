"use client";

interface StartGameButtonProps {
  canStart: boolean;
  starting: boolean;
  questionCount: number;
  onClick: () => void;
}

export function StartGameButton({
  canStart,
  starting,
  questionCount,
  onClick,
}: StartGameButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onClick}
        disabled={!canStart || starting}
        aria-busy={starting}
        className={[
          "group relative flex w-full items-center justify-center gap-2.5",
          "overflow-hidden rounded-xl py-4 text-sm font-bold text-white transition-all duration-200",
          "active:scale-[.98] disabled:cursor-not-allowed",
          canStart && !starting
            ? "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-blue-200 hover:shadow-md"
            : "bg-gray-200 text-gray-400",
        ].join(" ")}
      >
        {starting ? (
          <>
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
            Iniciando...
          </>
        ) : (
          <>
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
            </svg>
            Iniciar Partida
          </>
        )}
      </button>

      {questionCount === 0 && (
        <p className="text-center text-xs text-gray-400">
          Adicione perguntas para habilitar o início
        </p>
      )}
    </div>
  );
}

// ─── Waiting card (guest view) ────────────────────────────────────────────────

interface WaitingCardProps {
  hostName?: string;
}

export function WaitingCard({ hostName }: WaitingCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50">
        <svg className="size-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">Aguardando o host</p>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
          O quiz vai começar assim que{" "}
          <span className="font-semibold text-gray-600">{hostName ?? "o host"}</span>{" "}
          iniciar a partida
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-blue-400"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}