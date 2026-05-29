// ─── Types ────────────────────────────────────────────────────────────────────
export type RoomStatus = "waiting" | "started" | "finished";

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

// Mirrors room_tb schema + user FK (userId added for the relationship)
export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  currentQuestion: number;
  totalQuestions: number;
  createdAt: string;
  // Relationship: room belongs to a user (host)
  userId: string;
  topic: string;
  participantCount: number;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "user-001",
    username: "rafael_dev",
    email: "rafael@example.com",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "user-002",
    username: "ana_quiz",
    email: "ana@example.com",
    createdAt: "2025-02-14T12:30:00Z",
  },
  {
    id: "user-003",
    username: "leo_mota",
    email: "leo@example.com",
    createdAt: "2025-03-01T09:00:00Z",
  },
];

// ─── Mock Rooms ───────────────────────────────────────────────────────────────
// These mock rooms represent all rooms. Filtering by userId simulates
// "rooms created by logged-in user" vs "other public rooms".



export function formatTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}