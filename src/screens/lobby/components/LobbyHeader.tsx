"use client";

import { useRouter } from "next/navigation";

interface LobbyHeaderProps {
  roomName: string;
  code: string;
  currentPlayerName: string;
  currentPlayerPoints?: number;
  activeTab: "lobby" | "ranking" | "configuracoes";
  onTabChange: (tab: "lobby" | "ranking" | "configuracoes") => void;
  onLeaveRoom: () => void;
}

export function LobbyHeader({
  roomName,
  code,
  currentPlayerName,
  currentPlayerPoints = 0,
  activeTab,
  onTabChange,
  onLeaveRoom,
}: LobbyHeaderProps) {
  const router = useRouter();

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  const tabs = [
    { key: "lobby", label: "Lobby" },
    { key: "ranking", label: "Ranking" },
    { key: "configuracoes", label: "Configurações" },
  ] as const;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
        {/* Left: back + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
              <svg className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900">StudyHub</span>
          </div>
        </div>

        {/* Center: tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={[
                "px-5 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right: leave + notifications + user */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
          >
            Sair da sala
          </button>
          <button className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {getInitial(currentPlayerName)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{currentPlayerName}</span>
              <span className="text-xs text-gray-400">{currentPlayerPoints.toLocaleString("pt-BR")} pts</span>
            </div>
            <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}