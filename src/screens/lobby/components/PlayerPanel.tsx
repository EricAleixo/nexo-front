"use client";

import { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface PlayersPanelProps {
  players: Player[];
  currentPlayerId?: string;
  maxPlayers?: number;
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-emerald-600",
    "bg-violet-600",
    "bg-sky-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-orange-600",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function PlayerRow({
  player,
  isCurrentPlayer,
  index,
}: {
  player: Player;
  isCurrentPlayer: boolean;
  index: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
        isCurrentPlayer ? "bg-blue-50" : "hover:bg-gray-50",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      {/* Avatar */}
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
          getAvatarColor(player.name),
        ].join(" ")}
      >
        {getInitial(player.name)}
      </div>

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium text-gray-800">
        {player.name}
        {isCurrentPlayer && (
          <span className="ml-1 text-gray-400">(Você)</span>
        )}
      </span>

      {/* Host badge */}
      {player.isHost && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
          + Host
        </span>
      )}

      {/* Online dot */}
      <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
    </div>
  );
}

export function PlayersPanel({
  players,
  currentPlayerId,
  maxPlayers = 30,
}: PlayersPanelProps) {
  const VISIBLE_MAX = 5;
  const visiblePlayers = players.slice(0, VISIBLE_MAX);
  const remainingCount = players.length - VISIBLE_MAX;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-gray-900">Jogadores</h3>
        <span className="text-sm font-bold text-blue-600">
          {players.length} / {maxPlayers}
        </span>
      </div>

      {/* Player rows */}
      {visiblePlayers.map((p, i) => (
        <PlayerRow
          key={p.id}
          player={p}
          isCurrentPlayer={p.id === currentPlayerId}
          index={i}
        />
      ))}

      {/* Overflow */}
      {remainingCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <svg className="size-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </div>
          <span className="text-sm text-gray-400">
            Mais {remainingCount} {remainingCount === 1 ? "jogador" : "jogadores"}
          </span>
          <span className="size-2 shrink-0 rounded-full bg-gray-300" />
        </div>
      )}
    </div>
  );
}