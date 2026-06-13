"use client";

import { formatDate, Room, STATUS_CONFIG } from "@/src/types/types";


interface Props {
  room: Room;
  questionCount: number;
}

export function RoomInfoPanel({ room, questionCount }: Props) {
  const cfg = STATUS_CONFIG[room.status];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
          <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900">Informações da sala</h3>
      </div>

      <div className="flex flex-col divide-y divide-gray-100">
        <InfoRow label="Nome" value={<span className="font-medium text-gray-900 text-right">{room.name}</span>} />
        <InfoRow
          label="ID da sala"
          value={
            <span className="font-mono text-sm text-gray-600">{room.code}</span>
          }
        />
        <InfoRow label="Criada em" value={<span className="text-gray-600">{formatDate(room.createdAt)}</span>} />
        <InfoRow label="Questões" value={<span className="font-semibold text-gray-900">{questionCount}</span>} />
        <InfoRow
          label="Status"
          value={
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.textColor}`}>
              <span className={`size-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>
          }
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="shrink-0 text-sm text-gray-400">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}